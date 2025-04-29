import express from "express";
import { login, logout, register } from "../controllers/userControllers";
import { isAuthenticated } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", isAuthenticated, logout);

export default router;
