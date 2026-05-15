const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Rankify Pro API is running!',
        version: '1.0.0',
        status: 'success'
    });
});

// Import routes
const studentRoutes = require('./routes/students');
const deanListRoutes = require('./routes/deanlist');
const projectRoutes = require('./routes/projects');
const facultyRoutes = require('./routes/faculty');

// Use routes
app.use('/api/students', studentRoutes);
app.use('/api/deanlist', deanListRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/faculty', facultyRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Rankify Pro Server running on port ${PORT}`);
});