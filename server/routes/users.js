const express = require('express');
const { query, validationResult } = require('express-validator');
const { getQuery, allQuery, runQuery } = require('../database/init');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/users - Get users list (admin only)
router.get('/', requireAdmin, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search term must be 1-100 characters'),
  query('verified').optional().isBoolean().withMessage('Verified must be true or false')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    // Search filter
    if (req.query.search) {
      whereConditions.push('(username LIKE ? OR email LIKE ? OR full_name LIKE ?)');
      const searchTerm = `%${req.query.search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    // Verified filter
    if (req.query.verified !== undefined) {
      whereConditions.push('is_verified = ?');
      queryParams.push(req.query.verified === 'true');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM users 
      ${whereClause}
    `;
    const countResult = await getQuery(countQuery, queryParams);
    const total = countResult.total;

    // Get users with statistics
    const usersQuery = `
      SELECT 
        u.id, u.uuid, u.username, u.email, u.full_name, u.avatar_url,
        u.is_verified, u.is_admin, u.created_at, u.last_login,
        (SELECT COUNT(*) FROM community_reports WHERE user_id = u.id) as report_count,
        (SELECT COUNT(*) FROM voice_contributions WHERE user_id = u.id) as voice_count,
        (SELECT COUNT(*) FROM report_verifications WHERE user_id = u.id) as verification_count
      FROM users u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const users = await allQuery(usersQuery, [...queryParams, limit, offset]);

    const processedUsers = users.map(user => ({
      id: user.uuid,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      isVerified: user.is_verified,
      isAdmin: user.is_admin,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      statistics: {
        reportsSubmitted: user.report_count,
        voicesContributed: user.voice_count,
        reportsVerified: user.verification_count
      }
    }));

    res.json({
      users: processedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      filters: {
        search: req.query.search,
        verified: req.query.verified
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/users/:id - Get specific user profile
router.get('/:id', async (req, res, next) => {
  try {
    const user = await getQuery(
      `SELECT id, uuid, username, full_name, avatar_url, is_verified, 
              created_at, last_login FROM users WHERE uuid = ?`,
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user could not be found'
      });
    }

    // Get user statistics
    const reportCount = await getQuery(
      'SELECT COUNT(*) as count FROM community_reports WHERE user_id = ? AND status = "active"',
      [user.id]
    );

    const voiceCount = await getQuery(
      'SELECT COUNT(*) as count FROM voice_contributions WHERE user_id = ? AND is_approved = 1',
      [user.id]
    );

    const verificationCount = await getQuery(
      'SELECT COUNT(*) as count FROM report_verifications WHERE user_id = ?',
      [user.id]
    );

    // Get recent contributions (last 5 of each type)
    const recentReports = await allQuery(
      `SELECT uuid, title, incident_type, severity, timestamp 
       FROM community_reports 
       WHERE user_id = ? AND status = "active"
       ORDER BY created_at DESC 
       LIMIT 5`,
      [user.id]
    );

    const recentVoices = await allQuery(
      `SELECT uuid, title, voice_type, rating_average, download_count, created_at
       FROM voice_contributions 
       WHERE user_id = ? AND is_approved = 1
       ORDER BY created_at DESC 
       LIMIT 5`,
      [user.id]
    );

    res.json({
      user: {
        id: user.uuid,
        username: user.username,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        isVerified: user.is_verified,
        joinedAt: user.created_at,
        lastSeen: user.last_login
      },
      statistics: {
        reportsSubmitted: reportCount?.count || 0,
        voicesContributed: voiceCount?.count || 0,
        reportsVerified: verificationCount?.count || 0
      },
      recentActivity: {
        reports: recentReports.map(report => ({
          id: report.uuid,
          title: report.title,
          type: report.incident_type,
          severity: report.severity,
          timestamp: report.timestamp
        })),
        voices: recentVoices.map(voice => ({
          id: voice.uuid,
          title: voice.title,
          type: voice.voice_type,
          rating: voice.rating_average,
          downloads: voice.download_count,
          createdAt: voice.created_at
        }))
      }
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id/verify - Verify/unverify user (admin only)
router.put('/:id/verify', requireAdmin, async (req, res, next) => {
  try {
    const { verified } = req.body;

    if (typeof verified !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Verified status must be true or false'
      });
    }

    const user = await getQuery(
      'SELECT id, username FROM users WHERE uuid = ?',
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user could not be found'
      });
    }

    await runQuery(
      'UPDATE users SET is_verified = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [verified, user.id]
    );

    res.json({
      message: `User ${verified ? 'verified' : 'unverified'} successfully`,
      user: {
        username: user.username,
        isVerified: verified
      }
    });

  } catch (error) {
    next(error);
  }
});

// PUT /api/users/:id/admin - Grant/revoke admin privileges (admin only)
router.put('/:id/admin', requireAdmin, async (req, res, next) => {
  try {
    const { admin } = req.body;

    if (typeof admin !== 'boolean') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Admin status must be true or false'
      });
    }

    const user = await getQuery(
      'SELECT id, username FROM users WHERE uuid = ?',
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The requested user could not be found'
      });
    }

    // Prevent removing admin from yourself
    if (user.id === req.user.id && !admin) {
      return res.status(400).json({
        error: 'Invalid operation',
        message: 'You cannot remove admin privileges from yourself'
      });
    }

    await runQuery(
      'UPDATE users SET is_admin = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [admin, user.id]
    );

    res.json({
      message: `User ${admin ? 'granted' : 'revoked'} admin privileges successfully`,
      user: {
        username: user.username,
        isAdmin: admin
      }
    });

  } catch (error) {
    next(error);
  }
});

// GET /api/users/stats/overview - Get platform statistics (admin only)
router.get('/stats/overview', requireAdmin, async (req, res, next) => {
  try {
    // User statistics
    const totalUsers = await getQuery('SELECT COUNT(*) as count FROM users');
    const verifiedUsers = await getQuery('SELECT COUNT(*) as count FROM users WHERE is_verified = 1');
    const newUsersThisWeek = await getQuery(
      "SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-7 days')"
    );

    // Report statistics
    const totalReports = await getQuery('SELECT COUNT(*) as count FROM community_reports WHERE status = "active"');
    const verifiedReports = await getQuery('SELECT COUNT(*) as count FROM community_reports WHERE is_verified = 1');
    const reportsThisWeek = await getQuery(
      "SELECT COUNT(*) as count FROM community_reports WHERE created_at >= datetime('now', '-7 days')"
    );

    // Voice statistics
    const totalVoices = await getQuery('SELECT COUNT(*) as count FROM voice_contributions WHERE is_approved = 1');
    const pendingVoices = await getQuery('SELECT COUNT(*) as count FROM voice_contributions WHERE is_approved = 0');
    const voicesThisWeek = await getQuery(
      "SELECT COUNT(*) as count FROM voice_contributions WHERE created_at >= datetime('now', '-7 days')"
    );

    // Activity statistics
    const totalDownloads = await getQuery('SELECT SUM(download_count) as total FROM voice_contributions');
    const totalVerifications = await getQuery('SELECT COUNT(*) as count FROM report_verifications');

    // Top contributors
    const topReporters = await allQuery(`
      SELECT u.username, COUNT(*) as report_count
      FROM community_reports r
      JOIN users u ON r.user_id = u.id
      WHERE r.status = 'active'
      GROUP BY u.id
      ORDER BY report_count DESC
      LIMIT 5
    `);

    const topVoiceContributors = await allQuery(`
      SELECT u.username, COUNT(*) as voice_count
      FROM voice_contributions v
      JOIN users u ON v.user_id = u.id
      WHERE v.is_approved = 1
      GROUP BY u.id
      ORDER BY voice_count DESC
      LIMIT 5
    `);

    res.json({
      users: {
        total: totalUsers.count,
        verified: verifiedUsers.count,
        newThisWeek: newUsersThisWeek.count,
        verificationRate: totalUsers.count > 0 ? (verifiedUsers.count / totalUsers.count * 100).toFixed(1) : 0
      },
      reports: {
        total: totalReports.count,
        verified: verifiedReports.count,
        newThisWeek: reportsThisWeek.count,
        verificationRate: totalReports.count > 0 ? (verifiedReports.count / totalReports.count * 100).toFixed(1) : 0
      },
      voices: {
        total: totalVoices.count,
        pending: pendingVoices.count,
        newThisWeek: voicesThisWeek.count,
        approvalRate: (totalVoices.count + pendingVoices.count) > 0 ? 
          (totalVoices.count / (totalVoices.count + pendingVoices.count) * 100).toFixed(1) : 0
      },
      activity: {
        totalDownloads: totalDownloads.total || 0,
        totalVerifications: totalVerifications.count
      },
      topContributors: {
        reporters: topReporters,
        voiceContributors: topVoiceContributors
      }
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;
