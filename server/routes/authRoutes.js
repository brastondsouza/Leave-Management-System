import express from "express";
import { getProfile, login, register, getAllUsers, updateUser, deleteUser } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.get("/users", authMiddleware, getAllUsers);
router.put("/users/:id", authMiddleware, updateUser);
router.delete("/users/:id", authMiddleware, deleteUser);

router.get("/test", (req, res) => {
  res.json({ message: "Test route works" });
});

export default router;