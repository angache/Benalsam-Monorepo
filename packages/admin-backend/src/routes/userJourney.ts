import express from 'express';
import { authenticateToken } from '../middleware/auth';
import userJourneyService from '../services/userJourneyService';
import logger from '../config/logger';

const router: express.Router = express.Router();

// Initialize user journey indexes
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    const success = await userJourneyService.initializeIndexes();
    if (success) {
      res.json({ success: true, message: 'User journey indexes initialized successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to initialize indexes' });
    }
  } catch (error: any) {
    logger.error('Error initializing user journey indexes:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Track user journey event
router.post('/track-event', async (req, res) => {
  try {
    const { user_id, session_id, event_type, event_data, device_info, user_profile } = req.body;
    
    const event = {
      user_id,
      session_id,
      event_type,
      event_data,
      timestamp: new Date().toISOString(),
      device_info,
      user_profile
    };
    
    const success = await userJourneyService.trackJourneyEvent(event);
    
    if (success) {
      res.json({ success: true, message: 'Journey event tracked successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to track journey event' });
    }
  } catch (error: any) {
    logger.error('Error tracking journey event:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get journey analysis
router.get('/analysis', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const analysis = await userJourneyService.analyzeUserJourneys(Number(days));
    
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    logger.error('Error getting journey analysis:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get journey optimization recommendations
router.get('/optimization', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const optimization = await userJourneyService.getJourneyOptimizationRecommendations(Number(days));
    
    res.json({ success: true, data: optimization });
  } catch (error: any) {
    logger.error('Error getting journey optimization:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get specific user journey
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query;
    
    const journeys = await userJourneyService.getUserJourney(userId, Number(days));
    
    res.json({ success: true, data: journeys });
  } catch (error: any) {
    logger.error('Error getting user journey:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get real-time journey metrics
router.get('/realtime', authenticateToken, async (req, res) => {
  try {
    const metrics = await userJourneyService.getRealTimeJourneyMetrics();
    
    res.json({ success: true, data: metrics });
  } catch (error: any) {
    logger.error('Error getting real-time journey metrics:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get journey dashboard
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const [analysis, optimization, realtimeMetrics] = await Promise.all([
      userJourneyService.analyzeUserJourneys(Number(days)),
      userJourneyService.getJourneyOptimizationRecommendations(Number(days)),
      userJourneyService.getRealTimeJourneyMetrics()
    ]);
    
    const dashboard = {
      analysis,
      optimization,
      realtime: realtimeMetrics,
      timestamp: new Date().toISOString()
    };
    
    res.json({ success: true, data: dashboard });
  } catch (error: any) {
    logger.error('Error getting journey dashboard:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router; 