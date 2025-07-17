import { Router } from 'express';
import { categoriesController } from '../controllers/categoriesController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all categories - requires categories:view permission
router.get('/', ...authMiddleware({ requiredPermissions: ['categories:view'] }), categoriesController.getCategories);

// Get single category by path - requires categories:view permission
router.get('/:path(*)', ...authMiddleware({ requiredPermissions: ['categories:view'] }), categoriesController.getCategory);

// Update category - requires categories:edit permission
router.put('/:path(*)', ...authMiddleware({ requiredPermissions: ['categories:edit'] }), categoriesController.updateCategory);

// Delete category - requires categories:delete permission
router.delete('/:path(*)', ...authMiddleware({ requiredPermissions: ['categories:delete'] }), categoriesController.deleteCategory);

export { router as categoriesRouter }; 