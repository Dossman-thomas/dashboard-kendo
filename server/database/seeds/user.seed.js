import { UserModel } from "../models/index.js";
import bcrypt from "bcrypt";

const users = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "Admin@123!",
    role: "admin",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "Manager@123!",
    role: "data manager",
  },
  {
    name: "Bob Johnson",
    email: "bob@example.com",
    password: "Employee@123!",
    role: "employee",
  },
  {
    name: "Emily Davis",
    email: "emily@example.com",
    password: "Manager@234!",
    role: "data manager",
  },
  {
    name: "Daniel Garcia",
    email: "daniel@example.com",
    password: "Manager@345!",
    role: "data manager",
  },
  {
    name: "Sarah Wilson",
    email: "sarah@example.com",
    password: "Manager@456!",
    role: "data manager",
  },
  {
    name: "David Martinez",
    email: "david@example.com",
    password: "Manager@567!",
    role: "data manager",
  },
  {
    name: "Laura Anderson",
    email: "laura@example.com",
    password: "Manager@678!",
    role: "data manager",
  },
  {
    name: "James Moore",
    email: "james@example.com",
    password: "Manager@789!",
    role: "data manager",
  },
  {
    name: "Olivia Taylor",
    email: "olivia@example.com",
    password: "Manager@890!",
    role: "data manager",
  },
  {
    name: "Robert Thomas",
    email: "robert@example.com",
    password: "Manager@901!",
    role: "data manager",
  },
  {
    name: "Sophia Jackson",
    email: "sophia@example.com",
    password: "Manager@012!",
    role: "data manager",
  },
  {
    name: "William White",
    email: "william@example.com",
    password: "Manager@1234!",
    role: "data manager",
  },
  {
    name: "Liam Harris",
    email: "liam@example.com",
    password: "Employee@234!",
    role: "employee",
  },
  {
    name: "Mia Clark",
    email: "mia@example.com",
    password: "Employee@345!",
    role: "employee",
  },
  {
    name: "Noah Lewis",
    email: "noah@example.com",
    password: "Employee@456!",
    role: "employee",
  },
  {
    name: "Isabella Robinson",
    email: "isabella@example.com",
    password: "Employee@567!",
    role: "employee",
  },
  {
    name: "Ethan Walker",
    email: "ethan@example.com",
    password: "Employee@678!",
    role: "employee",
  },
  {
    name: "Ava Young",
    email: "ava@example.com",
    password: "Employee@789!",
    role: "employee",
  },
];

// Function to hash the passwords
const hashPassword = async (password) => {
  const saltRounds = 10; // You can adjust the salt rounds as needed
  return await bcrypt.hash(password, saltRounds);
};

// Seed users to the database using the UserModel function
const seedUsers = async () => {
  // Hash passwords for all users before saving
  for (const user of users) {
    user.password = await hashPassword(user.password);
  }
  await UserModel.bulkCreate(users);
};

// Export the seedUsers function
export { seedUsers };
