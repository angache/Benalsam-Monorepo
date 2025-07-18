"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRouter = void 0;
const express_1 = require("express");
const categoriesController_1 = require("../controllers/categoriesController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.categoriesRouter = router;
router.get('/', categoriesController_1.categoriesController.getCategories);
router.get('/:id', categoriesController_1.categoriesController.getCategory);
router.post('/', ...(0, auth_1.authMiddleware)({ requiredPermissions: ['categories:create'] }), categoriesController_1.categoriesController.createCategory);
router.put('/:id', ...(0, auth_1.authMiddleware)({ requiredPermissions: ['categories:edit'] }), categoriesController_1.categoriesController.updateCategory);
router.delete('/:id', ...(0, auth_1.authMiddleware)({ requiredPermissions: ['categories:delete'] }), categoriesController_1.categoriesController.deleteCategory);
router.post('/:categoryId/attributes', ...(0, auth_1.authMiddleware)({ requiredPermissions: ['categories:edit'] }), categoriesController_1.categoriesController.createAttribute);
router.put('/attributes/:id', ...(0, auth_1.authMiddleware)({ requiredPermissions: ['categories:edit'] }), categoriesController_1.categoriesController.updateAttribute);
router.delete('/attributes/:id', ...(0, auth_1.authMiddleware)({ requiredPermissions: ['categories:edit'] }), categoriesController_1.categoriesController.deleteAttribute);
//# sourceMappingURL=categories.js.map