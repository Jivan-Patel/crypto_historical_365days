const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/coins', authMiddleware, adminController.getAdminCoins);
router.get('/stats', authMiddleware, adminController.getAdminStats);
router.get('/users', authMiddleware, adminController.getAdminUsers);

module.exports = router;
