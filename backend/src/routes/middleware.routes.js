const express = require('express');
const router = express.Router();
const middlewareController = require('../controllers/middleware.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/logger', middlewareController.getLoggerTest);
router.get('/auth', authMiddleware, middlewareController.getAuthTest);
router.get('/rate-limit', middlewareController.getRateLimitTest);
router.get('/error-handler', middlewareController.getErrorHandlerTest);

module.exports = router;
