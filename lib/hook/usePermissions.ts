// hooks/usePermissions.ts
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import {
    UserRole,
    Resource,
    Action,
    PermissionString,
    createPermission
} from '../enums/permissionEnums';

export const usePermissions = () => {
    const { data: session, status } = useSession();

    // // Debug logs
    // console.log('usePermissions hook - session:', session);
    // console.log('usePermissions hook - status:', status);

    // Only parse permissions if authenticated
    const isAuthenticated = status === 'authenticated';

    // Parse user permissions only when session exists
    const userPermissions = useMemo(() => {
        if (!isAuthenticated || !session?.user?.permissions) return [];
        return session.user.permissions.filter(p => p.includes(':'));
    }, [isAuthenticated, session?.user?.permissions]);

    // Get user roles
    const userRoles = useMemo(() => {
        if (!isAuthenticated || !session?.user?.permissions) return [];
        return session.user.permissions.filter(p => p.startsWith('ROLE_'));
    }, [isAuthenticated, session?.user?.permissions]);

    // Get user role
    const userRole = useMemo(() => {
        if (!isAuthenticated || !session?.user?.role) return undefined;
        return session.user.role;
    }, [isAuthenticated, session?.user?.role]);

    const isSuperAdmin = useMemo(() => {
        return userRole === UserRole.SUPER_ADMIN;
    }, [userRole]);

    // Create safe permission functions that check authentication status first
    const hasRole = (role: string) => {
        if (!isAuthenticated || !session?.user) return false;
        if (isSuperAdmin) return true;

        if (role.startsWith('ROLE_')) {
            return !!session.user.permissions?.includes(role);
        }
        return session.user.role === role;
    };

    const hasPermission = (permission: string) => {
        if (!isAuthenticated || !session?.user?.permissions) return false;
        if (isSuperAdmin) return true;
        return !!session.user.permissions.includes(permission);
    };

    const hasResourcePermission = (resource: string, action: string) => {
        if (!isAuthenticated || !session?.user) return false;
        if (isSuperAdmin) return true;

        const permString = `${resource}:${action}`;
        return hasPermission(permString);
    };

    const hasResourceAccess = (resource: string) => {
        if (!isAuthenticated || !session?.user?.permissions) return false;
        if (isSuperAdmin) return true;

        return session.user.permissions.some(perm => {
            if (!perm.includes(':')) return false;
            const resourcePart = perm.split(':')[0];
            return resourcePart === resource;
        });
    };

    const hasAllPermissions = (permissions: string[]) => {
        if (!isAuthenticated || !session?.user?.permissions) return false;
        if (isSuperAdmin) return true;

        return permissions.every(perm =>
            session.user.permissions!.includes(perm)
        );
    };

    const hasAnyPermission = (permissions: string[]) => {
        if (!isAuthenticated || !session?.user?.permissions) return false;
        if (isSuperAdmin) return true;
        return permissions.some(perm =>
            session.user.permissions!.includes(perm)
        );
    };

    // Create a resource permission checker
    const forResource = (resource: Resource) => {
        return {
            canRead: () => hasResourcePermission(resource, Action.READ),
            canCreate: () => hasResourcePermission(resource, Action.CREATE),
            canUpdate: () => hasResourcePermission(resource, Action.UPDATE),
            canDelete: () => hasResourcePermission(resource, Action.DELETE),
            hasAccess: () => hasResourceAccess(resource),
        };
    };

    const isSuperAdminOrAdmin = useMemo(() => {
        return userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN;
    }, [userRole]);

    const isAdmin = useMemo(() => {
        return userRole === UserRole.ADMIN;
    }, [userRole]);

    return {
        // Auth status
        isLoading: status === 'loading',
        isAuthenticated,

        // Permission functions
        hasRole,
        hasPermission,
        hasResourcePermission,
        hasResourceAccess,
        hasAllPermissions,
        hasAnyPermission,
        forResource,

        // Create permission helper
        createPermission,

        // User data
        session,
        userRole,
        userRoles,
        userPermissions,
        isSuperAdmin,
        isAdmin,
        userId: session?.user,
        isSuperAdminOrAdmin,
        // Constants
        UserRole,
        Resource,
        Action,
    };
};

export default usePermissions;
