const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check empty fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
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

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid email" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Token
    const token = jwt.sign({ id: user._id }, "secret123", {
      expiresIn: "1d"
    });

    res.json({
      message: "Login success",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
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

module.exports = router;