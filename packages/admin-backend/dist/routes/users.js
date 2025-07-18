"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const usersController_1 = require("../controllers/usersController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.usersRouter = router;
router.get('/', ...(0, auth_1.authMiddleware)({ requiredPermissions: ['users:view'] }), usersController_1.usersController.getUsers);
router.get('/:id', ...(0, auth_1.authMiddleware)({ requiredPermissions: ['users:view'] }), usersController_1.usersController.getUser);
router.put('/:id', ...(0, auth_1.authMiddleware)({ requiredPermissions: ['users:manage'] }), usersController_1.usersController.updateUser);
router.post('/:id/ban', ...(0, auth_1.authMiddleware)({ requiredPermissions: ['users:ban'] }), usersController_1.usersController.banUser);
router.post('/:id/unban', ...(0, auth_1.authMiddleware)({ requiredPermissions: ['users:ban'] }), usersController_1.usersController.unbanUser);
router.delete('/:id', ...(0, auth_1.authMiddleware)({ requiredPermissions: ['users:delete'] }), usersController_1.usersController.deleteUser);
//# sourceMappingURL=users.js.map