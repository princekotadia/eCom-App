import express from "express";
const customerRouter = express.Router();
import { login, register, profile, logout } from "../controllers/customer.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

customerRouter.post("/register", register);
customerRouter.post("/login", login);
customerRouter.get("/me", authMiddleware, profile);
customerRouter.post("/logout", logout);

export default customerRouter;