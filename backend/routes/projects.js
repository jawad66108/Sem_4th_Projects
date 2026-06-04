const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { getConnection } = require("../db/connection");

// Multer config — save to /uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    file.mimetype === "application/pdf"
      ? cb(null, true)
      : cb(new Error("Only PDF files are allowed"));
  },
});

// GET all projects
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT p.project_id, p.title, p.description,
              p.ai_score, p.final_score, p.status,
              u.full_name, b.batch_name, sec.section_name
       FROM projects p
       JOIN students s ON p.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       JOIN batches b ON p.batch_id = b.batch_id
       JOIN sections sec ON p.section_id = sec.section_id
       ORDER BY p.final_score DESC`,
    );
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET top projects by batch
router.get("/top/:batch_id", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT p.project_id, p.title, p.description,
              p.ai_score, p.final_score, p.status,
              p.members, p.github_link,
              u.full_name, sec.section_name
       FROM projects p
       JOIN students s ON p.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       JOIN sections sec ON p.section_id = sec.section_id
       WHERE p.batch_id = :batch_id
       AND p.status = 'APPROVED'
       ORDER BY p.final_score DESC NULLS LAST
       FETCH FIRST 6 ROWS ONLY`,
      { batch_id: Number(req.params.batch_id) },
    );
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET all projects for admin
router.get("/all-projects", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT p.project_id, p.title, p.description,
              p.ai_score, p.final_score, p.status,
              p.semester, p.submitted_at,
              u.full_name, b.batch_name, sec.section_name
       FROM projects p
       JOIN students s ON p.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       JOIN batches b ON p.batch_id = b.batch_id
       JOIN sections sec ON p.section_id = sec.section_id
       ORDER BY p.submitted_at DESC`,
    );
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET all batches
router.get("/batches", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT batch_id, batch_name FROM batches ORDER BY batch_name`,
    );
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET single project by ID
router.get("/:id", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT p.project_id, p.title, p.description,
              p.ai_score, p.final_score, p.status,
              u.full_name, b.batch_name, sec.section_name
       FROM projects p
       JOIN students s ON p.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       JOIN batches b ON p.batch_id = b.batch_id
       JOIN sections sec ON p.section_id = sec.section_id
       WHERE p.project_id = :id`,
      { id: req.params.id },
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Project not found" });
    }
    res.json({ status: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST add new project — scoring handled entirely by Oracle trigger
router.post("/", upload.single("report_file"), async (req, res) => {
  let connection;
  const {
    title,
    description,
    student_id,
    batch_id,
    section_id,
    semester,
    members,
    github_link,
  } = req.body;
  const filePath = req.file ? req.file.path : null;

  console.log("=== PROJECT SUBMISSION ===");
  console.log("Title:", title);
  console.log("GitHub:", github_link);
  console.log("File:", filePath);
  console.log("Scoring handled by Oracle trigger");
  console.log("==========================");

  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO projects 
        (title, description, student_id, batch_id, section_id, semester,
         report_file, members, github_link)
       VALUES 
        (:title, :description, :student_id, :batch_id, :section_id, :semester,
         :report_file, :members, :github_link)`,
      {
        title,
        description,
        student_id: Number(student_id),
        batch_id: Number(batch_id),
        section_id: Number(section_id),
        semester,
        report_file: filePath,
        members: members || null,
        github_link: github_link || null,
      },
      { autoCommit: true },
    );
    res.json({
      status: "success",
      message: "Project submitted successfully",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// PUT update project status
router.put("/:id/status", async (req, res) => {
  let connection;
  const { status } = req.body;
  try {
    connection = await getConnection();
    await connection.execute(
      `UPDATE projects SET status = :status WHERE project_id = :id`,
      { status, id: req.params.id },
      { autoCommit: true },
    );
    res.json({ status: "success", message: `Project ${status}` });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
