import { Router } from "express";
import { authenticateJWT } from "../middleware/jwt.auth.js";
import {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  getCurrentUser,
  checkEmailAvailability,
} from "../controllers/index.js";

export const userRouter = Router();

// Create a new user route
userRouter.post('/create-new', authenticateJWT, createUser); // endpoint: /api/users/create-new

// no duplicate email check route
userRouter.post('/check-email/:id', authenticateJWT, checkEmailAvailability); // endpoint: /api/users/check-email

// Get a user by ID route
userRouter.get('/:id', authenticateJWT, getUserById); // endpoint: /api/users/:id

// Get all users route
userRouter.get('/', authenticateJWT, getAllUsers); // endpoint: /api/users

// Update a user by ID route
userRouter.put('/update/:id', authenticateJWT, updateUser); // endpoint: /api/users/update/:id

// Delete a user by ID route
userRouter.delete('/delete/:id', authenticateJWT, deleteUser); // endpoint: /api/users/delete/:id

// Fetch current User
userRouter.get('/current-user/:id', authenticateJWT, getCurrentUser); // endpoint: /api/users/current-user/:id

// // Verify user password route
// userRouter.post('/:id/verify-password', verifyUserPassword); // endpoint: /api/users/:id/verify-password