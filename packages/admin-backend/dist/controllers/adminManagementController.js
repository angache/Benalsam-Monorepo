"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminManagementController = void 0;
const database_1 = require("../config/database");
const admin_types_1 = require("../types/admin-types");
const response_1 = require("../utils/response");
const permissionService_1 = require("../services/permissionService");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = __importDefault(require("../config/logger"));
class AdminManagementController {
    static async getAdminUsers(req, res) {
        try {
            const { page = 1, limit = 10, search = '', role = '', isActive = '' } = req.query;
            let query = database_1.supabase
                .from('admin_users')
                .select('*', { count: 'exact' });
            if (search) {
                query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
            }
            if (role) {
                query = query.eq('role', role);
            }
            if (isActive !== '') {
                query = query.eq('is_active', isActive === 'true');
            }
            const offset = (Number(page) - 1) * Number(limit);
            query = query.range(offset, offset + Number(limit) - 1);
            query = query.order('created_at', { ascending: false });
            const { data: admins, error, count } = await query;
            if (error) {
                logger_1.default.error('Error fetching admin users:', error);
                response_1.ApiResponseUtil.error(res, 'Failed to fetch admin users');
                return;
            }
            const adminsWithRoles = await Promise.all((admins || []).map(async (admin) => {
                const roleDetails = await permissionService_1.PermissionService.getRoleByName(admin.role);
                return {
                    ...admin,
                    roleDetails
                };
            }));
            const totalPages = Math.ceil((count || 0) / Number(limit));
            const response = {
                success: true,
                data: adminsWithRoles,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: count || 0,
                    totalPages,
                    hasNext: Number(page) < totalPages,
                    hasPrev: Number(page) > 1
                }
            };
            res.json(response);
        }
        catch (error) {
            logger_1.default.error('Error in getAdminUsers:', error);
            response_1.ApiResponseUtil.error(res, 'Internal server error');
        }
    }
    static async getAdminUser(req, res) {
        try {
            const { id } = req.params;
            const { data: admin, error } = await database_1.supabase
                .from('admin_users')
                .select('*')
                .eq('id', id)
                .single();
            if (error || !admin) {
                response_1.ApiResponseUtil.notFound(res, 'Admin user not found');
                return;
            }
            const [roleDetails, userPermissions] = await Promise.all([
                permissionService_1.PermissionService.getRoleByName(admin.role),
                permissionService_1.PermissionService.getUserPermissions(id)
            ]);
            const adminWithDetails = {
                ...admin,
                roleDetails,
                userPermissions
            };
            response_1.ApiResponseUtil.success(res, adminWithDetails);
        }
        catch (error) {
            logger_1.default.error('Error in getAdminUser:', error);
            response_1.ApiResponseUtil.error(res, 'Internal server error');
        }
    }
    static async createAdminUser(req, res) {
        try {
            const adminData = req.body;
            if (!adminData.email || !adminData.password || !adminData.firstName || !adminData.lastName) {
                response_1.ApiResponseUtil.badRequest(res, 'Missing required fields');
                return;
            }
            const { data: existingAdmin } = await database_1.supabase
                .from('admin_users')
                .select('id')
                .eq('email', adminData.email)
                .single();
            if (existingAdmin) {
                response_1.ApiResponseUtil.badRequest(res, 'Email already exists');
                return;
            }
            const hashedPassword = await bcryptjs_1.default.hash(adminData.password, 12);
            const { data: newAdmin, error } = await database_1.supabase
                .from('admin_users')
                .insert({
                email: adminData.email,
                password: hashedPassword,
                first_name: adminData.firstName,
                last_name: adminData.lastName,
                role: adminData.role || admin_types_1.AdminRole.SUPPORT,
                is_active: true
            })
                .select()
                .single();
            if (error) {
                logger_1.default.error('Error creating admin user:', error);
                response_1.ApiResponseUtil.error(res, 'Failed to create admin user');
                return;
            }
            if (adminData.permissions && adminData.permissions.length > 0) {
                const currentUser = req.admin;
                for (const permissionId of adminData.permissions) {
                    await permissionService_1.PermissionService.grantUserPermission(newAdmin.id, permissionId, currentUser.id);
                }
            }
            response_1.ApiResponseUtil.success(res, newAdmin, 'Admin user created successfully');
        }
        catch (error) {
            logger_1.default.error('Error in createAdminUser:', error);
            response_1.ApiResponseUtil.error(res, 'Internal server error');
        }
    }
    static async updateAdminUser(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const currentUser = req.admin;
            const canManage = await permissionService_1.PermissionService.canManageUser(currentUser.id, id);
            if (!canManage) {
                response_1.ApiResponseUtil.forbidden(res, 'Cannot manage this user');
                return;
            }
            const { data: existingAdmin, error: fetchError } = await database_1.supabase
                .from('admin_users')
                .select('*')
                .eq('id', id)
                .single();
            if (fetchError || !existingAdmin) {
                response_1.ApiResponseUtil.notFound(res, 'Admin user not found');
                return;
            }
            const updateFields = {};
            if (updateData.firstName)
                updateFields.first_name = updateData.firstName;
            if (updateData.lastName)
                updateFields.last_name = updateData.lastName;
            if (updateData.role)
                updateFields.role = updateData.role;
            if (typeof updateData.isActive === 'boolean')
                updateFields.is_active = updateData.isActive;
            const { data: updatedAdmin, error } = await database_1.supabase
                .from('admin_users')
                .update(updateFields)
                .eq('id', id)
                .select()
                .single();
            if (error) {
                logger_1.default.error('Error updating admin user:', error);
                response_1.ApiResponseUtil.error(res, 'Failed to update admin user');
                return;
            }
            if (updateData.permissions) {
                const existingPermissions = await permissionService_1.PermissionService.getUserPermissions(id);
                for (const perm of existingPermissions) {
                    await permissionService_1.PermissionService.revokeUserPermission(id, perm.permission_id);
                }
                for (const permissionId of updateData.permissions) {
                    await permissionService_1.PermissionService.grantUserPermission(id, permissionId, currentUser.id);
                }
            }
            response_1.ApiResponseUtil.success(res, updatedAdmin, 'Admin user updated successfully');
        }
        catch (error) {
            logger_1.default.error('Error in updateAdminUser:', error);
            response_1.ApiResponseUtil.error(res, 'Internal server error');
        }
    }
    static async deleteAdminUser(req, res) {
        try {
            const { id } = req.params;
            const currentUser = req.admin;
            if (currentUser.id === id) {
                response_1.ApiResponseUtil.badRequest(res, 'Cannot delete your own account');
                return;
            }
            const canManage = await permissionService_1.PermissionService.canManageUser(currentUser.id, id);
            if (!canManage) {
                response_1.ApiResponseUtil.forbidden(res, 'Cannot manage this user');
                return;
            }
            const { error } = await database_1.supabase
                .from('admin_users')
                .delete()
                .eq('id', id);
            if (error) {
                logger_1.default.error('Error deleting admin user:', error);
                response_1.ApiResponseUtil.error(res, 'Failed to delete admin user');
                return;
            }
            response_1.ApiResponseUtil.success(res, null, 'Admin user deleted successfully');
        }
        catch (error) {
            logger_1.default.error('Error in deleteAdminUser:', error);
            response_1.ApiResponseUtil.error(res, 'Internal server error');
        }
    }
    static async getRoles(req, res) {
        try {
            const roles = await permissionService_1.PermissionService.getAllRoles();
            response_1.ApiResponseUtil.success(res, roles);
        }
        catch (error) {
            logger_1.default.error('Error in getRoles:', error);
            response_1.ApiResponseUtil.error(res, 'Internal server error');
        }
    }
    static async getRoleDetails(req, res) {
        try {
            const { role } = req.params;
            const [roleDetails, rolePermissions, availablePermissions] = await Promise.all([
                permissionService_1.PermissionService.getRoleByName(role),
                permissionService_1.PermissionService.getRolePermissions(role),
                permissionService_1.PermissionService.getAvailablePermissionsForRole(role)
            ]);
            if (!roleDetails) {
                response_1.ApiResponseUtil.notFound(res, 'Role not found');
                return;
            }
            const response = {
                role: roleDetails,
                permissions: rolePermissions,
                availablePermissions
            };
            response_1.ApiResponseUtil.success(res, response);
        }
        catch (error) {
            logger_1.default.error('Error in getRoleDetails:', error);
            response_1.ApiResponseUtil.error(res, 'Internal server error');
        }
    }
    static async updateRolePermissions(req, res) {
        try {
            const { role } = req.params;
            const { permissionIds } = req.body;
            if (!Array.isArray(permissionIds)) {
                response_1.ApiResponseUtil.badRequest(res, 'permissionIds must be an array');
                return;
            }
            await permissionService_1.PermissionService.updateRolePermissions(role, permissionIds);
            response_1.ApiResponseUtil.success(res, null, 'Role permissions updated successfully');
        }
        catch (error) {
            logger_1.default.error('Error in updateRolePermissions:', error);
            response_1.ApiResponseUtil.error(res, 'Internal server error');
        }
    }
    static async getPermissions(req, res) {
        try {
            const { resource } = req.query;
            let permissions;
            if (resource) {
                permissions = await permissionService_1.PermissionService.getPermissionsByResource(resource);
            }
            else {
                permissions = await permissionService_1.PermissionService.getAllPermissions();
            }
            response_1.ApiResponseUtil.success(res, permissions);
        }
        catch (error) {
            logger_1.default.error('Error in getPermissions:', error);
            response_1.ApiResponseUtil.error(res, 'Internal server error');
        }
    }
    static async getPermissionMatrix(req, res) {
        try {
            const matrix = await permissionService_1.PermissionService.getPermissionMatrix();
            response_1.ApiResponseUtil.success(res, matrix);
        }
        catch (error) {
            logger_1.default.error('Error in getPermissionMatrix:', error);
            response_1.ApiResponseUtil.error(res, 'Internal server error');
        }
    }
    static async getCurrentUserPermissions(req, res) {
        try {
            const currentUser = req.admin;
            const permissions = await permissionService_1.PermissionService.getAdminPermissions(currentUser.id);
            response_1.ApiResponseUtil.success(res, permissions);
        }
        catch (error) {
            logger_1.default.error('Error in getCurrentUserPermissions:', error);
            response_1.ApiResponseUtil.error(res, 'Internal server error');
        }
    }
}
exports.AdminManagementController = AdminManagementController;
//# sourceMappingURL=adminManagementController.js.map