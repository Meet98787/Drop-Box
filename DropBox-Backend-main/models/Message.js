const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  senderId:{
    type: String,
    required: true,
  },
  comment:{
    type: String,
  },
  type: { type: String, enum: ["issue", "idea"], required: true },
  status: { type: String, enum: ["pending", "resolved"], default: "pending", trim: true, },
  files: [
    {
      filePath: { type: String, required: true },
      mimeType: { type: String, required: true },
    },
  ],
},
  { timestamps: true });
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
