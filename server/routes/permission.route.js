import { Router } from "express";
import {
  getPermissions,
  getAllPermissions,
  getPermissionsForRole,
  updatePermissionsForRole,
} from "../controllers/index.js";


export const permissionRouter = Router();

// Get permissions for a specific user route
permissionRouter.get('/:id', getPermissions); // endpoint: /api/permissions/:id

// Get all permissions route
permissionRouter.get('/', getAllPermissions); // endpoint: /api/permissions

// Get permissions for a specific role route
permissionRouter.get('/role/:role', getPermissionsForRole); // endpoint: /api/permissions/role/:id

// Update permissions for a specific role route 
permissionRouter.put('/role/:role', updatePermissionsForRole); // endpoint: /api/permissions/role/:id