// Import the user model
import { UserModel } from "../database/models/user.model.js";
import { pagination } from "../utils/common.util.js";
import { Op, Sequelize } from "sequelize";
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

// // Get all users with pagination, sorting, filtering, and search
// export const getAllUsersService = async ({
//   page,
//   limit,
//   sorts,
//   filters,
//   searchQuery = '',
// }) => {
//   try {
//     // Handle sorting dynamically
//     const order = sorts && sorts.length > 0
//     ? sorts
//         .filter((sort) => sort.dir) // Exclude elements where dir is undefined
//         .map((sort) => [sort.field, sort.dir.toUpperCase()])
//     : [['createdAt', 'DESC']]; // Default order

//     const operatorMapping = {
//       contains: Op.like,
//       doesnotcontain: Op.notLike,
//       equals: Op.eq,
//       startsWith: Op.startsWith,
//       endsWith: Op.endsWith,
//       greaterThan: Op.gt,
//       lessThan: Op.lt,
//       greaterThanOrEquals: Op.gte,
//       lessThanOrEquals: Op.lte,
//       notEquals: Op.ne,
//     };

//        // Construct the 'where' clause based on filters and search query
//     const where = {
//       [Op.and]: [
//         // Apply filters dynamically
//         ...(filters?.length
//           ? filters.map((filter) => {
//               const operator = operatorMapping[filter.operator] || Op.eq; // Default to 'equals' if no match
//             console.log("Getting Filter", filter);
//               return {
//                 [filter.field]: {
//                   [operator]:
//                     filter.operator === 'contains'
//                       ? `%${filter.value}%`
//                       : filter.value,
//                 },
//               };
//             })
//           : []),
//         // Apply search query
//         {
//           [Op.or]: [
//             { name: { [Op.like]: `%${searchQuery}%` } },
//             { email: { [Op.like]: `%${searchQuery}%` } },
//           ],
//         },
//       ],
//     };

//     const users = await UserModel.findAndCountAll({
//       where,
//       order, // Apply sorting
//       ...pagination({ page, limit }),
//       logging: console.log, // Logs query execution
//     });

//     return users;
//   } catch (error) {
//     console.log("Model:", UserModel); // Check if the model is correctly defined
//     console.log("params:", { page, limit, sorts, filters, searchQuery }); // Log the parameters for debugging
//     console.log("Error:", error); // Log the error for debugging
//     throw new Error(error.message);
//   }
// };

// Update a user by ID

// Get all users with pagination, sorting, filtering, and search

export const getAllUsersService = async ({
  page,
  limit,
  sorts,
  filters,
  searchQuery = "",
}) => {
  try {
    // Handle sorting dynamically
    const order =
      sorts && sorts.length > 0
        ? sorts
            .filter((sort) => sort.dir) // Exclude elements where dir is undefined
            .map((sort) => [sort.field, sort.dir.toUpperCase()])
        : [["createdAt", "DESC"]]; // Default order

    const operatorMapping = {
      contains: Op.iLike, 
      doesnotcontain: Op.notiLike,
      eq: Op.eq, // equals
      neq: Op.ne, // not equals
      startswith: Op.startsWith,
      endswith: Op.endsWith,
      greaterThan: Op.gt,
      lessThan: Op.lt,
      greaterThanOrEquals: Op.gte,
      lessThanOrEquals: Op.lte,
    };

    // Construct the 'where' clause based on filters and search query
    const where = {
      [Op.and]: [
        // Apply filters dynamically
        ...(filters?.length
          ? filters.map((filter) => {
              const operator = operatorMapping[filter.operator] || Op.eq; // Default to 'equals' if no match
              console.log("Getting Filter", filter);
              console.log("Getting Operator", operator);
              console.log("Getting Filter Operator : ", filter.operator);
              const value =
                filter.operator === "contains" ||
                filter.operator === "doesnotcontain"
                  ? `%${filter.value}%`
                  : filter.value; // Exact value for other operators

              // Handle casting ENUM column 'role' for various operators
              // if (filter.field === "role") {
              //   if (
              //     filter.operator === "contains" ||
              //     filter.operator === "doesnotcontain" ||
              //     filter.operator === "startswith" ||
              //     filter.operator === "endswith"
              //   ) {
              //     return Sequelize.where(
              //       Sequelize.cast(Sequelize.col("role"), "TEXT"),
              //       operator,
              //       value
              //     );
              //   }
              // }

              return {
                [filter.field]: { [operator]: value },
              };
            })
          : []),
        // Apply search query
        {
          [Op.or]: [
            { name: { [Op.like]: `%${searchQuery}%` } },
            { email: { [Op.like]: `%${searchQuery}%` } },
          ],
        },
      ],
    };

    const users = await UserModel.findAndCountAll({
      where,
      order, // Apply sorting
      ...pagination({ page, limit }),
      logging: console.log, // Logs query execution
    });

    return users;
  } catch (error) {
    console.log("Model:", UserModel); // Check if the model is correctly defined
    console.log("params:", { page, limit, sorts, filters, searchQuery }); // Log the parameters for debugging
    console.log("Error:", error); // Log the error for debugging
    throw new Error(error.message);
  }
};

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
