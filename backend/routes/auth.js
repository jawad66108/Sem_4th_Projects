const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { getConnection } = require("../db/connection");

// POST /api/auth/google
router.post("/google", async (req, res) => {
  const { token, email, name } = req.body;

  if (!token || !email) {
    return res.status(400).json({
      status: "error",
      message: "No token or email provided",
    });
  }

  try {
    // Step 1: Verify token is real by asking Google
    const googleRes = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${token}` } },
    );

    const verifiedEmail = googleRes.data.email;

    // Step 2: Make sure the token email matches what was sent
    if (verifiedEmail.toLowerCase() !== email.toLowerCase()) {
      return res.status(401).json({
        status: "error",
        message: "Token verification failed",
      });
    }

    // Step 3: Look up this email in Oracle
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT u.user_id, u.full_name, u.email, r.role_name
                 FROM users u
                 JOIN roles r ON u.role_id = r.role_id
                 WHERE LOWER(u.email) = LOWER(:email)`,
        { email: verifiedEmail },
      );

      // Step 4: Email not in our database
      if (result.rows.length === 0) {
        return res.status(403).json({
          status: "error",
          message:
            "Access denied. Your account is not registered in Rankify Pro.",
        });
      }

      const user = result.rows[0];

      // Step 5: Create JWT
      const jwtToken = jwt.sign(
        {
          user_id: user.USER_ID,
          full_name: user.FULL_NAME,
          email: user.EMAIL,
          role: user.ROLE_NAME,
        },
        process.env.JWT_SECRET,
        { expiresIn: "8h" },
      );

      // Step 6: Send back success
      res.json({
        status: "success",
        token: jwtToken,
        user: {
          user_id: user.USER_ID,
          full_name: user.FULL_NAME,
          email: user.EMAIL,
          role: user.ROLE_NAME,
        },
      });
    } finally {
      if (connection) await connection.close();
    }
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({
      status: "error",
      message: "Google verification failed",
    });
  }
});

module.exports = router;
