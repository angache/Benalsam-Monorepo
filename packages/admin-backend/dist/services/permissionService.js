"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
const database_1 = require("../config/database");
const admin_types_1 = require("../types/admin-types");
const logger_1 = __importDefault(require("../config/logger"));
class PermissionService {
    static async getAdminPermissions(adminId) {
        try {
            logger_1.default.warn('Using fallback permissions for admin:', adminId);
            const { data: admin } = await database_1.supabase
                .from('admin_users')
                .select('role')
                .eq('id', adminId)
                .single();
            if (admin?.role === 'SUPER_ADMIN') {
                const now = new Date().toISOString();
                return [
                    { id: '1', name: 'dashboard:view', resource: 'dashboard', action: 'view', created_at: now, updated_at: now },
                    { id: '2', name: 'listings:view', resource: 'listings', action: 'view', created_at: now, updated_at: now },
                    { id: '3', name: 'listings:moderate', resource: 'listings', action: 'moderate', created_at: now, updated_at: now },
                    { id: '4', name: 'categories:view', resource: 'categories', action: 'view', created_at: now, updated_at: now },
                    { id: '5', name: 'categories:edit', resource: 'categories', action: 'edit', created_at: now, updated_at: now },
                    { id: '6', name: 'categories:delete', resource: 'categories', action: 'delete', created_at: now, updated_at: now },
                    { id: '7', name: 'users:view', resource: 'users', action: 'view', created_at: now, updated_at: now },
                    { id: '8', name: 'users:manage', resource: 'users', action: 'manage', created_at: now, updated_at: now },
                    { id: '9', name: 'users:ban', resource: 'users', action: 'ban', created_at: now, updated_at: now },
                    { id: '10', name: 'users:delete', resource: 'users', action: 'delete', created_at: now, updated_at: now },
                    { id: '11', name: 'admins:view', resource: 'admins', action: 'view', created_at: now, updated_at: now },
                    { id: '12', name: 'admins:create', resource: 'admins', action: 'create', created_at: now, updated_at: now },
                    { id: '13', name: 'admins:edit', resource: 'admins', action: 'edit', created_at: now, updated_at: now },
                    { id: '14', name: 'admins:delete', resource: 'admins', action: 'delete', created_at: now, updated_at: now },
                    { id: '15', name: 'admins:roles', resource: 'admins', action: 'roles', created_at: now, updated_at: now }
                ];
            }
            return [];
        }
        catch (error) {
            logger_1.default.error('Error in getAdminPermissions:', error);
            return [];
        }
    }
    static async hasPermission(adminId, permissionName) {
        try {
            const { data, error } = await database_1.supabase
                .rpc('has_admin_permission', {
                p_admin_id: adminId,
                p_permission_name: permissionName
            });
            if (error) {
                logger_1.default.error('Error checking permission:', error);
                throw error;
            }
            return data || false;
        }
        catch (error) {
            logger_1.default.error('Error in hasPermission:', error);
            throw error;
        }
    }
    static async hasResourcePermission(adminId, resource, action) {
        try {
            const permissionName = `${resource}:${action}`;
            return await this.hasPermission(adminId, permissionName);
        }
        catch (error) {
            logger_1.default.error('Error in hasResourcePermission:', error);
            throw error;
        }
    }
    static async getAllPermissions() {
        try {
            const { data, error } = await database_1.supabase
                .from('admin_permissions')
                .select('*')
                .order('resource, action');
            if (error) {
                logger_1.default.error('Error getting all permissions:', error);
                throw error;
            }
            return data || [];
        }
        catch (error) {
            logger_1.default.error('Error in getAllPermissions:', error);
            throw error;
        }
    }
    static async getPermissionsByResource(resource) {
        try {
            const { data, error } = await database_1.supabase
                .from('admin_permissions')
                .select('*')
                .eq('resource', resource)
                .order('action');
            if (error) {
                logger_1.default.error('Error getting permissions by resource:', error);
                throw error;
            }
            return data || [];
        }
        catch (error) {
            logger_1.default.error('Error in getPermissionsByResource:', error);
            throw error;
        }
    }
    static async getAllRoles() {
        try {
            const { data, error } = await database_1.supabase
                .from('admin_roles')
                .select('*')
                .eq('is_active', true)
                .order('level', { ascending: false });
            if (error) {
                logger_1.default.error('Error getting all roles:', error);
                throw error;
            }
            return data || [];
        }
        catch (error) {
            logger_1.default.error('Error in getAllRoles:', error);
            throw error;
        }
    }
    static async getRoleByName(name) {
        try {
            const { data, error } = await database_1.supabase
                .from('admin_roles')
                .select('*')
                .eq('name', name)
                .single();
            if (error) {
                logger_1.default.error('Error getting role by name:', error);
                throw error;
            }
            return data;
        }
        catch (error) {
            logger_1.default.error('Error in getRoleByName:', error);
            throw error;
        }
    }
    static async getRolePermissions(role) {
        try {
            const { data: rolePermissions, error: roleError } = await database_1.supabase
                .from('admin_role_permissions')
                .select('permission_id')
                .eq('role', role);
            if (roleError) {
                logger_1.default.error('Error getting role permission IDs:', roleError);
                throw roleError;
            }
            if (!rolePermissions || rolePermissions.length === 0) {
                return [];
            }
            const permissionIds = rolePermissions.map(rp => rp.permission_id);
            const { data: permissions, error: permError } = await database_1.supabase
                .from('admin_permissions')
                .select('*')
                .in('id', permissionIds)
                .order('resource, action');
            if (permError) {
                logger_1.default.error('Error getting permissions:', permError);
                throw permError;
            }
            return permissions || [];
        }
        catch (error) {
            logger_1.default.error('Error in getRolePermissions:', error);
            throw error;
        }
    }
    static async getUserPermissions(adminId) {
        try {
            const { data, error } = await database_1.supabase
                .from('admin_user_permissions')
                .select(`
          *,
          admin_permissions (*)
        `)
                .eq('admin_id', adminId);
            if (error) {
                logger_1.default.error('Error getting user permissions:', error);
                throw error;
            }
            return data || [];
        }
        catch (error) {
            logger_1.default.error('Error in getUserPermissions:', error);
            throw error;
        }
    }
    static async grantUserPermission(adminId, permissionId, grantedBy) {
        try {
            const { data, error } = await database_1.supabase
                .from('admin_user_permissions')
                .insert({
                admin_id: adminId,
                permission_id: permissionId,
                granted_by: grantedBy
            })
                .select()
                .single();
            if (error) {
                logger_1.default.error('Error granting user permission:', error);
                throw error;
            }
            return data;
        }
        catch (error) {
            logger_1.default.error('Error in grantUserPermission:', error);
            throw error;
        }
    }
    static async revokeUserPermission(adminId, permissionId) {
        try {
            const { error } = await database_1.supabase
                .from('admin_user_permissions')
                .delete()
                .eq('admin_id', adminId)
                .eq('permission_id', permissionId);
            if (error) {
                logger_1.default.error('Error revoking user permission:', error);
                throw error;
            }
        }
        catch (error) {
            logger_1.default.error('Error in revokeUserPermission:', error);
            throw error;
        }
    }
    static async updateRolePermissions(role, permissionIds) {
        try {
            const { error: deleteError } = await database_1.supabase
                .from('admin_role_permissions')
                .delete()
                .eq('role', role);
            if (deleteError) {
                logger_1.default.error('Error deleting role permissions:', deleteError);
                throw deleteError;
            }
            if (permissionIds.length > 0) {
                const rolePermissions = permissionIds.map(permissionId => ({
                    role,
                    permission_id: permissionId
                }));
                const { error: insertError } = await database_1.supabase
                    .from('admin_role_permissions')
                    .insert(rolePermissions);
                if (insertError) {
                    logger_1.default.error('Error inserting role permissions:', insertError);
                    throw insertError;
                }
            }
        }
        catch (error) {
            logger_1.default.error('Error in updateRolePermissions:', error);
            throw error;
        }
    }
    static async getPermissionMatrix() {
        try {
            const roles = await this.getAllRoles();
            const matrix = {};
            for (const role of roles) {
                matrix[role.name] = await this.getRolePermissions(role.name);
            }
            return matrix;
        }
        catch (error) {
            logger_1.default.error('Error in getPermissionMatrix:', error);
            throw error;
        }
    }
    static async canManageUser(managerId, targetUserId) {
        try {
            const { data: manager, error: managerError } = await database_1.supabase
                .from('admin_users')
                .select('role, level')
                .eq('id', managerId)
                .single();
            const { data: target, error: targetError } = await database_1.supabase
                .from('admin_users')
                .select('role, level')
                .eq('id', targetUserId)
                .single();
            if (managerError || targetError) {
                logger_1.default.error('Error getting users for management check:', { managerError, targetError });
                throw managerError || targetError;
            }
            if (manager.role === admin_types_1.AdminRole.SUPER_ADMIN) {
                return true;
            }
            if (managerId === targetUserId) {
                return false;
            }
            const managerRole = await this.getRoleByName(manager.role);
            const targetRole = await this.getRoleByName(target.role);
            if (!managerRole || !targetRole) {
                return false;
            }
            return managerRole.level > targetRole.level;
        }
        catch (error) {
            logger_1.default.error('Error in canManageUser:', error);
            throw error;
        }
    }
    static async getAvailablePermissionsForRole(role) {
        try {
            const allPermissions = await this.getAllPermissions();
            const rolePermissions = await this.getRolePermissions(role);
            const rolePermissionNames = rolePermissions.map(p => p.name);
            return allPermissions.filter(permission => !rolePermissionNames.includes(permission.name));
        }
        catch (error) {
            logger_1.default.error('Error in getAvailablePermissionsForRole:', error);
            throw error;
        }
    }
}
exports.PermissionService = PermissionService;
//# sourceMappingURL=permissionService.js.map