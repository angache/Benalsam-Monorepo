import express from 'express';
import { PerformanceMonitoringService } from '../services/performanceMonitoringService';
import { authenticateToken } from '../middleware/auth';
import logger from '../config/logger';

const router: express.Router = express.Router();
const performanceService = new PerformanceMonitoringService();

// Initialize performance monitoring indexes
performanceService.initializeIndexes().catch(error => {
  logger.error('Failed to initialize performance monitoring indexes:', error);
});

// Get real-time performance dashboard
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const dashboard = await performanceService.getRealTimePerformanceDashboard();
    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    logger.error('Failed to get performance dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance dashboard'
    });
  }
});

// Get system metrics
router.get('/system', authenticateToken, async (req, res) => {
  try {
    const metrics = await performanceService.getSystemMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to get system metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system metrics'
    });
  }
});

// Get Elasticsearch metrics
router.get('/elasticsearch', authenticateToken, async (req, res) => {
  try {
    const metrics = await performanceService.getElasticsearchMetrics();
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to get Elasticsearch metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Elasticsearch metrics'
    });
  }
});

// Get API metrics
router.get('/api', authenticateToken, async (req, res) => {
  try {
    const minutes = parseInt(req.query.minutes as string) || 5;
    const metrics = await performanceService.getAPIMetrics(minutes);
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to get API metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get API metrics'
    });
  }
});

// Get performance metrics with filters
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { metric_type, metric_name, start_date, end_date, limit } = req.query;
    const metrics = await performanceService.getPerformanceMetrics({
      metric_type: metric_type as string,
      metric_name: metric_name as string,
      start_date: start_date as string,
      end_date: end_date as string,
      limit: limit ? parseInt(limit as string) : undefined
    });
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to get performance metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics'
    });
  }
});

// Get active alerts
router.get('/alerts', authenticateToken, async (req, res) => {
  try {
    const alerts = await performanceService.getActiveAlerts();
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Failed to get active alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active alerts'
    });
  }
});

// Check performance alerts (manual trigger)
router.post('/alerts/check', authenticateToken, async (req, res) => {
  try {
    const alerts = await performanceService.checkPerformanceAlerts();
    res.json({
      success: true,
      data: {
        alerts,
        count: alerts.length
      }
    });
  } catch (error) {
    logger.error('Failed to check performance alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check performance alerts'
    });
  }
});

// Track system metrics (manual trigger)
router.post('/track/system', authenticateToken, async (req, res) => {
  try {
    const success = await performanceService.trackSystemMetrics();
    res.json({
      success,
      message: success ? 'System metrics tracked successfully' : 'Failed to track system metrics'
    });
  } catch (error) {
    logger.error('Failed to track system metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track system metrics'
    });
  }
});

// Track Elasticsearch metrics (manual trigger)
router.post('/track/elasticsearch', authenticateToken, async (req, res) => {
  try {
    const success = await performanceService.trackElasticsearchMetrics();
    res.json({
      success,
      message: success ? 'Elasticsearch metrics tracked successfully' : 'Failed to track Elasticsearch metrics'
    });
  } catch (error) {
    logger.error('Failed to track Elasticsearch metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track Elasticsearch metrics'
    });
  }
});

// Track API metrics (for middleware use)
router.post('/track/api', async (req, res) => {
  try {
    const { endpoint, method, response_time, status_code, request_size, response_size, timestamp } = req.body;
    
    const success = await performanceService.trackAPIMetrics({
      endpoint,
      method,
      response_time,
      status_code,
      request_size: request_size || 0,
      response_size: response_size || 0,
      timestamp: timestamp || new Date().toISOString()
    });

    res.json({
      success,
      message: success ? 'API metrics tracked successfully' : 'Failed to track API metrics'
    });
  } catch (error) {
    logger.error('Failed to track API metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track API metrics'
    });
  }
});

export default router; 