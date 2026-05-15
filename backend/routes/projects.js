const express = require('express');
const router = express.Router();
const { getConnection } = require('../db/connection');

// GET all projects
router.get('/', async (req, res) => {
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
             ORDER BY p.final_score DESC`
        );
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// GET top projects by batch
router.get('/top/:batch_id', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT p.project_id, p.title, p.ai_score,
                    p.final_score, p.status, u.full_name,
                    sec.section_name
             FROM projects p
             JOIN students s ON p.student_id = s.student_id
             JOIN users u ON s.user_id = u.user_id
             JOIN sections sec ON p.section_id = sec.section_id
             WHERE p.batch_id = :batch_id
             ORDER BY p.final_score DESC
             FETCH FIRST 6 ROWS ONLY`,
            { batch_id: req.params.batch_id }
        );
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// GET single project by ID
router.get('/:id', async (req, res) => {
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
            { id: req.params.id }
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Project not found' });
        }
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// POST add new project
router.post('/', async (req, res) => {
    let connection;
    const { title, description, student_id, batch_id, section_id, semester } = req.body;
    try {
        connection = await getConnection();
        await connection.execute(
            `INSERT INTO projects 
                (title, description, student_id, batch_id, section_id, semester)
             VALUES 
                (:title, :description, :student_id, :batch_id, :section_id, :semester)`,
            { title, description, student_id, batch_id, section_id, semester },
            { autoCommit: true }
        );
        res.json({ status: 'success', message: 'Project submitted successfully' });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;