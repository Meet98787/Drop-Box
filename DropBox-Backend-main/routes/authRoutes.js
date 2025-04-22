const express = require("express");
const {
  register,
  login,
  createUser,
  logout,
  getUsers,
  updateUser,
  deleteUser,
  getProfile,
  createDefaultAdmin,
  checkAuth,
  forgotPassword,
  verifyOtp,
  resetPassword,
  changePassword,
} = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/login", login);
router.post("/create-user", authMiddleware, createUser);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, getProfile);
router.get("/defaultadmin", createDefaultAdmin);

router.put("/change-password", authMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);


module.exports = router;
