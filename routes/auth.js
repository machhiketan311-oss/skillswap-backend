const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Request = require("../models/Request");
const Message = require("../models/Message");
const router = express.Router();


// 🔐 REGISTER
router.post("/register", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.json({
      message: "User registered",
      user: user
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});


// 🔑 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json("User not found");

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json("Wrong password");

    const token = jwt.sign({ id: user._id }, "mysupersecret");

    res.json({ token });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});


// 🧠 ADD SKILLS
router.post("/add-skills", async (req, res) => {
  try {
    const { userId, skillsOffered, skillsWanted } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { skillsOffered, skillsWanted },
      { new: true }
    );

    res.json(user);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});


// 👥 GET ALL USERS
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});


// 🔥 MATCH USERS
router.get("/match/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    const matches = await User.find({
      skillsOffered: { $in: user.skillsWanted },
      skillsWanted: { $in: user.skillsOffered },
      _id: { $ne: user._id }
    });

    res.json(matches);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});


// 📩 SEND REQUEST
router.post("/send-request", async (req, res) => {
  try {
    const { fromUser, toUser } = req.body;

    const request = new Request({ fromUser, toUser });
    await request.save();

    res.json({ message: "Request Sent" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});


// 📬 GET REQUESTS
router.get("/requests/:userId", async (req, res) => {
  try {
    const requests = await Request.find({ toUser: req.params.userId });
    res.json(requests);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
router.post("/reject-request", async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: "rejected" },
      { new: true }
    );

    res.json({ message: "Request Rejected", request });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
router.post("/accept-request", async (req, res) => {
  try {
    const { requestId } = req.body;

    const request = await Request.findByIdAndUpdate(
      requestId,
      { status: "accepted" },
      { new: true }
    );
router.get("/chat/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
    res.json({ message: "Request Accepted", request });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;router.post("/send-message", async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    const newMessage = new Message({ sender, receiver, message });
    await newMessage.save();

    res.json({ message: "Message Sent" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});