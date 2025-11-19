// lib/permissionTypes.ts

/**
 * Enum for user roles
 */
export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
    PARTNER = 'PARTNER',
}

/**
 * Enum for resources that can be accessed
 */
export enum Resource {
    USER = 'USER',
    PARTNER = 'PARTNER',
    ROLE = 'ROLE',
    PRODUCT = 'PRODUCT',
    ORDER = 'ORDER',
    REPORT = 'REPORT',
    SETTING = 'SETTING',
    // Add more resources as needed
    PROVIDER = 'PROVIDER',
    AUTH_CONFIG = 'AUTH_CONFIG',
    API_MANAGEMENT = 'API_MANAGEMENT',
}

export enum RES_PERM_ACTION {
    USER_READ = 'USER:READ',
    USER_CREATE = 'USER:CREATE',
    USER_UPDATE = 'USER:UPDATE',
    USER_DELETE = 'USER:DELETE',
    PROVIDER_READ = 'PROVIDER:READ',
    PROVIDER_CREATE = 'PROVIDER:CREATE',
    PROVIDER_UPDATE = 'PROVIDER:UPDATE',
    PROVIDER_DELETE = 'PROVIDER:DELETE',
    AUTH_CONFIG_READ = 'AUTH_CONFIG:READ',
    AUTH_CONFIG_CREATE = 'AUTH_CONFIG:CREATE',
    AUTH_CONFIG_UPDATE = 'AUTH_CONFIG:UPDATE',
    AUTH_CONFIG_DELETE = 'AUTH_CONFIG:DELETE',
    API_MANAGEMENT_READ = 'API_MANAGEMENT:READ',
    API_MANAGEMENT_CREATE = 'API_MANAGEMENT:CREATE',
    API_MANAGEMENT_UPDATE = 'API_MANAGEMENT:UPDATE',
    API_MANAGEMENT_DELETE = 'API_MANAGEMENT:DELETE',
}

/**
 * Enum for actions that can be performed on resources
 */
export enum Action {
    READ = 'READ',
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    // Add more actions as needed
}

/**
 * Type representing a permission as a string (e.g., "USER:READ")
 */
export type PermissionString = `${Resource}:${Action}`;

/**
 * Helper function to generate a permission string from resource and action
 */
export const createPermission = (resource: Resource, action: Action): PermissionString => {
    return `${resource}:${action}`;
};

/**
 * Helper function to parse a permission string into resource and action
 */
export const parsePermissionString = (permission: string): { resource: Resource; action: Action } | null => {
    const [resourceStr, actionStr] = permission.split(':');

    if (!resourceStr || !actionStr) return null;

    const resource = Object.values(Resource).find(r => r === resourceStr) as Resource;
    const action = Object.values(Action).find(a => a === actionStr) as Action;

    if (!resource || !action) return null;

    return { resource, action };
};

/**
 * Generate all possible permissions based on resources and actions
 */
export const generateAllPermissions = (): PermissionString[] => {
    const permissions: PermissionString[] = [];

    Object.values(Resource).forEach(resource => {
        Object.values(Action).forEach(action => {
            permissions.push(createPermission(resource as Resource, action as Action));
        });
    });

    return permissions;
};

/**
 * Generate specific permissions based on resources and actions
 */
export const generatePermissions = (
    resources: Resource[],
    actions: Action[]
): PermissionString[] => {
    const permissions: PermissionString[] = [];

    resources.forEach(resource => {
        actions.forEach(action => {
            permissions.push(createPermission(resource, action));
        });
    });

    return permissions;
};

/**
 * Role-based permission definitions
 */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionString[]> = {
    [UserRole.USER]: [
        createPermission(Resource.USER, Action.READ),
    ],
    [UserRole.ADMIN]: [
        ...generatePermissions(
            [Resource.USER, Resource.PARTNER],
            [Action.READ, Action.CREATE, Action.UPDATE, Action.DELETE]
        ),
        createPermission(Resource.REPORT, Action.READ),
        createPermission(Resource.SETTING, Action.READ),
    ],
    [UserRole.PARTNER]: [
        createPermission(Resource.PARTNER, Action.READ),
        createPermission(Resource.PRODUCT, Action.READ),
        createPermission(Resource.PRODUCT, Action.CREATE),
    ],
    [UserRole.SUPER_ADMIN]: generateAllPermissions(),
};

/**
 * Interface for the decoded JWT token
 */
export interface DecodedToken {
    sub: string;
    role: string; // Will map to UserRole
    scope: string; // Space-separated list of permissions
    iss: string;
    exp: number;
    type: string;
    iat: number;
    userId: number;
}