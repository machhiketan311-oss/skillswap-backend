const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Razorpay = require("razorpay");

const User = require("../models/User");
const Message = require("../models/Message");

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hash });
    await user.save();

    res.json({ message: "Registered", user });

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

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ user, token });

  } catch (err) {
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

  res.json({ message: "Skills saved" });
});

// ================= CREATE ORDER =================
router.post("/create-order", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: 5000, // ₹50
      currency: "INR"
    };

    const order = await razorpay.orders.create(options);
    res.json(order);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Order failed" });
  }
});

// ================= VERIFY PAYMENT =================
router.post("/verify-payment", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    user.isPremium = true;

    await user.save();

    res.json({ message: "Premium activated" });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ================= SEND MESSAGE (PREMIUM ONLY) =================
router.post("/send-message", async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    const user = await User.findById(sender);

    if (!user.isPremium) {
      return res.status(403).json({ error: "Only premium users can chat" });
    }

    const msg = new Message({ sender, receiver, message });
    await msg.save();

    res.json({ message: "Message sent" });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ================= GET CHAT =================
router.get("/chat/:u1/:u2", async (req, res) => {
  const { u1, u2 } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: u1, receiver: u2 },
      { sender: u2, receiver: u1 }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
});

module.exports = router;