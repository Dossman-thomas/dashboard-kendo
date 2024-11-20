// Initiate all controllers here

// Users
export {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getCurrentUser,
  checkEmailAvailability,
  checkCurrentPassword,
} from './user.controller.js';

// Permissions
export {
  getPermissions,
  getAllPermissions,
  getPermissionsForRole,
  updatePermissionsForRole,
} from "./permission.controller.js";

// Auth
export { loginUser } from "./auth.controller.js";