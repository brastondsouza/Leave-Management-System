import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  designation: user.designation,
  leaveBalance: user.leaveBalance,
  leaveBalances: user.leaveBalances,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const register = async (req, res) => {
  try {
    const { name, email, password, role, department, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

const hashedPassword = await bcrypt.hash(password, 10);

const user = await User.create({
  name: name.trim(),
  email: email.toLowerCase().trim(),
  password: hashedPassword,
  role,
  department,
  designation,
});

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: createToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Registration failed", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: createToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch profile", error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  console.log("getAllUsers called");

  try {
    const users = await User.find().select("-password");

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, department, designation, role, casual, sick, earned, leaveBalance } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update only allowed fields
    if (name !== undefined) user.name = name.trim();
    if (email !== undefined) user.email = email.toLowerCase().trim();
    if (department !== undefined) user.department = department;
    if (designation !== undefined) user.designation = designation;
    if (role !== undefined) user.role = role;

    // Handle leave balance (nested sub-document)
    const newLeaveBalance = leaveBalance || {};
    const c = casual !== undefined ? casual : newLeaveBalance.casual;
    const s = sick !== undefined ? sick : newLeaveBalance.sick;
    const e = earned !== undefined ? earned : newLeaveBalance.earned;

    if (c !== undefined || s !== undefined || e !== undefined) {
      user.leaveBalance = {
        casual: c !== undefined ? Number(c) : user.leaveBalance?.casual ?? 10,
        sick: s !== undefined ? Number(s) : user.leaveBalance?.sick ?? 8,
        earned: e !== undefined ? Number(e) : user.leaveBalance?.earned ?? 15,
      };
    }

    await user.save();

    const updatedUser = await User.findById(id).select("-password");

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting currently logged-in user
    const currentUserId = req.user?._id || req.user?.id;
    if (currentUserId && id === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Prevent deleting the last remaining admin account
    if (userToDelete.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "You cannot delete the last remaining admin account.",
        });
      }
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};