import { Router } from 'express';
import { SearchController } from '../controllers/searchController';
import rateLimit from 'express-rate-limit';

const router = Router();

// Search-specific rate limiting (more lenient than general API)
const searchRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // IP başına max 100 istek
  message: {
    success: false,
    message: 'Çok fazla arama isteği gönderildi. Lütfen daha sonra tekrar deneyin.',
    error: 'SEARCH_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to search endpoints
router.use(searchRateLimit);

/**
 * Search listings
 * POST /api/search/listings
 */
router.post('/listings', SearchController.searchListings);

/**
 * Get search suggestions
 * GET /api/search/suggestions?q=query
 */
router.get('/suggestions', SearchController.getSuggestions);

/**
 * Get search analytics
 * GET /api/search/analytics
 */
router.get('/analytics', SearchController.getAnalytics);

/**
 * Health check for search services
 * GET /api/search/health
 */
router.get('/health', SearchController.healthCheck);

/**
 * Manual reindex (admin only)
 * POST /api/search/reindex
 */
router.post('/reindex', SearchController.reindex);

export default router; 