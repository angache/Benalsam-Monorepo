import { Router } from 'express';
import { categoriesController } from '../controllers/categoriesController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticateToken);

// Get all categories
router.get('/', categoriesController.getCategories);

// Get single category by path
router.get('/:path(*)', categoriesController.getCategory);

// Update category
router.put('/:path(*)', categoriesController.updateCategory);

// Delete category
router.delete('/:path(*)', categoriesController.deleteCategory);

export { router as categoriesRouter }; 