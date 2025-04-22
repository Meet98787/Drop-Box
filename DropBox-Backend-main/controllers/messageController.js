const bcrypt = require("bcryptjs");
const CryptoJS = require("crypto-js");
const Message = require("../models/Message");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Config =require("../config/index")

const secretKey =Config.JWT_SECRET ; 

exports.sendMessages = async (req, res) => {
  try {
    const { title, description, type } = req.body;

   const encryptedSenderId = CryptoJS.AES.encrypt(req.user.id, secretKey).toString();

    let files = [];
    if (req.files?.length > 0) {
      files = req.files.map((file) => ({
        filePath: file.path,
        mimeType: file.mimetype,
      }));
    }

    const message = await Message.create({
      title,
      description,
      type,
      files,
      senderId: encryptedSenderId,
    });

    console.log(message);
    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    let { page = 1, limit = 10, title, type, status } = req.query;

    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;

    let filter = {};
    if (title) filter.title = { $regex: title, $options: "i" };
    if (type) filter.type = type;

    if (status) {
      console.log("Filtering by status:", status);
      filter.status = status;
    }

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const totalMessages = await Message.countDocuments(filter);

    res.status(200).json({
      message: "Messages retrieved successfully",
      totalPages: Math.ceil(totalMessages / limit),
      currentPage: page,
      totalMessages,
      messages,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatusMessage = async (req, res) => {
  try {
    const id = req.params.id;
    const comment = req.body.comment;
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "No message found with the given ID",
      });
    }

    message.status = "resolved";
    message.comment = comment;
    await message.save();

    res.status(200).json({ 
      success: true, 
      message: "Message status updated successfully", 
      data: message 
    });


  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Find message by ID
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (!message.files || message.files.length === 0) {
      return res
        .status(400)
        .json({ message: "No files available for download" });
    }

    for (const file of message.files) {
      const fileUrl = file.filePath;
      const mimeType = file.mimeType.split("/")[1];
      let fileName;
      if (!fileUrl.startsWith("http")) {
        return res.status(400).json({ message: "Invalid file URL" });
      }
      if (mimeType === "jpeg") {
        fileName = path.basename(new URL(fileUrl).pathname);
      } else {
        fileName = path.basename(new URL(fileUrl).pathname) + "." + mimeType;
      }
      const response = await axios.get(fileUrl, { responseType: "stream" });

      res.setHeader("Content-Type", file.mimeType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );

      response.data.pipe(res);
    }
  } catch (error) {
    console.error("Error downloading file:", error);
    res
      .status(500)
      .json({ message: "Error downloading file", error: error.message });
  }
};
