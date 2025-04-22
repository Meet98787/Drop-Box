const express = require("express");
const {
  getUsers,
  updateUser,
  deleteUser,
  getUserComment,
} = require("../controllers/authController");
const { authMiddleware, verifyUser } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/users", authMiddleware, getUsers);
router.put("/users/:id", authMiddleware, updateUser);
router.put("/users/:id/toggle-status", authMiddleware, deleteUser);
router.get("/user/comments",authMiddleware,verifyUser,getUserComment)

module.exports = router;
