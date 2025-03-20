const mongoose = require("mongoose");

// Schema for Comments
const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  user: { type: String, default: "Anonymous" }, // Track User
  createdAt: { type: Date, default: Date.now },
});

// Schema for Tags
const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Prevent duplicates
  createdAt: { type: Date, default: Date.now },
});

// Schema for File (Including Comments & Tags)
const fileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true, unique: true, index: true }, // Index for faster lookup
    comments: [commentSchema], // Embedded Comments
    tags: [{ type: String }], // Store unique tag names (can be changed to tagSchema if needed)
  },
  { timestamps: true } // Adds createdAt & updatedAt automatically
);

// Create & Export Model
module.exports = mongoose.model("File", fileSchema);
