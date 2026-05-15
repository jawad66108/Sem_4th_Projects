const express = require('express');
const router = express.Router();
const { getConnection } = require('../db/connection');

// GET all faculty
router.get('/', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT f.faculty_id, u.full_name, u.email,
                    f.designation, d.dept_name
             FROM faculty f
             JOIN users u ON f.user_id = u.user_id
             JOIN departments d ON f.dept_id = d.dept_id
             ORDER BY f.faculty_id`
        );
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// GET all students (faculty view)
router.get('/students', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT s.student_id, u.full_name, s.reg_number,
                    s.cgpa, b.batch_name, sec.section_name, d.dept_name
             FROM students s
             JOIN users u ON s.user_id = u.user_id
             JOIN batches b ON s.batch_id = b.batch_id
             JOIN sections sec ON s.section_id = sec.section_id
             JOIN departments d ON s.dept_id = d.dept_id
             ORDER BY s.cgpa DESC`
        );
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// POST review a project
router.post('/review', async (req, res) => {
    let connection;
    const { project_id, faculty_id, rating, comments, is_approved } = req.body;
    try {
        connection = await getConnection();
        await connection.execute(
            `INSERT INTO project_reviews 
                (project_id, faculty_id, rating, comments, is_approved)
             VALUES 
                (:project_id, :faculty_id, :rating, :comments, :is_approved)`,
            { project_id, faculty_id, rating, comments, is_approved },
            { autoCommit: true }
        );

        // Update project status
        await connection.execute(
            `UPDATE projects SET status = 'REVIEWED'
             WHERE project_id = :project_id`,
            { project_id },
            { autoCommit: true }
        );

        res.json({ status: 'success', message: 'Project reviewed successfully' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// GET projects pending review
router.get('/pending-reviews', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT p.project_id, p.title, p.ai_score,
                    p.status, u.full_name, b.batch_name
             FROM projects p
             JOIN students s ON p.student_id = s.student_id
             JOIN users u ON s.user_id = u.user_id
             JOIN batches b ON p.batch_id = b.batch_id
             WHERE p.status = 'PENDING'
             ORDER BY p.submitted_at DESC`
        );
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;