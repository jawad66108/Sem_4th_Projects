import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Login from "./Login.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        {/* Faculty and Admin coming next */}
        <Route
          path="/faculty/dashboard"
          element={
            <div style={{ padding: 40 }}>
              <h1>Faculty Dashboard — Coming Soon</h1>
            </div>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <div style={{ padding: 40 }}>
              <h1>Admin Dashboard — Coming Soon</h1>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
