import { Router } from 'express';
import { listingsController } from '../controllers/listingsController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all listings with filters
router.get('/', listingsController.getListings);

// Get single listing
router.get('/:id', listingsController.getListing);

// Update listing
router.put('/:id', listingsController.updateListing);

// Delete listing
router.delete('/:id', listingsController.deleteListing);

// Moderate listing (approve/reject)
router.post('/:id/moderate', listingsController.moderateListing);

export { router as listingsRouter }; 