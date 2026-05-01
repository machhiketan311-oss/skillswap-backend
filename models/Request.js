const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  fromUser: String,
  toUser: String,
  status: {
    type: String,
    default: "pending" // pending, accepted, rejected
  }
});

module.exports = mongoose.model("Request", requestSchema);