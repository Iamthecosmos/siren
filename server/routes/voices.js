const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const { body, query, validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");
const { runQuery, getQuery, allQuery } = require("../database/init");
const {
  authenticateToken,
  optionalAuth,
  requireAdmin,
} = require("../middleware/auth");
const { AppError } = require("../middleware/errorHandler");

const router = express.Router();

// Configure multer for voice file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads/voices");
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "audio/mp4",
    "audio/m4a",
    "audio/ogg",
    "audio/webm",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError("Invalid file type. Only audio files are allowed.", 400),
      false,
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 1,
  },
});

// Validation rules
const createVoiceValidation = [
  body("title")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must be less than 500 characters"),
  body("voiceType")
    .isIn(["emergency", "casual", "professional", "family", "custom"])
    .withMessage("Invalid voice type"),
  body("gender")
    .optional()
    .isIn(["male", "female", "non-binary", "other"])
    .withMessage("Invalid gender"),
  body("ageRange")
    .optional()
    .isIn(["child", "teen", "adult", "senior"])
    .withMessage("Invalid age range"),
  body("accent")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Accent must be less than 50 characters"),
  body("language")
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage("Language code must be 2-5 characters"),
];

const rateVoiceValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("review")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Review must be less than 500 characters"),
];

// GET /api/voices - Get voice library
router.get(
  "/",
  optionalAuth,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    query("type")
      .optional()
      .isIn(["emergency", "casual", "professional", "family", "custom"]),
    query("gender").optional().isIn(["male", "female", "non-binary", "other"]),
    query("ageRange").optional().isIn(["child", "teen", "adult", "senior"]),
    query("language").optional().isLength({ min: 2, max: 5 }),
    query("sort").optional().isIn(["recent", "popular", "rating", "downloads"]),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;

      let whereConditions = ["is_approved = ?"];
      let queryParams = [true]; // Only show approved voices

      // Filter by voice type
      if (req.query.type) {
        whereConditions.push("voice_type = ?");
        queryParams.push(req.query.type);
      }

      // Filter by gender
      if (req.query.gender) {
        whereConditions.push("gender = ?");
        queryParams.push(req.query.gender);
      }

      // Filter by age range
      if (req.query.ageRange) {
        whereConditions.push("age_range = ?");
        queryParams.push(req.query.ageRange);
      }

      // Filter by language
      if (req.query.language) {
        whereConditions.push("language = ?");
        queryParams.push(req.query.language);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Determine sort order
      let orderClause = "ORDER BY created_at DESC"; // Default: recent
      switch (req.query.sort) {
        case "popular":
          orderClause = "ORDER BY download_count DESC, rating_average DESC";
          break;
        case "rating":
          orderClause = "ORDER BY rating_average DESC, rating_count DESC";
          break;
        case "downloads":
          orderClause = "ORDER BY download_count DESC";
          break;
      }

      // Get total count
      const countQuery = `
      SELECT COUNT(*) as total 
      FROM voice_contributions 
      ${whereClause}
    `;
      const countResult = await getQuery(countQuery, queryParams);
      const total = countResult.total;

      // Get voices with user information
      const voicesQuery = `
      SELECT 
        v.id, v.uuid, v.title, v.description, v.voice_type, v.gender,
        v.age_range, v.accent, v.language, v.file_path, v.file_size,
        v.duration, v.format, v.is_featured, v.download_count,
        v.rating_average, v.rating_count, v.created_at,
        u.username, u.is_verified as user_verified
      FROM voice_contributions v
      JOIN users u ON v.user_id = u.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

      const voices = await allQuery(voicesQuery, [
        ...queryParams,
        limit,
        offset,
      ]);

      // Process voices
      const processedVoices = voices.map((voice) => ({
        id: voice.uuid,
        title: voice.title,
        description: voice.description,
        voiceType: voice.voice_type,
        gender: voice.gender,
        ageRange: voice.age_range,
        accent: voice.accent,
        language: voice.language,
        fileUrl: `/uploads/voices/${path.basename(voice.file_path)}`,
        fileSize: voice.file_size,
        duration: voice.duration,
        format: voice.format,
        isFeatured: voice.is_featured,
        downloadCount: voice.download_count,
        rating: {
          average: voice.rating_average,
          count: voice.rating_count,
        },
        createdAt: voice.created_at,
        contributor: {
          username: voice.username,
          isVerified: voice.user_verified,
        },
      }));

      res.json({
        voices: processedVoices,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        filters: {
          type: req.query.type,
          gender: req.query.gender,
          ageRange: req.query.ageRange,
          language: req.query.language,
          sort: req.query.sort || "recent",
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/voices - Upload new voice contribution
router.post(
  "/",
  authenticateToken,
  upload.single("voiceFile"),
  createVoiceValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Clean up uploaded file if validation fails
        if (req.file) {
          await fs.unlink(req.file.path).catch(console.error);
        }
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      if (!req.file) {
        return res.status(400).json({
          error: "Voice file required",
          message: "Please upload a voice file",
        });
      }

      const {
        title,
        description,
        voiceType,
        gender,
        ageRange,
        accent,
        language,
      } = req.body;

      // TODO: In production, analyze audio file for duration, sample rate, etc.
      const audioMetadata = {
        duration: 0, // Would be extracted from actual audio file
        sampleRate: 44100, // Default sample rate
        format: path.extname(req.file.originalname).substring(1),
      };

      const voiceUuid = uuidv4();

      const result = await runQuery(
        `
      INSERT INTO voice_contributions (
        uuid, user_id, title, description, voice_type, gender, age_range,
        accent, language, file_path, file_size, duration, format
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        [
          voiceUuid,
          req.user.id,
          title,
          description || null,
          voiceType,
          gender || null,
          ageRange || null,
          accent || null,
          language || "en",
          req.file.path,
          req.file.size,
          audioMetadata.duration,
          audioMetadata.format,
        ],
      );

      // Get the created voice with user info
      const createdVoice = await getQuery(
        `
      SELECT 
        v.*, u.username, u.is_verified as user_verified
      FROM voice_contributions v
      JOIN users u ON v.user_id = u.id
      WHERE v.id = ?
    `,
        [result.id],
      );

      res.status(201).json({
        message: "Voice uploaded successfully and pending approval",
        voice: {
          id: createdVoice.uuid,
          title: createdVoice.title,
          description: createdVoice.description,
          voiceType: createdVoice.voice_type,
          gender: createdVoice.gender,
          ageRange: createdVoice.age_range,
          accent: createdVoice.accent,
          language: createdVoice.language,
          fileUrl: `/uploads/voices/${path.basename(createdVoice.file_path)}`,
          fileSize: createdVoice.file_size,
          duration: createdVoice.duration,
          format: createdVoice.format,
          isApproved: createdVoice.is_approved,
          isFeatured: createdVoice.is_featured,
          downloadCount: createdVoice.download_count,
          rating: {
            average: createdVoice.rating_average,
            count: createdVoice.rating_count,
          },
          createdAt: createdVoice.created_at,
          contributor: {
            username: createdVoice.username,
            isVerified: createdVoice.user_verified,
          },
        },
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      next(error);
    }
  },
);

// GET /api/voices/:id - Get specific voice
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const voice = await getQuery(
      `
      SELECT 
        v.*, u.username, u.is_verified as user_verified
      FROM voice_contributions v
      JOIN users u ON v.user_id = u.id
      WHERE v.uuid = ? AND v.is_approved = 1
    `,
      [req.params.id],
    );

    if (!voice) {
      return res.status(404).json({
        error: "Voice not found",
        message: "The requested voice could not be found",
      });
    }

    // Check if user has rated this voice
    let userRating = null;
    if (req.user) {
      const rating = await getQuery(
        "SELECT rating, review FROM voice_ratings WHERE voice_id = ? AND user_id = ?",
        [voice.id, req.user.id],
      );
      userRating = rating;
    }

    res.json({
      voice: {
        id: voice.uuid,
        title: voice.title,
        description: voice.description,
        voiceType: voice.voice_type,
        gender: voice.gender,
        ageRange: voice.age_range,
        accent: voice.accent,
        language: voice.language,
        fileUrl: `/uploads/voices/${path.basename(voice.file_path)}`,
        fileSize: voice.file_size,
        duration: voice.duration,
        format: voice.format,
        isFeatured: voice.is_featured,
        downloadCount: voice.download_count,
        rating: {
          average: voice.rating_average,
          count: voice.rating_count,
        },
        createdAt: voice.created_at,
        contributor: {
          username: voice.username,
          isVerified: voice.user_verified,
        },
        userRating,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/voices/:id/rate - Rate a voice
router.post(
  "/:id/rate",
  authenticateToken,
  rateVoiceValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const voice = await getQuery(
        "SELECT id, rating_average, rating_count FROM voice_contributions WHERE uuid = ? AND is_approved = 1",
        [req.params.id],
      );

      if (!voice) {
        return res.status(404).json({
          error: "Voice not found",
          message: "The requested voice could not be found",
        });
      }

      const { rating, review } = req.body;

      // Check if user already rated this voice
      const existingRating = await getQuery(
        "SELECT id FROM voice_ratings WHERE voice_id = ? AND user_id = ?",
        [voice.id, req.user.id],
      );

      if (existingRating) {
        // Update existing rating
        await runQuery(
          "UPDATE voice_ratings SET rating = ?, review = ? WHERE voice_id = ? AND user_id = ?",
          [rating, review || null, voice.id, req.user.id],
        );
      } else {
        // Add new rating
        await runQuery(
          "INSERT INTO voice_ratings (voice_id, user_id, rating, review) VALUES (?, ?, ?, ?)",
          [voice.id, req.user.id, rating, review || null],
        );
      }

      // Recalculate average rating
      const ratingStats = await getQuery(
        "SELECT AVG(rating) as average, COUNT(*) as count FROM voice_ratings WHERE voice_id = ?",
        [voice.id],
      );

      await runQuery(
        "UPDATE voice_contributions SET rating_average = ?, rating_count = ? WHERE id = ?",
        [ratingStats.average, ratingStats.count, voice.id],
      );

      res.json({
        message: existingRating
          ? "Rating updated successfully"
          : "Rating added successfully",
        rating: {
          average: ratingStats.average,
          count: ratingStats.count,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/voices/:id/download - Track download
router.post("/:id/download", optionalAuth, async (req, res, next) => {
  try {
    const voice = await getQuery(
      "SELECT id, download_count FROM voice_contributions WHERE uuid = ? AND is_approved = 1",
      [req.params.id],
    );

    if (!voice) {
      return res.status(404).json({
        error: "Voice not found",
        message: "The requested voice could not be found",
      });
    }

    // Increment download count
    await runQuery(
      "UPDATE voice_contributions SET download_count = download_count + 1 WHERE id = ?",
      [voice.id],
    );

    res.json({
      message: "Download tracked",
      downloadCount: voice.download_count + 1,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/voices/:id - Delete voice (author or admin only)
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const voice = await getQuery(
      "SELECT id, user_id, file_path FROM voice_contributions WHERE uuid = ?",
      [req.params.id],
    );

    if (!voice) {
      return res.status(404).json({
        error: "Voice not found",
        message: "The requested voice could not be found",
      });
    }

    // Check if user is author or admin
    if (voice.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only delete your own voice contributions",
      });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(voice.file_path);
    } catch (error) {
      console.error("Failed to delete voice file:", error);
    }

    // Delete from database
    await runQuery("DELETE FROM voice_contributions WHERE id = ?", [voice.id]);

    res.json({
      message: "Voice deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/voices/user/:userId - Get voices by user
router.get("/user/:userId", optionalAuth, async (req, res, next) => {
  try {
    // Find user
    const user = await getQuery(
      "SELECT id, username, is_verified FROM users WHERE uuid = ?",
      [req.params.userId],
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "The requested user could not be found",
      });
    }

    // Get user's voices (only approved ones unless it's the user themselves or admin)
    let whereClause = "WHERE v.user_id = ?";
    let queryParams = [user.id];

    if (!req.user || (req.user.id !== user.id && !req.user.is_admin)) {
      whereClause += " AND v.is_approved = 1";
    }

    const voices = await allQuery(
      `
      SELECT 
        v.uuid, v.title, v.description, v.voice_type, v.gender, v.age_range,
        v.accent, v.language, v.file_path, v.file_size, v.duration, v.format,
        v.is_approved, v.is_featured, v.download_count, v.rating_average,
        v.rating_count, v.created_at
      FROM voice_contributions v
      ${whereClause}
      ORDER BY v.created_at DESC
    `,
      queryParams,
    );

    const processedVoices = voices.map((voice) => ({
      id: voice.uuid,
      title: voice.title,
      description: voice.description,
      voiceType: voice.voice_type,
      gender: voice.gender,
      ageRange: voice.age_range,
      accent: voice.accent,
      language: voice.language,
      fileUrl: `/uploads/voices/${path.basename(voice.file_path)}`,
      fileSize: voice.file_size,
      duration: voice.duration,
      format: voice.format,
      isApproved: voice.is_approved,
      isFeatured: voice.is_featured,
      downloadCount: voice.download_count,
      rating: {
        average: voice.rating_average,
        count: voice.rating_count,
      },
      createdAt: voice.created_at,
    }));

    res.json({
      user: {
        username: user.username,
        isVerified: user.is_verified,
      },
      voices: processedVoices,
      count: processedVoices.length,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
