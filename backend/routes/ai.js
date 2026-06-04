const express = require("express");
const router = express.Router();
const axios = require("axios");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const path = require("path");
const fs = require("fs");
const oracledb = require("oracledb");
const { getConnection } = require("../db/connection");

// ─── Multer Setup (PDF uploads) ───────────────────────────
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `project-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF and Word documents are allowed"));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ─── Gemini AI Review Function ────────────────────────────
async function reviewWithGemini(title, description, pdfText = "") {
  const contentToReview = pdfText
    ? `Project Title: ${title}\n\nProject Description: ${description}\n\nFull Report Content:\n${pdfText.substring(0, 8000)}`
    : `Project Title: ${title}\n\nProject Description: ${description}`;

  const prompt = `You are an experienced academic project evaluator at a university.

Review the following student project and provide a structured evaluation.

${contentToReview}

Respond in this EXACT JSON format only, no extra text, no markdown backticks:
{"score": 78, "strengths": "Point 1 about what the project does well. Point 2 about another strength. Point 3 about technical or creative merit.", "weaknesses": "Point 1 about what needs improvement. Point 2 about gaps or missing elements. Point 3 about areas to develop further."}

Rules:
- score must be a number between 0 and 100
- strengths must be 2-4 sentences highlighting genuine positives
- weaknesses must be 2-4 sentences with constructive criticism
- Be specific to this project, not generic`;

  const geminiRes = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] },
  );

  const rawText = geminiRes.data.candidates[0].content.parts[0].text;
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

// ─── Save Review to DB ────────────────────────────────────
async function saveReviewToDB(
  connection,
  projectId,
  score,
  strengths,
  weaknesses,
) {
  await connection.execute(
    `UPDATE projects
     SET ai_score    = :ai_score,
         final_score = (:ai_score * 0.6),
         status      = 'REVIEWED'
     WHERE project_id = :project_id`,
    { ai_score: Number(score), project_id: Number(projectId) },
    { autoCommit: false },
  );

  await connection.execute(
    `DELETE FROM reviews WHERE project_id = :project_id`,
    { project_id: Number(projectId) },
    { autoCommit: false },
  );

  await connection.execute(
    `INSERT INTO reviews (project_id, strengths, weaknesses)
     VALUES (:project_id, :strengths, :weaknesses)`,
    { project_id: Number(projectId), strengths, weaknesses },
    { autoCommit: false },
  );
}

// ─── POST /api/ai/submit-project ─────────────────────────
router.post("/submit-project", upload.single("file"), async (req, res) => {
  const { student_id, title, description, batch_id, section_id, semester } =
    req.body;

  if (!title || !description || !student_id) {
    return res.status(400).json({
      status: "error",
      message: "Title, description, and student_id are required",
    });
  }

  let filePath = null;
  let pdfText = "";

  if (req.file) {
    filePath = req.file.filename;
    try {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      pdfText = pdfData.text || "";
    } catch (e) {
      console.warn("PDF parse warning:", e.message);
    }
  }

  let connection;
  try {
    const review = await reviewWithGemini(title, description, pdfText);

    connection = await getConnection();

    const projectResult = await connection.execute(
      `INSERT INTO projects
         (title, description, student_id, batch_id, section_id, semester, file_path, status)
       VALUES
         (:title, :description, :student_id, :batch_id, :section_id, :semester, :file_path, 'REVIEWED')
       RETURNING project_id INTO :project_id`,
      {
        title,
        description,
        student_id: Number(student_id),
        batch_id: Number(batch_id),
        section_id: Number(section_id),
        semester: semester || "Fall-2025",
        file_path: filePath,
        project_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false },
    );

    const newProjectId = projectResult.outBinds.project_id[0];
    await saveReviewToDB(
      connection,
      newProjectId,
      review.score,
      review.strengths,
      review.weaknesses,
    );
    await connection.commit();

    res.json({
      status: "success",
      message: "Project submitted and reviewed by AI",
      project_id: newProjectId,
      score: review.score,
      strengths: review.strengths,
      weaknesses: review.weaknesses,
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Submit project error:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ─── POST /api/ai/score-project ──────────────────────────
router.post("/score-project", async (req, res) => {
  const { project_id, title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ status: "error", message: "Title and description are required" });
  }

  let pdfText = "";
  if (project_id) {
    let connection;
    try {
      connection = await getConnection();
      const fpRes = await connection.execute(
        `SELECT file_path FROM projects WHERE project_id = :id`,
        { id: Number(project_id) },
      );
      if (fpRes.rows.length > 0 && fpRes.rows[0].FILE_PATH) {
        const fullPath = path.join(
          __dirname,
          "../uploads",
          fpRes.rows[0].FILE_PATH,
        );
        if (fs.existsSync(fullPath)) {
          const buf = fs.readFileSync(fullPath);
          const parsed = await pdfParse(buf);
          pdfText = parsed.text || "";
        }
      }
    } catch (e) {
      console.warn("PDF load warning:", e.message);
    } finally {
      if (connection) await connection.close();
    }
  }

  try {
    const review = await reviewWithGemini(title, description, pdfText);

    if (project_id) {
      let connection;
      try {
        connection = await getConnection();
        await saveReviewToDB(
          connection,
          project_id,
          review.score,
          review.strengths,
          review.weaknesses,
        );
        await connection.commit();
      } finally {
        if (connection) await connection.close();
      }
    }

    res.json({
      status: "success",
      score: review.score,
      strengths: review.strengths,
      weaknesses: review.weaknesses,
    });
  } catch (err) {
    console.error("Score project error:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ─── POST /api/ai/score-all ───────────────────────────────
router.post("/score-all", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const result = await connection.execute(
      `SELECT project_id, title, description, file_path
       FROM projects WHERE ai_score IS NULL ORDER BY project_id`,
    );

    const projects = result.rows;

    if (projects.length === 0) {
      return res.json({
        status: "success",
        message: "All projects already scored!",
        scored: 0,
      });
    }

    let scored = 0;
    let failed = 0;

    for (const proj of projects) {
      try {
        let pdfText = "";
        if (proj.FILE_PATH) {
          const fullPath = path.join(__dirname, "../uploads", proj.FILE_PATH);
          if (fs.existsSync(fullPath)) {
            const buf = fs.readFileSync(fullPath);
            const parsed = await pdfParse(buf);
            pdfText = parsed.text || "";
          }
        }

        const review = await reviewWithGemini(
          proj.TITLE,
          proj.DESCRIPTION,
          pdfText,
        );
        await saveReviewToDB(
          connection,
          proj.PROJECT_ID,
          review.score,
          review.strengths,
          review.weaknesses,
        );
        await connection.commit();
        scored++;

        await new Promise((r) => setTimeout(r, 35000));
      } catch (e) {
        console.error(`Failed project ${proj.PROJECT_ID}:`, e.message);
        failed++;
      }
    }

    res.json({
      status: "success",
      message: `Scored ${scored} projects. ${failed} failed.`,
      scored,
      failed,
    });
  } catch (err) {
    console.error("Score-all error:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ─── GET /api/ai/review/:project_id ──────────────────────
router.get("/review/:project_id", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT r.review_id, r.strengths, r.weaknesses,
              TO_CHAR(r.reviewed_at, 'DD-Mon-YYYY HH:MI AM') AS reviewed_at,
              p.ai_score, p.final_score, p.title
       FROM reviews r
       JOIN projects p ON r.project_id = p.project_id
       WHERE r.project_id = :project_id`,
      { project_id: Number(req.params.project_id) },
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "No review found for this project" });
    }

    res.json({ status: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
