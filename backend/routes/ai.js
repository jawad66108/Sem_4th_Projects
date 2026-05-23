const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getConnection } = require("../db/connection");

router.post("/score-project", async (req, res) => {
  const { project_id, title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      status: "error",
      message: "Title and description are required",
    });
  }

  try {
    const prompt = `
You are an academic project evaluator for a university.
Score this student project out of 100 based on:
- Innovation and creativity (25 points)
- Technical complexity (25 points)
- Real world usefulness (25 points)
- Clarity of description (25 points)

Project Title: ${title}
Project Description: ${description}

Reply in this exact JSON format only, no extra text:
{"score": 85, "feedback": "Brief one sentence feedback here"}
        `;

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
    );

    const rawText = geminiRes.data.candidates[0].content.parts[0].text;
    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const aiScore = parsed.score;
    const feedback = parsed.feedback;

    if (project_id) {
      let connection;
      try {
        connection = await getConnection();
        await connection.execute(
          `UPDATE projects
                     SET ai_score    = :ai_score,
                         final_score = (:ai_score * 0.6)
                     WHERE project_id = :project_id`,
          { ai_score: aiScore, project_id },
          { autoCommit: true },
        );
      } finally {
        if (connection) await connection.close();
      }
    }

    res.json({
      status: "success",
      score: aiScore,
      feedback: feedback,
    });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.status(500).json({
      status: "error",
      message: "AI scoring failed",
    });
  }
});

module.exports = router;
