const mongoose = require("mongoose");

const CommitSchema = new mongoose.Schema({
  owner: String,
  repo: String,
  sha: String,
  message: String,
  author: String,
  date: Date,
});

const Commit = mongoose.model("Commit", CommitSchema);
module.exports = { Commit };
