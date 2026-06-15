const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);

router.get('/profile', authMiddleware, authController.profile);
router.patch('/profile', authMiddleware, authController.updateProfile);
router.delete('/profile', authMiddleware, authController.deleteProfile);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/verify-email', authController.verifyEmail);

module.exports = router;
