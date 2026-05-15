const express = require('express');
const router = express.Router();
const { getConnection } = require('../db/connection');

// GET all students with CGPA and rank
router.get('/', async (req, res) => {
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

// GET single student by ID
router.get('/:id', async (req, res) => {
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
             WHERE s.student_id = :id`,
            { id: req.params.id }
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Student not found' });
        }
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

// GET batch statistics (calls stored procedure)
router.get('/batch/:batch_id/stats', async (req, res) => {
    let connection;
    try {
        connection = await getConnection();
        const result = await connection.execute(
            `SELECT AVG(cgpa) AS avg_cgpa, 
                    COUNT(*) AS total_students,
                    MAX(cgpa) AS max_cgpa, 
                    MIN(cgpa) AS min_cgpa
             FROM students 
             WHERE batch_id = :batch_id`,
            { batch_id: req.params.batch_id }
        );
        res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    } finally {
        if (connection) await connection.close();
    }
});

module.exports = router;