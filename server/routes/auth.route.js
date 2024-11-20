import { Router } from "express";
import { loginUser } from "../controllers/index.js";

export const authRouter = Router();

authRouter.post("/login", loginUser); // endpoint: /api/auth/login