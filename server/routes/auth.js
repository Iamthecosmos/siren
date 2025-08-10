const express = require("express");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { body, validationResult } = require("express-validator");
const { runQuery, getQuery } = require("../database/init");
const { generateToken, authenticateToken } = require("../middleware/auth");
const { AppError } = require("../middleware/errorHandler");

const router = express.Router();

// Validation rules
const registerValidation = [
  body("username")
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Username must be 3-30 characters and contain only letters, numbers, and underscores",
    ),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must be at least 8 characters with uppercase, lowercase, and number",
    ),
  body("fullName")
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage(
      "Full name must be 2-100 characters and contain only letters and spaces",
    ),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

// POST /api/auth/register
router.post("/register", registerValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Please check your input data",
        details: errors.array(),
      });
    }

    const { username, email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await getQuery(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username],
    );

    if (existingUser) {
      return res.status(409).json({
        error: "User already exists",
        message: "A user with this email or username already exists",
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userUuid = uuidv4();
    const result = await runQuery(
      `INSERT INTO users (uuid, username, email, password_hash, full_name) 
       VALUES (?, ?, ?, ?, ?)`,
      [userUuid, username, email, passwordHash, fullName],
    );

    // Generate token
    const token = generateToken(result.id);

    // Update last login
    await runQuery(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [result.id],
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: result.id,
        uuid: userUuid,
        username,
        email,
        fullName,
        isVerified: false,
        isAdmin: false,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post("/login", loginValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Please check your input data",
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await getQuery(
      "SELECT id, uuid, username, email, password_hash, full_name, is_verified, is_admin FROM users WHERE email = ?",
      [email],
    );

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Update last login
    await runQuery(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [user.id],
    );

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        isVerified: user.is_verified,
        isAdmin: user.is_admin,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me - Get current user profile
router.get("/me", authenticateToken, async (req, res, next) => {
  try {
    const user = await getQuery(
      `SELECT id, uuid, username, email, full_name, avatar_url, is_verified, is_admin, 
              created_at, last_login FROM users WHERE id = ?`,
      [req.user.id],
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "User profile could not be found",
      });
    }

    // Get user statistics
    const reportCount = await getQuery(
      "SELECT COUNT(*) as count FROM community_reports WHERE user_id = ?",
      [user.id],
    );

    const voiceCount = await getQuery(
      "SELECT COUNT(*) as count FROM voice_contributions WHERE user_id = ?",
      [user.id],
    );

    const verificationCount = await getQuery(
      "SELECT COUNT(*) as count FROM report_verifications WHERE user_id = ?",
      [user.id],
    );

    res.json({
      user: {
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
        isAdmin: user.is_admin,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
      statistics: {
        reportsSubmitted: reportCount?.count || 0,
        voicesContributed: voiceCount?.count || 0,
        reportsVerified: verificationCount?.count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post("/logout", authenticateToken, async (req, res, next) => {
  try {
    // In a more sophisticated implementation, you could maintain a blacklist of tokens
    // For now, we'll just send a success response
    res.json({
      message: "Logout successful",
      hint: "Please remove the token from your client storage",
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile - Update user profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("fullName")
      .optional()
      .isLength({ min: 2, max: 100 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage(
        "Full name must be 2-100 characters and contain only letters and spaces",
      ),
    body("username")
      .optional()
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username must be 3-30 characters and contain only letters, numbers, and underscores",
      ),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Please check your input data",
          details: errors.array(),
        });
      }

      const { fullName, username } = req.body;
      const updates = [];
      const values = [];

      if (fullName) {
        updates.push("full_name = ?");
        values.push(fullName);
      }

      if (username) {
        // Check if username is already taken
        const existingUser = await getQuery(
          "SELECT id FROM users WHERE username = ? AND id != ?",
          [username, req.user.id],
        );

        if (existingUser) {
          return res.status(409).json({
            error: "Username taken",
            message: "This username is already taken by another user",
          });
        }

        updates.push("username = ?");
        values.push(username);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          error: "No updates provided",
          message: "Please provide at least one field to update",
        });
      }

      updates.push("updated_at = CURRENT_TIMESTAMP");
      values.push(req.user.id);

      await runQuery(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );

      res.json({
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
