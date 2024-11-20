import { RolePermissionModel } from "../models/index.js";

const permissions = [
  {
    role: "admin",
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: true,
  },
  {
    role: "data manager",
    canCreate: true,
    canRead: true,
    canUpdate: true,
    canDelete: false,
  },
  {
    role: "employee",
    canCreate: false,
    canRead: true,
    canUpdate: false,
    canDelete: false,
  },
];

const seedPermissions = async () => {
  try {
    await RolePermissionModel.bulkCreate(permissions);
    console.log("Permissions seeded successfully");
  } catch (error) {
    console.error("Error seeding permissions: ", error);
  }
}; 

export { seedPermissions }; 