import { RolePermissionModel } from '../database/models/index.js';

  // Check current role permissions for a specific user
  export const getPermissionsForUser = async (userId) => {
    try {
      const userPermissions = await RolePermissionModel.findOne({ where: { id } });
      return userPermissions;
    } catch (error) {
      throw new Error('Error fetching permissions for user, error: ', error);
    }
  };

// Retrieve all permissions
export const getAllPermissionsService = async () => {
  try {
    const permissions = await RolePermissionModel.findAll();
    return permissions;
  } catch (error) {
    throw new Error('Error fetching permissions, error: ', error);
  }
};

// Get permissions for a specific role
export const getPermissionsForRoleService = async (role) => {
    try {
        const rolePermissions = await RolePermissionModel.findOne({ where: { role } });
        return rolePermissions;
    } catch (error) {
        throw new Error('Error fetching permissions for role, error: ', error);
    }
}; 

// Update permissions for a specific role
export const updatePermissionsForRoleService = async (role, updatedPermissions) => {
    try {
        const rolePermissions = await RolePermissionModel.findOne({ where: { role } });
        if (!rolePermissions) {
            throw new Error(`Permissions for role "${role}" not found`);
        }
        await rolePermissions.update(updatedPermissions);
        return rolePermissions;
    } catch (error) {
        throw new Error('Error updating permissions for role, error: ', error);
    }
}


