const mongoose = require("mongoose");

const RepoSchema = new mongoose.Schema({
  name: String,
  description: String,
  files: [
    {
      originalName: String,
      filename: String,
      path: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Repository", RepoSchema);
