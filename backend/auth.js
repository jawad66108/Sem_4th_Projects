const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { getConnection } = require("../db/connection");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google
router.post("/google", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      status: "error",
      message: "No token provided",
    });
  }

  try {
    // Step 1: Verify the Google token is real
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleEmail = payload.email;
    const googleName = payload.name;

    // Step 2: Check if this email exists in our Oracle DB
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT u.user_id, u.full_name, u.email, r.role_name
                 FROM users u
                 JOIN roles r ON u.role_id = r.role_id
                 WHERE LOWER(u.email) = LOWER(:email)`,
        { email: googleEmail },
      );

      // Step 3: Email not found in database
      if (result.rows.length === 0) {
        return res.status(403).json({
          status: "error",
          message:
            "Access denied. Your Google account is not registered in Rankify Pro.",
        });
      }

      const user = result.rows[0];

      // Step 4: Create a JWT token with user info
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

      // Step 5: Send back the token and user info
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
      message: "Invalid Google token",
    });
  }
});

module.exports = router;
