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

    res.status(201).json({ message: "Registered", user: newUser });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id }, "secret123");

    res.json({ token, user });

  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// ================= ADD SKILLS =================
router.post("/add-skills", async (req, res) => {
  const { userId, skillsOffered, skillsWanted } = req.body;

  const user = await User.findById(userId);
  user.skillsOffered = skillsOffered;
  user.skillsWanted = skillsWanted;

  await user.save();

  res.json({ message: "Saved" });
});

// ================= MATCH (LOCKED) =================
router.get("/match/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);

  if (!user.isPremium) {
    return res.status(403).json({ error: "Buy Premium First" });
  }

  const matches = await User.find({
    skillsOffered: { $in: user.skillsWanted }
  });

  res.json(matches);
});

// ================= PAYMENT LINK =================
router.get("/pay", (req, res) => {
  const upi = "upi://pay?pa=ketan@upi&pn=SkillSwap&am=49&cu=INR";
  res.json({ upi });
});

// ================= VERIFY PAYMENT =================
router.post("/verify/:userId", async (req, res) => {
  const user = await User.findById(req.params.userId);

  user.isPremium = true;
  await user.save();

  res.json({ message: "Premium Activated" });
});

// ================= CHAT =================
router.post("/send-message", async (req, res) => {
  const { sender, receiver, message } = req.body;

  const msg = new Message({ sender, receiver, message });
  await msg.save();

  res.json({ message: "Sent" });
});

router.get("/chat/:u1/:u2", async (req, res) => {
  const { u1, u2 } = req.params;

  const msgs = await Message.find({
    $or: [
      { sender: u1, receiver: u2 },
      { sender: u2, receiver: u1 }
    ]
  }).sort({ createdAt: 1 });

  res.json(msgs);
});

module.exports = router;