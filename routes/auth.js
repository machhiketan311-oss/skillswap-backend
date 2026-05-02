const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Message = require("../models/Message");

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, "secret123", {
      expiresIn: "1d"
    });

    res.json({
      message: "Login success",
      token,
      user
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================= ADD SKILLS =================
router.post("/add-skills", async (req, res) => {
  try {
    const { userId, skillsOffered, skillsWanted } = req.body;

    const user = await User.findById(userId);

    user.skillsOffered = skillsOffered;
    user.skillsWanted = skillsWanted;

    await user.save();

    res.json({ message: "Skills added" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================= MATCH USERS =================
router.get("/match/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    const matches = await User.find({
      skillsOffered: { $in: user.skillsWanted }
    });

    res.json(matches);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================= SEND MESSAGE =================
router.post("/send-message", async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    const newMessage = new Message({
      sender,
      receiver,
      message
    });

    await newMessage.save();

    res.json({ message: "Message sent" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================= GET CHAT =================
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
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;