const express = require("express");
const router = express.Router();
const { getConnection } = require("../db/connection");

// GET all distinct batches and semesters from dean_list
router.get("/filters/options", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const oracledb = require("oracledb");
    const fmt = { outFormat: oracledb.OUT_FORMAT_OBJECT };

    const [batchRes, semRes] = await Promise.all([
      connection.execute(
        `SELECT DISTINCT b.batch_name 
                 FROM dean_list d
                 JOIN batches b ON d.batch_id = b.batch_id
                 ORDER BY b.batch_name`,
        {},
        fmt,
      ),
      connection.execute(
        `SELECT DISTINCT semester 
                 FROM dean_list 
                 ORDER BY semester`,
        {},
        fmt,
      ),
    ]);

    res.json({
      status: "success",
      batches: batchRes.rows.map((r) => r.BATCH_NAME),
      semesters: semRes.rows.map((r) => r.SEMESTER),
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

router.get("/semester/:semester", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT d.dean_id, u.full_name, s.reg_number,
                    d.cgpa, d.semester, b.batch_name, sec.section_name
             FROM dean_list d
             JOIN students s ON d.student_id = s.student_id
             JOIN users u ON s.user_id = u.user_id
             JOIN batches b ON d.batch_id = b.batch_id
             JOIN sections sec ON d.section_id = sec.section_id
             WHERE d.semester = :semester
             ORDER BY d.cgpa DESC`,
      { semester: req.params.semester },
    );
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET all dean list students
router.get("/", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT d.dean_id, u.full_name, s.reg_number,
                    d.cgpa, d.semester, b.batch_name, sec.section_name
             FROM dean_list d
             JOIN students s ON d.student_id = s.student_id
             JOIN users u ON s.user_id = u.user_id
             JOIN batches b ON d.batch_id = b.batch_id
             JOIN sections sec ON d.section_id = sec.section_id
             ORDER BY d.cgpa DESC`,
    );
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET dean list by semester

// POST regenerate dean list (calls stored procedure)
router.post("/generate/:semester", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    await connection.execute(`BEGIN generate_dean_list(:semester); END;`, {
      semester: req.params.semester,
    });
    res.json({
      status: "success",
      message: `Dean list generated for ${req.params.semester}`,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
