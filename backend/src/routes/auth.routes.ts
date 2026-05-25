import express from "express";
import {
  loginUser,
  logout,
  refresh,
  registerUser,
} from "../controller/auth.controller.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
