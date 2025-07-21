"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../../controllers/authController");
const auth_1 = require("../../middleware/auth");
const admin_types_1 = require("../../types/admin-types");
const router = (0, express_1.Router)();
router.post('/login', authController_1.AuthController.login);
router.post('/refresh-token', authController_1.AuthController.refreshToken);
router.use((0, auth_1.authMiddleware)());
router.get('/profile', authController_1.AuthController.getProfile);
router.put('/profile', authController_1.AuthController.updateProfile);
router.post('/logout', authController_1.AuthController.logout);
router.post('/create-admin', (0, auth_1.requireRole)(admin_types_1.AdminRole.SUPER_ADMIN), authController_1.AuthController.createAdmin);
exports.default = router;
//# sourceMappingURL=index.js.map