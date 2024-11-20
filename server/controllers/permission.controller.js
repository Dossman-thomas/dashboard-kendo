import { messages } from "../messages/index.js";
import { response } from "../utils/index.js";
import {
  getPermissionsForUser,
  getAllPermissionsService, 
  getPermissionsForRoleService,
  updatePermissionsForRoleService,
} from "../services/index.js";

// Get permissions for a specific user
export const getPermissions = async (req, res) => {
    try {
        const userPermissions = await getPermissionsForUser(req.params.id);
        if (!userPermissions) {
        return response(res, {
            statusCode: 404,
            message: messages.general.PERMISSIONS_NOT_FOUND,
        });
        }
        return response(res, {
        statusCode: 200,
        message: messages.general.SUCCESS,
        data: userPermissions,
        });
    } catch (error) {
        console.error(error);
        return response(res, {
        statusCode: 500,
        message: messages.general.INTERNAL_SERVER_ERROR,
        });
    }
};

// Retrieve all permissions
export const getAllPermissions = async (req, res) => {
    try {
      const permissions = await getAllPermissionsService();
      if (!permissions.length) {
        return response(res, {
          statusCode: 404,
          message: messages.general.PERMISSIONS_NOT_FOUND,
        });
      }
      return response(res, {
        statusCode: 200,
        message: messages.general.SUCCESS,
        data: permissions,
      });
    } catch (error) {
      console.error(error);
      return response(res, {
        statusCode: 500,
        message: messages.general.INTERNAL_SERVER_ERROR,
      });
    }
  };
  
  // Get permissions for a specific role
  export const getPermissionsForRole = async (req, res) => {
    try {
      const rolePermissions = await getPermissionsForRoleService(req.params.role);
      if (!rolePermissions) {
        return response(res, {
          statusCode: 404,
          message: messages.general.PERMISSIONS_NOT_FOUND,
        });
      }
      return response(res, {
        statusCode: 200,
        message: messages.general.SUCCESS,
        data: rolePermissions,
      });
    } catch (error) {
      console.error(error);
      return response(res, {
        statusCode: 500,
        message: messages.general.INTERNAL_SERVER_ERROR,
      });
    }
  };
  
  // Update permissions for a specific role
  export const updatePermissionsForRole = async (req, res) => {
    try {
      const updatedPermissions = await updatePermissionsForRoleService(req.params.role, req.body);
      return response(res, {
        statusCode: 200,
        message: messages.general.SUCCESS,
        data: updatedPermissions,
      });
    } catch (error) {
      console.error(error);
      return response(res, {
        statusCode: 500,
        message: messages.general.INTERNAL_SERVER_ERROR,
      });
    }
  };