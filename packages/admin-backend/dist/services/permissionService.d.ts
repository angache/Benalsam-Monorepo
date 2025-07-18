import { Permission, UserPermission, AdminRole, AdminRoleDefinition } from '../types';
export declare class PermissionService {
    static getAdminPermissions(adminId: string): Promise<Permission[]>;
    static hasPermission(adminId: string, permissionName: string): Promise<boolean>;
    static hasResourcePermission(adminId: string, resource: string, action: string): Promise<boolean>;
    static getAllPermissions(): Promise<Permission[]>;
    static getPermissionsByResource(resource: string): Promise<Permission[]>;
    static getAllRoles(): Promise<AdminRoleDefinition[]>;
    static getRoleByName(name: string): Promise<AdminRoleDefinition | null>;
    static getRolePermissions(role: AdminRole): Promise<Permission[]>;
    static getUserPermissions(adminId: string): Promise<UserPermission[]>;
    static grantUserPermission(adminId: string, permissionId: string, grantedBy: string): Promise<UserPermission>;
    static revokeUserPermission(adminId: string, permissionId: string): Promise<void>;
    static updateRolePermissions(role: AdminRole, permissionIds: string[]): Promise<void>;
    static getPermissionMatrix(): Promise<Record<string, Permission[]>>;
    static canManageUser(managerId: string, targetUserId: string): Promise<boolean>;
    static getAvailablePermissionsForRole(role: AdminRole): Promise<Permission[]>;
}
//# sourceMappingURL=permissionService.d.ts.map