import express from "express";
import {
  loginUser,
  logout,
  refresh,
  registerUser,
} from "../controller/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh",authenticate, refresh);
router.post("/logout", logout);

export default router;
