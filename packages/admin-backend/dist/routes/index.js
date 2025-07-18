"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const listings_1 = require("./listings");
const categories_1 = require("./categories");
const users_1 = require("./users");
const admin_management_1 = __importDefault(require("./admin-management"));
const search_1 = __importDefault(require("./search"));
const router = (0, express_1.Router)();
const API_VERSION = process.env.API_VERSION || 'v1';
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Admin Backend API is running',
        timestamp: new Date().toISOString(),
        version: API_VERSION,
    });
});
router.use('/auth', auth_1.default);
router.use('/listings', listings_1.listingsRouter);
router.use('/categories', categories_1.categoriesRouter);
router.use('/users', users_1.usersRouter);
router.use('/admin-management', admin_management_1.default);
router.use('/search', search_1.default);
router.get('/reports', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Reports module not implemented yet',
        error: 'NOT_IMPLEMENTED',
    });
});
router.get('/analytics', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Analytics module not implemented yet',
        error: 'NOT_IMPLEMENTED',
    });
});
router.get('/system', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'System module not implemented yet',
        error: 'NOT_IMPLEMENTED',
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map