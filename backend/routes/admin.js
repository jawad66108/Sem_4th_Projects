const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const { getConnection } = require("../db/connection");

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`
      SELECT
        (SELECT COUNT(*) FROM students)                        AS total_students,
        (SELECT COUNT(*) FROM faculty)                         AS total_faculty,
        (SELECT COUNT(*) FROM users WHERE role_id = 1)        AS total_admins,
        (SELECT COUNT(*) FROM projects WHERE status = 'PENDING') AS pending_projects
      FROM DUAL
    `);
    const row = result.rows[0];
    res.json({
      status: "success",
      data: {
        students: row.TOTAL_STUDENTS,
        faculty: row.TOTAL_FACULTY,
        admins: row.TOTAL_ADMINS,
        pendingProjects: row.PENDING_PROJECTS,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /api/admin/audit
router.get("/audit", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `
  SELECT log_id, table_name, operation,
         old_value, new_value, changed_by,
         TO_CHAR(changed_at, 'DD-Mon-YYYY HH:MI AM') AS changed_at
  FROM audit_logs
  ORDER BY log_id DESC
  FETCH FIRST 5 ROWS ONLY
`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    res.json({
      status: "success",
      data: result.rows.map((r) => ({
        LOG_ID: r.LOG_ID,
        TABLE_NAME: r.TABLE_NAME,
        OPERATION: r.OPERATION,
        OLD_VALUE: r.OLD_VALUE,
        NEW_VALUE: r.NEW_VALUE,
        CHANGED_BY: r.CHANGED_BY,
        CHANGED_AT: r.CHANGED_AT,
      })),
    });
  } catch (err) {
    console.error("AUDIT ERROR:", err.message);
    res.status(500).json({ status: "error", message: String(err.message) });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /api/admin/pending-projects
router.get("/pending-projects", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `
  SELECT p.project_id, p.title, p.description,
         p.ai_score, p.final_score, p.status,
         p.semester, p.members, p.github_link,
         u.full_name, b.batch_name, sec.section_name,
         TO_CHAR(p.submitted_at, 'DD-Mon-YYYY HH:MI AM') AS submitted_at
  FROM projects p
  JOIN students s   ON p.student_id  = s.student_id
  JOIN users u      ON s.user_id     = u.user_id
  JOIN batches b    ON p.batch_id    = b.batch_id
  JOIN sections sec ON p.section_id  = sec.section_id
  WHERE p.status IN ('PENDING', 'REVIEWED')
  ORDER BY p.submitted_at DESC
`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );
    res.json({
      status: "success",
      data: result.rows.map((r) => ({
        PROJECT_ID: r.PROJECT_ID,
        TITLE: r.TITLE,
        DESCRIPTION: r.DESCRIPTION,
        AI_SCORE: r.AI_SCORE,
        FINAL_SCORE: r.FINAL_SCORE,
        STATUS: r.STATUS,
        SEMESTER: r.SEMESTER,
        MEMBERS: r.MEMBERS,
        GITHUB_LINK: r.GITHUB_LINK,
        FULL_NAME: r.FULL_NAME,
        BATCH_NAME: r.BATCH_NAME,
        SECTION_NAME: r.SECTION_NAME,
        SUBMITTED_AT: r.SUBMITTED_AT,
      })),
    });
  } catch (err) {
    console.error("PENDING ERROR:", err.message);
    res.status(500).json({ status: "error", message: String(err.message) });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /api/admin/student-by-reg/:reg
router.get("/student-by-reg/:reg", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT s.student_id, u.full_name, s.reg_number,
              s.cgpa, b.batch_name, sec.section_name
       FROM students s
       JOIN users u    ON s.user_id    = u.user_id
       JOIN batches b  ON s.batch_id   = b.batch_id
       JOIN sections sec ON s.section_id = sec.section_id
       WHERE UPPER(s.reg_number) = UPPER(:reg)`,
      { reg: req.params.reg },
    );
    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ status: "error", message: "Student not found" });
    res.json({ status: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// PUT /api/admin/update-cgpa
router.put("/update-cgpa", async (req, res) => {
  let connection;
  const { student_id, semester, sgpa, cgpa } = req.body;
  try {
    connection = await getConnection();

    await connection.execute(
      `UPDATE students SET cgpa = :cgpa WHERE student_id = :student_id`,
      { cgpa: Number(cgpa), student_id: Number(student_id) },
      { autoCommit: false },
    );

    await connection.execute(
      `INSERT INTO cgpa_records (student_id, semester, sgpa, cgpa)
       VALUES (:student_id, :semester, :sgpa, :cgpa)`,
      {
        student_id: Number(student_id),
        semester,
        sgpa: Number(sgpa),
        cgpa: Number(cgpa),
      },
      { autoCommit: false },
    );

    await connection.execute(
      `BEGIN generate_dean_list(:semester); END;`,
      { semester },
      { autoCommit: false },
    );

    await connection.commit();
    res.json({
      status: "success",
      message: `CGPA updated. Dean list regenerated for ${semester}.`,
      deanListUpdated: true,
    });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /api/admin/download-deanlist/:semester
router.get("/download-deanlist/:semester", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT u.full_name, s.reg_number, d.cgpa,
              d.semester, b.batch_name, sec.section_name
       FROM dean_list d
       JOIN students s   ON d.student_id  = s.student_id
       JOIN users u      ON s.user_id     = u.user_id
       JOIN batches b    ON d.batch_id    = b.batch_id
       JOIN sections sec ON d.section_id  = sec.section_id
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

// GET /api/admin/users
router.get("/users", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`
      SELECT u.user_id, u.full_name, u.email,
             r.role_name, u.created_at,
             CASE WHEN r.role_name = 'student' THEN
               (SELECT s.reg_number FROM students s WHERE s.user_id = u.user_id)
             ELSE NULL END AS reg_number,
             CASE WHEN r.role_name = 'student' THEN
               (SELECT b.batch_name FROM students s
                JOIN batches b ON s.batch_id = b.batch_id
                WHERE s.user_id = u.user_id)
             ELSE NULL END AS batch_name,
             CASE WHEN r.role_name = 'student' THEN
               (SELECT s.cgpa FROM students s WHERE s.user_id = u.user_id)
             ELSE NULL END AS cgpa
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      ORDER BY r.role_id, u.full_name
    `);
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /api/admin/batches
router.get("/batches", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT batch_id, batch_name, dept_id FROM batches ORDER BY batch_id`,
    );
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /api/admin/sections
router.get("/sections", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(
      `SELECT sec.section_id, sec.section_name, b.batch_name
       FROM sections sec
       JOIN batches b ON sec.batch_id = b.batch_id
       ORDER BY sec.section_id`,
    );
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ✅ FIXED: POST /api/admin/add-student
router.post("/add-student", async (req, res) => {
  let connection;
  const { full_name, email, reg_number, batch_id, section_id, cgpa } = req.body;
  try {
    connection = await getConnection();

    // ✅ FIX: use oracledb.BIND_OUT and oracledb.NUMBER (not raw magic numbers)
    const userResult = await connection.execute(
      `INSERT INTO users (full_name, email, password_hash, role_id)
       VALUES (:full_name, :email, 'google_auth', 3)
       RETURNING user_id INTO :user_id`,
      {
        full_name,
        email,
        user_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false },
    );
    const newUserId = userResult.outBinds.user_id[0];

    // ✅ FIX: parse numbers so Oracle doesn't get strings
    await connection.execute(
      `INSERT INTO students (user_id, reg_number, section_id, batch_id, dept_id, cgpa)
       VALUES (:user_id, :reg_number, :section_id, :batch_id, 1, :cgpa)`,
      {
        user_id: newUserId,
        reg_number,
        section_id: Number(section_id),
        batch_id: Number(batch_id),
        cgpa: Number(cgpa) || 0,
      },
      { autoCommit: false },
    );

    await connection.commit();
    res.json({ status: "success", message: "Student added successfully" });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// ✅ FIXED: POST /api/admin/add-faculty
router.post("/add-faculty", async (req, res) => {
  let connection;
  const { full_name, email, designation, dept_id } = req.body;
  try {
    connection = await getConnection();

    // ✅ FIX: use oracledb.BIND_OUT and oracledb.NUMBER
    const userResult = await connection.execute(
      `INSERT INTO users (full_name, email, password_hash, role_id)
       VALUES (:full_name, :email, 'google_auth', 2)
       RETURNING user_id INTO :user_id`,
      {
        full_name,
        email,
        user_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false },
    );
    const newUserId = userResult.outBinds.user_id[0];

    await connection.execute(
      `INSERT INTO faculty (user_id, dept_id, designation)
       VALUES (:user_id, :dept_id, :designation)`,
      {
        user_id: newUserId,
        dept_id: Number(dept_id) || 1,
        designation,
      },
      { autoCommit: false },
    );

    await connection.commit();
    res.json({ status: "success", message: "Faculty added successfully" });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();

    const roleRes = await connection.execute(
      `SELECT r.role_name FROM users u JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = :id`,
      { id: Number(req.params.id) },
    );

    if (roleRes.rows.length === 0)
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });

    const role = roleRes.rows[0].ROLE_NAME;

    if (role === "student") {
      await connection.execute(
        `DELETE FROM students WHERE user_id = :id`,
        { id: Number(req.params.id) },
        { autoCommit: false },
      );
    } else if (role === "faculty") {
      await connection.execute(
        `DELETE FROM faculty WHERE user_id = :id`,
        { id: Number(req.params.id) },
        { autoCommit: false },
      );
    }

    await connection.execute(
      `DELETE FROM users WHERE user_id = :id`,
      { id: Number(req.params.id) },
      { autoCommit: false },
    );

    await connection.commit();
    res.json({ status: "success", message: "User deleted successfully" });
  } catch (err) {
    if (connection) await connection.rollback();
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST /api/admin/add-batch
router.post("/add-batch", async (req, res) => {
  let connection;
  const { batch_name, dept_id, start_year, end_year } = req.body;
  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO batches (batch_name, dept_id, start_year, end_year)
       VALUES (:batch_name, :dept_id, :start_year, :end_year)`,
      {
        batch_name,
        dept_id: Number(dept_id) || 1,
        start_year: Number(start_year),
        end_year: Number(end_year),
      },
      { autoCommit: true },
    );
    res.json({ status: "success", message: `Batch ${batch_name} added` });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST /api/admin/add-section
router.post("/add-section", async (req, res) => {
  let connection;
  const { section_name, batch_id } = req.body;
  try {
    connection = await getConnection();
    await connection.execute(
      `INSERT INTO sections (section_name, batch_id)
       VALUES (:section_name, :batch_id)`,
      { section_name, batch_id: Number(batch_id) },
      { autoCommit: true },
    );
    res.json({ status: "success", message: `Section ${section_name} added` });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// GET /api/admin/all-projects
router.get("/all-projects", async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`
      SELECT p.project_id, p.title, p.description,
             p.ai_score, p.final_score, p.status,
             p.semester, u.full_name,
             b.batch_name, sec.section_name,
             TO_CHAR(p.submitted_at, 'DD-Mon-YYYY') AS submitted_at
      FROM projects p
      JOIN students s   ON p.student_id  = s.student_id
      JOIN users u      ON s.user_id     = u.user_id
      JOIN batches b    ON p.batch_id    = b.batch_id
      JOIN sections sec ON p.section_id  = sec.section_id
      ORDER BY p.submitted_at DESC
    `);
    res.json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// POST /api/admin/generate-deanlist
router.post("/generate-deanlist", async (req, res) => {
  let connection;
  const { semester } = req.body;
  try {
    connection = await getConnection();
    await connection.execute(
      `BEGIN generate_dean_list(:semester); END;`,
      { semester },
      { autoCommit: true },
    );
    res.json({
      status: "success",
      message: `Dean list generated for ${semester}`,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

// PUT /api/admin/projects/:id/status
// Replace this route in your admin.js

router.put("/projects/:id/status", async (req, res) => {
  let connection;
  const { status } = req.body;
  const projectId = Number(req.params.id);

  try {
    connection = await getConnection();

    await connection.execute(
      `UPDATE projects SET status = :status WHERE project_id = :id`,
      { status, id: projectId },
      { autoCommit: true },
    );

    return res.json({
      status: "success",
      message: `Project ${status}`,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
