// Import the user model
import { UserModel } from "../database/models/user.model.js";
import { pagination } from "../utils/common.util.js";
import { Op } from "sequelize";

// Create a new user
export const createUserService = async (userData) => {
  try {
    const newUser = await UserModel.create(userData);
    // Return user without password
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };
    return userResponse;
  } catch (error) {
    throw new Error(error);
  }
};

// Get a user by ID
export const getUserByIdService = async (id) => {
  try {
    const user = await UserModel.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    throw new Error(error);
  }
};

// Get all users with pagination
export const getAllUsersService = async ({
  page,
  limit,
  searchQuery,
  sortBy,
  order,
}) => {
  try {
    const users = await UserModel.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${searchQuery}%` } }, // search by name
          { email: { [Op.like]: `%${searchQuery}%` } }, // search by email
        ],
      },
      order: [[sortBy, order]], // sort by the specified field and order
      ...pagination({ page, limit }), // use pagination function to limit results
      logging: console.log,
    });

    return users;
  } catch (error) {
    console.log("Model:", UserModel); // Check if the model is correctly defined
    console.log("params:", { page, limit, searchQuery, sortBy, order }); // Log the parameters for debugging
    console.log("Error:", error); // Log the error for debugging
    throw new Error(error.message);
  }
};

// Update a user by ID
export const updateUserService = async (id, updatedData) => {
  try {
    const user = await UserModel.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }
    await user.update(updatedData);
    
    // Return updated user without password
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      updatedAt: user.updatedAt
    };
    return userResponse;
  } catch (error) {
    throw new Error(error);
  }
};

// Delete a user by ID
export const deleteUserService = async (id) => {
  try {
    const user = await UserModel.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }
    await user.destroy();
    return { message: "User deleted successfully" };
  } catch (error) {
    throw new Error(error);
  }
};

// check email availability
export const checkEmailAvailabilityService = async (email, currentUserId) => {
  try {
    const existingUser = await UserModel.findOne({
      where: {
        email,
        id: { [Op.ne]: currentUserId } // exclude current user
      }
    });
    return !existingUser; // returns true if email is available, false if taken
  } catch (error) {
    throw new Error(error);
  }
};
