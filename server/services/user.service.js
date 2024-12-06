// Import the user model
import { UserModel } from "../database/models/user.model.js";
import { pagination } from "../utils/common.util.js";
import { Op } from "sequelize";
import bcrypt from "bcrypt";


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
      updatedAt: newUser.updatedAt,
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

// Get all users with pagination, filtering, and sorting
export const getAllUsersService = async ({
  page,
  limit,
  searchQuery,
  sortBy,
  order,
}) => {
  try {
    // Default values
    const validSortFields = ['id', 'name', 'email', 'role'];
    const validOrderValues = ['ASC', 'DESC'];

    // Validate sortBy and order inputs
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'role';
    const sortOrder = validOrderValues.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    const users = await UserModel.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${searchQuery}%` } },
          { email: { [Op.like]: `%${searchQuery}%` } },
        ],
      },
      order: [[sortField, sortOrder]],
      ...pagination({ page, limit }),
      logging: console.log, // Logs query execution
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
      updatedAt: user.updatedAt,
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
        id: { [Op.ne]: currentUserId }, // exclude current user
      },
    });
    return !existingUser; // returns true if email is available, false if taken
  } catch (error) {
    throw new Error(error);
  }
};

// Check if provided password matches user's current password
export const passwordCheckService = async (userId, currentPassword) => {
  try {
    // Validate input
    if (!userId || !currentPassword) {
      throw new Error("User ID and current password are required");
    }

    const user = await UserModel.findByPk(userId, {
      attributes: ["id", "name", "email", "password"], // Explicitly include password
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Additional null/undefined check for password
    if (!user.password) {
      throw new Error("No password found for this user");
    }

    // Use bcrypt to compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    return isPasswordValid;
  } catch (error) {
    console.error("Password check error:", error);
    throw error;
  }
};

// Get user statistics (count by role)
export const userStatCheckService = async () => {
  try {
    const roles = ["admin", "data manager", "employee"];
    const counts = {};

    // Loop through roles and count occurrences
    for (const role of roles) {
      counts[`${role.replace(" ", "")}Count`] = await UserModel.count({
        where: { role },
      });
    }

    return counts;
  } catch (error) {
    throw new Error(`Failed to fetch user statistics: ${error.message}`);
  }
};


