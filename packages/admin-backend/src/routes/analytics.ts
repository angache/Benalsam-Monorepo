import { Router } from 'express';
import { authenticateToken, authenticateSupabaseToken } from '../middleware/auth';
import userBehaviorService from '../services/userBehaviorService';
import logger from '../config/logger';

const router: Router = Router();

// Initialize user behavior indexes
router.post('/initialize', async (req, res) => {
  try {
    const success = await userBehaviorService.initializeIndexes();
    if (success) {
      res.json({ success: true, message: 'User behavior indexes initialized successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to initialize indexes' });
    }
  } catch (error) {
    logger.error('Error initializing analytics indexes:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Track user behavior event
router.post('/track-behavior', authenticateSupabaseToken, async (req, res) => {
  try {
    const event = req.body;
    const success = await userBehaviorService.trackUserBehavior(event);
    
    if (success) {
      res.json({ success: true, message: 'User behavior tracked successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to track user behavior' });
    }
  } catch (error) {
    logger.error('Error tracking user behavior:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Track user analytics
router.post('/track-analytics', authenticateToken, async (req, res) => {
  try {
    const analytics = req.body;
    const success = await userBehaviorService.trackUserAnalytics(analytics);
    
    if (success) {
      res.json({ success: true, message: 'User analytics tracked successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to track user analytics' });
    }
  } catch (error) {
    logger.error('Error tracking user analytics:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user behavior stats
router.get('/user-stats/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const stats = await userBehaviorService.getUserBehaviorStats(userId, Number(days));
    
    if (stats) {
      res.json({ success: true, data: stats });
    } else {
      res.status(404).json({ success: false, message: 'User stats not found' });
    }
  } catch (error) {
    logger.error('Error getting user stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get popular sections
router.get('/popular-sections', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const stats = await userBehaviorService.getPopularSections(Number(days));
    
    if (stats) {
      res.json({ success: true, data: stats });
    } else {
      res.status(404).json({ success: false, message: 'Popular sections not found' });
    }
  } catch (error) {
    logger.error('Error getting popular sections:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get bounce rate stats
router.get('/bounce-rate', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const stats = await userBehaviorService.getBounceRateStats(Number(days));
    
    if (stats) {
      res.json({ success: true, data: stats });
    } else {
      res.status(404).json({ success: false, message: 'Bounce rate stats not found' });
    }
  } catch (error) {
    logger.error('Error getting bounce rate stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get index stats
router.get('/index-stats', authenticateToken, async (req, res) => {
  try {
    const stats = await userBehaviorService.getIndexStats();
    
    if (stats) {
      res.json({ success: true, data: stats });
    } else {
      res.status(404).json({ success: false, message: 'Index stats not found' });
    }
  } catch (error) {
    logger.error('Error getting index stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router; 