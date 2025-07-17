import { Router } from 'express';
import authRoutes from './auth';
import { listingsRouter } from './listings';
import { categoriesRouter } from './categories';
import { usersRouter } from './users';
import adminManagementRoutes from './admin-management';
import searchRoutes from './search';

const router = Router();

// API version prefix
const API_VERSION = process.env.API_VERSION || 'v1';

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin Backend API is running',
    timestamp: new Date().toISOString(),
    version: API_VERSION,
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Listings routes
router.use('/listings', listingsRouter);

// Categories routes
router.use('/categories', categoriesRouter);

// Users routes
router.use('/users', usersRouter);

// Admin Management routes
router.use('/admin-management', adminManagementRoutes);

// Search routes
router.use('/search', searchRoutes);

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

export default router; 