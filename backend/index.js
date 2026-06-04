const express = require("express");
const cors = require("cors");
require("dotenv").config();

// ← ADD THESE TWO LINES HERE, before anything else
const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const aiRoutes = require("./routes/ai");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/students");
const deanListRoutes = require("./routes/deanlist");
const projectRoutes = require("./routes/projects");
const facultyRoutes = require("./routes/faculty");

// Use routes
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/deanlist", deanListRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/faculty", facultyRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Rankify Pro API is running!",
    version: "1.0.0",
    status: "success",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Rankify Pro Server running on port ${PORT}`),
);
