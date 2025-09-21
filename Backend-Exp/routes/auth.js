import express from "express";
import { register, login } from "../controllers/authController.js";
import {
  getUserById,
  updateUser,
  deleteUser
} from "../controllers/userController.js";

const router = express.Router();

// REGISTER
router.post("/register", register);

// LOGIN 
router.post("/login", login);

router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;