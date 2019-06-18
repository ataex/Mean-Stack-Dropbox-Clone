const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dateUploaded: { type: String, required: true },
  fileTags: { type: String },
  dateLastModified: { type: String, required: true },
  userLastModified: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

module.exports = mongoose.model("Post", postSchema);
