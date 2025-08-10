const express = require("express");
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

// Validation rules
const createReportValidation = [
  body("title")
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .isLength({ min: 20, max: 2000 })
    .withMessage("Description must be between 20 and 2000 characters"),
  body("incidentType")
    .isIn([
      "theft",
      "assault",
      "harassment",
      "vandalism",
      "suspicious",
      "drug",
      "weapon",
      "accident",
      "other",
    ])
    .withMessage("Invalid incident type"),
  body("severity")
    .isIn(["low", "medium", "high", "critical"])
    .withMessage("Invalid severity level"),
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
  body("timestamp").isISO8601().withMessage("Invalid timestamp format"),
  body("address")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Address must be less than 500 characters"),
  body("witnessCount")
    .optional()
    .isIn(["0", "1-2", "3-5", "6-10", "10+", "unknown"])
    .withMessage("Invalid witness count"),
  body("policeNotified")
    .optional()
    .isBoolean()
    .withMessage("Police notification must be true or false"),
];

// GET /api/reports - Get community reports with filtering
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
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("type")
      .optional()
      .isIn([
        "theft",
        "assault",
        "harassment",
        "vandalism",
        "suspicious",
        "drug",
        "weapon",
        "accident",
        "other",
      ]),
    query("severity").optional().isIn(["low", "medium", "high", "critical"]),
    query("lat").optional().isFloat({ min: -90, max: 90 }),
    query("lng").optional().isFloat({ min: -180, max: 180 }),
    query("radius")
      .optional()
      .isFloat({ min: 0.1, max: 100 })
      .withMessage("Radius must be between 0.1 and 100 km"),
    query("since").optional().isISO8601().withMessage("Invalid date format"),
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

      let whereConditions = ["status = ?"];
      let queryParams = ["active"];

      // Filter by incident type
      if (req.query.type) {
        whereConditions.push("incident_type = ?");
        queryParams.push(req.query.type);
      }

      // Filter by severity
      if (req.query.severity) {
        whereConditions.push("severity = ?");
        queryParams.push(req.query.severity);
      }

      // Filter by date
      if (req.query.since) {
        whereConditions.push("timestamp >= ?");
        queryParams.push(req.query.since);
      }

      // Geographic filtering
      if (req.query.lat && req.query.lng) {
        const radius = parseFloat(req.query.radius) || 10; // Default 10km radius
        // Simple bounding box calculation (for SQLite compatibility)
        const latDelta = radius / 111; // Rough conversion: 1 degree ≈ 111 km
        const lngDelta =
          radius / (111 * Math.cos((req.query.lat * Math.PI) / 180));

        whereConditions.push("latitude BETWEEN ? AND ?");
        whereConditions.push("longitude BETWEEN ? AND ?");
        queryParams.push(
          parseFloat(req.query.lat) - latDelta,
          parseFloat(req.query.lat) + latDelta,
          parseFloat(req.query.lng) - lngDelta,
          parseFloat(req.query.lng) + lngDelta,
        );
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Get total count for pagination
      const countQuery = `
      SELECT COUNT(*) as total 
      FROM community_reports 
      ${whereClause}
    `;
      const countResult = await getQuery(countQuery, queryParams);
      const total = countResult.total;

      // Get reports with user information
      const reportsQuery = `
      SELECT 
        r.id, r.uuid, r.title, r.description, r.incident_type, r.severity,
        r.latitude, r.longitude, r.address, r.timestamp, r.reported_at,
        r.is_verified, r.verification_count, r.status, r.photos_json,
        r.witness_count, r.police_notified,
        u.username, u.is_verified as user_verified
      FROM community_reports r
      JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.timestamp DESC
      LIMIT ? OFFSET ?
    `;

      const reports = await allQuery(reportsQuery, [
        ...queryParams,
        limit,
        offset,
      ]);

      // Process reports
      const processedReports = reports.map((report) => ({
        id: report.uuid,
        title: report.title,
        description: report.description,
        incidentType: report.incident_type,
        severity: report.severity,
        location: {
          latitude: report.latitude,
          longitude: report.longitude,
          address: report.address,
        },
        timestamp: report.timestamp,
        reportedAt: report.reported_at,
        isVerified: report.is_verified,
        verificationCount: report.verification_count,
        status: report.status,
        photos: report.photos_json ? JSON.parse(report.photos_json) : [],
        witnessCount: report.witness_count,
        policeNotified: report.police_notified,
        reporter: {
          username: report.username,
          isVerified: report.user_verified,
        },
      }));

      res.json({
        reports: processedReports,
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
          severity: req.query.severity,
          location:
            req.query.lat && req.query.lng
              ? {
                  latitude: parseFloat(req.query.lat),
                  longitude: parseFloat(req.query.lng),
                  radius: parseFloat(req.query.radius) || 10,
                }
              : null,
          since: req.query.since,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/reports - Create new community report
router.post(
  "/",
  authenticateToken,
  createReportValidation,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const {
        title,
        description,
        incidentType,
        severity,
        latitude,
        longitude,
        address,
        timestamp,
        witnessCount,
        policeNotified,
        photos,
      } = req.body;

      const reportUuid = uuidv4();

      const result = await runQuery(
        `
      INSERT INTO community_reports (
        uuid, user_id, title, description, incident_type, severity,
        latitude, longitude, address, timestamp, witness_count, 
        police_notified, photos_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
        [
          reportUuid,
          req.user.id,
          title,
          description,
          incidentType,
          severity,
          latitude,
          longitude,
          address || null,
          timestamp,
          witnessCount || null,
          policeNotified || false,
          photos ? JSON.stringify(photos) : null,
        ],
      );

      // Get the created report with user info
      const createdReport = await getQuery(
        `
      SELECT 
        r.*, u.username, u.is_verified as user_verified
      FROM community_reports r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `,
        [result.id],
      );

      res.status(201).json({
        message: "Report created successfully",
        report: {
          id: createdReport.uuid,
          title: createdReport.title,
          description: createdReport.description,
          incidentType: createdReport.incident_type,
          severity: createdReport.severity,
          location: {
            latitude: createdReport.latitude,
            longitude: createdReport.longitude,
            address: createdReport.address,
          },
          timestamp: createdReport.timestamp,
          reportedAt: createdReport.reported_at,
          isVerified: createdReport.is_verified,
          verificationCount: createdReport.verification_count,
          status: createdReport.status,
          photos: createdReport.photos_json
            ? JSON.parse(createdReport.photos_json)
            : [],
          witnessCount: createdReport.witness_count,
          policeNotified: createdReport.police_notified,
          reporter: {
            username: createdReport.username,
            isVerified: createdReport.user_verified,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/reports/:id - Get specific report
router.get("/:id", optionalAuth, async (req, res, next) => {
  try {
    const report = await getQuery(
      `
      SELECT 
        r.*, u.username, u.is_verified as user_verified
      FROM community_reports r
      JOIN users u ON r.user_id = u.id
      WHERE r.uuid = ? AND r.status = 'active'
    `,
      [req.params.id],
    );

    if (!report) {
      return res.status(404).json({
        error: "Report not found",
        message: "The requested report could not be found",
      });
    }

    // Get verifications if user is authenticated
    let hasUserVerified = false;
    if (req.user) {
      const verification = await getQuery(
        "SELECT id FROM report_verifications WHERE report_id = ? AND user_id = ?",
        [report.id, req.user.id],
      );
      hasUserVerified = !!verification;
    }

    res.json({
      report: {
        id: report.uuid,
        title: report.title,
        description: report.description,
        incidentType: report.incident_type,
        severity: report.severity,
        location: {
          latitude: report.latitude,
          longitude: report.longitude,
          address: report.address,
        },
        timestamp: report.timestamp,
        reportedAt: report.reported_at,
        isVerified: report.is_verified,
        verificationCount: report.verification_count,
        status: report.status,
        photos: report.photos_json ? JSON.parse(report.photos_json) : [],
        witnessCount: report.witness_count,
        policeNotified: report.police_notified,
        reporter: {
          username: report.username,
          isVerified: report.user_verified,
        },
        hasUserVerified,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/reports/:id/verify - Verify a report
router.post("/:id/verify", authenticateToken, async (req, res, next) => {
  try {
    const report = await getQuery(
      'SELECT id, verification_count FROM community_reports WHERE uuid = ? AND status = "active"',
      [req.params.id],
    );

    if (!report) {
      return res.status(404).json({
        error: "Report not found",
        message: "The requested report could not be found",
      });
    }

    // Check if user already verified this report
    const existingVerification = await getQuery(
      "SELECT id FROM report_verifications WHERE report_id = ? AND user_id = ?",
      [report.id, req.user.id],
    );

    if (existingVerification) {
      return res.status(409).json({
        error: "Already verified",
        message: "You have already verified this report",
      });
    }

    // Add verification
    await runQuery(
      "INSERT INTO report_verifications (report_id, user_id) VALUES (?, ?)",
      [report.id, req.user.id],
    );

    // Update verification count
    const newCount = report.verification_count + 1;
    await runQuery(
      "UPDATE community_reports SET verification_count = ?, is_verified = ? WHERE id = ?",
      [newCount, newCount >= 3, report.id], // Mark as verified if 3+ verifications
    );

    res.json({
      message: "Report verified successfully",
      verificationCount: newCount,
      isVerified: newCount >= 3,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/reports/:id - Delete report (author or admin only)
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const report = await getQuery(
      "SELECT id, user_id FROM community_reports WHERE uuid = ?",
      [req.params.id],
    );

    if (!report) {
      return res.status(404).json({
        error: "Report not found",
        message: "The requested report could not be found",
      });
    }

    // Check if user is author or admin
    if (report.user_id !== req.user.id && !req.user.is_admin) {
      return res.status(403).json({
        error: "Access denied",
        message: "You can only delete your own reports",
      });
    }

    await runQuery(
      'UPDATE community_reports SET status = "removed" WHERE id = ?',
      [report.id],
    );

    res.json({
      message: "Report deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/area/:lat/:lng - Get reports by location (simplified endpoint)
router.get(
  "/area/:lat/:lng",
  optionalAuth,
  [
    query("radius")
      .optional()
      .isFloat({ min: 0.1, max: 100 })
      .withMessage("Radius must be between 0.1 and 100 km"),
  ],
  async (req, res, next) => {
    try {
      const { lat, lng } = req.params;
      const radius = parseFloat(req.query.radius) || 5; // Default 5km radius

      // Validate coordinates
      if (!lat || !lng || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          error: "Invalid coordinates",
          message: "Please provide valid latitude and longitude",
        });
      }

      const latDelta = radius / 111;
      const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

      const reports = await allQuery(
        `
      SELECT 
        r.uuid, r.title, r.incident_type, r.severity, r.latitude, r.longitude,
        r.address, r.timestamp, r.is_verified, r.verification_count,
        u.username, u.is_verified as user_verified
      FROM community_reports r
      JOIN users u ON r.user_id = u.id
      WHERE r.status = 'active'
        AND r.latitude BETWEEN ? AND ?
        AND r.longitude BETWEEN ? AND ?
      ORDER BY r.timestamp DESC
      LIMIT 50
    `,
        [
          parseFloat(lat) - latDelta,
          parseFloat(lat) + latDelta,
          parseFloat(lng) - lngDelta,
          parseFloat(lng) + lngDelta,
        ],
      );

      const processedReports = reports.map((report) => ({
        id: report.uuid,
        title: report.title,
        incidentType: report.incident_type,
        severity: report.severity,
        location: {
          latitude: report.latitude,
          longitude: report.longitude,
          address: report.address,
        },
        timestamp: report.timestamp,
        isVerified: report.is_verified,
        verificationCount: report.verification_count,
        reporter: {
          username: report.username,
          isVerified: report.user_verified,
        },
      }));

      res.json({
        reports: processedReports,
        area: {
          center: { latitude: parseFloat(lat), longitude: parseFloat(lng) },
          radius,
        },
        count: processedReports.length,
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
