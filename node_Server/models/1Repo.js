const mongoose = require("mongoose");

const RepoSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
});

//const Repository = mongoose.model("Repository", RepoSchema);
module.exports = mongoose.model("Repository", RepoSchema);
