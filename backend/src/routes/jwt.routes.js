const express = require('express');
const router = express.Router();
const jwtController = require('../controllers/jwt.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/profile', authMiddleware, jwtController.jwtProfile);
router.get('/dashboard', authMiddleware, jwtController.jwtDashboard);
router.post('/generate-token', jwtController.jwtGenerateToken);
router.post('/verify-token', jwtController.jwtVerifyToken);
router.get('/admin', authMiddleware, jwtController.jwtAdmin);
router.get('/private-stats', authMiddleware, jwtController.jwtPrivateStats);
router.post('/refresh-token', jwtController.jwtRefreshToken);
router.delete('/revoke-token', jwtController.jwtRevokeToken);

module.exports = router;
