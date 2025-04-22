const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Config = require("../config");
const crypto = require("crypto");
const sendEmail = require("../config/email");
const Message = require("../models/Message");
const CryptoJS = require("crypto-js");



const generateToken = (user, res) => {
  if (!Config.JWT_SECRET) {
    console.error("JWT_SECRET is undefined! Check .env file.");
    throw new Error("JWT_SECRET is missing.");
  }

  const token = jwt.sign({ id: user._id, role: user.role }, Config.JWT_SECRET, {
    expiresIn: "1d",
  });

  // Set token in HTTP-Only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure only in production
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  });

  return token;
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ❌ Prevent login if account is deactivated
    if (user.isDelete) {
      return res.status(403).json({
        message: "Your account is deactivated. Please contact HR or Admin to activate your account.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true, // ✅ Prevents JavaScript access for security
      secure: true, // ✅ Required for HTTPS in production
      sameSite: "None", // ✅ Allows cross-site cookie usage
      path: "/",
    });

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a User (HR or Admin only) + Send Credentials via Email
exports.createUser = async (req, res) => {
  try {
    if (!["admin", "hr"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { name, email, role } = req.body;

    if (req.user.role === "hr" && role === "admin") {
      return res.status(403).json({ message: "HR cannot create an Admin" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const randomPassword = crypto.randomBytes(8).toString("hex");


    const user = await User.create({ name, email, password: randomPassword, role });

    const emailSubject = "Your Account Credentials";
    const emailText = `Hello ${name},\n\nYour account has been created.\n\nLogin Details:\nEmail: ${email}\nPassword: ${randomPassword}\n\nPlease use this password to log in and change it upon first login.\n\nRegards,\nDropBox Team`;

    await sendEmail(email, emailSubject, emailText);

    res.status(201).json({ message: "User created successfully and email sent", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    console.log(req.user, "this is a user");
    const user = await User.findById(req.user.id).select("-password -isDelete");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Logout user and clear the cookie
exports.logout = async (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

// Get All Users (Admin Only)
exports.getUsers = async (req, res) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized - Invalid session" });
    }

    if (!["admin", "hr"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied! Only Admin and HR can view users." });
    }

    let { page = 1, limit = 10, name, email, status, role } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let filter = {};
    if (name) filter.name = { $regex: name, $options: "i" };
    if (email) filter.email = { $regex: email, $options: "i" };
    if (status === "active") {
      filter.isDelete = false;
    } else if (status === "inactive") {
      filter.isDelete = true;
    }
    if (role && role !== "all") {
      filter.role = { $regex: new RegExp(`^${role}$`, "i") }; // Case-insensitive match
    }    
    

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-password");

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      message: "Users retrieved successfully",
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalUsers,
      users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update User (Admin Only)
exports.updateUser = async (req, res) => {
  try {
    // Check if the user is either an Admin or HR
    if (!["admin", "hr"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied! Only Admin and HR can update users." });
    }

    const { id } = req.params;
    const { name, email, role, password } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isDelete) {
      return res.status(400).json({ message: "Cannot update a deleted user" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    // If password is updated, hash it correctly
    if (password) {
      user.password = password; // Assign new password directly

      // Send email notification with the new password
      const emailSubject = "Your Password Has Been Updated";
      const emailText = `Hello ${user.name},\n\nYour password has been successfully updated.\n\nNew Password: ${password}\n\nPlease use this password for logging in.\n\nRegards,\nDropBox Team`;

      await sendEmail(user.email, emailSubject, emailText);
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// Soft Delete User (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "hr") {
      return res.status(403).json({ message: "Access denied! Only Admin can update users." });
    }

    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Toggle the activation status
    user.isDelete = !user.isDelete;
    await user.save();

    res.status(200).json({
      message: `User ${user.isDelete ? "deactivated" : "activated"} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// create a default admin
exports.createDefaultAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      await User.create({
        name: "Admmin",
        email: "Hello@admin.com",
        password: "admin123",
        role: "admin",
      });
      res.json({ message: "Default admin created successfully" });
    } else {
      res.json({ message: "Default admin already exists" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.error(error);
  }
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const emailSubject = "Password Reset OTP";
    const emailText = `Hello ${user.name}, \n\nYour OTP for password reset is: ${otp} \n\nThis OTP is valid for 10 minutes.\n\nRegards, \nDropBox Team`;

    await sendEmail(email, emailSubject, emailText);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserComment = async (req, res) => {
  try {
    const secretKey = Config.JWT_SECRET;
    if (!secretKey) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    let { page = 1, limit = 10, title, type, status } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    let filter = {};
    if (title) filter.title = { $regex: title, $options: "i" };
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Fetch all messages that match the filters, then decrypt senderId
    const messages = await Message.find(filter)
      .sort({ createdAt: -1 }) // Sort newest first
      .lean();

    let userComments = [];

    for (const message of messages) {
      if (message.senderId) {
        try {
          let decryptedSenderId = CryptoJS.AES.decrypt(message.senderId, secretKey).toString(CryptoJS.enc.Utf8);
          if (decryptedSenderId === req.user.id.toString()) {
            userComments.push({
              _id: message._id,
              title: message.title,
              description: message.description,
              type: message.type,
              status: message.status,
              files: message.files,
              comment: message.comment,
              createdAt: message.createdAt,
            });
          }
        } catch {
          continue;
        }
      }
    }

    // ✅ Apply pagination after filtering by user ID
    const totalMessages = userComments.length;
    const paginatedComments = userComments.slice((page - 1) * limit, page * limit);

    res.status(200).json({
      message: "User comments retrieved successfully",
      totalPages: Math.ceil(totalMessages / limit),
      currentPage: page,
      totalMessages,
      comments: paginatedComments,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




exports.verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    const user = await User.findOne({ otp, otpExpiry: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    req.session.email = user.email; // Store email instead of user ID

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "OTP verified successfully. You can now reset your password." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect." });
    }

    // ✅ Update password (no need to hash manually, Mongoose does it)
    user.password = newPassword; // Mongoose will hash it before saving
    await user.save();

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // ✅ Validate request
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required." });
    }

    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    console.log(newPassword, "this is the new password");
    // ✅ Hash new password before saving
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(newPassword, salt);

    // ✅ Update user password in the database
    user.password = newPassword;
    await user.save();

    req.session.destroy();

    // ✅ Respond with success message
    res.status(200).json({ message: "Password reset successfully. You can now log in with your new password." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
