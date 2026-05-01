require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");

const app = express();

// ✅ Middleware
app.use(cors()); // 
app.use(express.json());
app.get("/", (req, res) => {
  res.send("SkillSwap Backend Running 🚀");
});
// ✅ Routes
app.use("/api/auth", authRoutes);

// ✅ Home route
app.get("/", (req, res) => {
    res.send("SkillSwap Backend Running 🚀");
});

// ✅ MongoDB Atlas Connection
mongoose.connect("mongodb+srv://MachhiKetan:ketan6102@cluster0.7jf6xx9.mongodb.net/skillswap")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// ✅ Server start
app.listen(5000, () => {
    console.log("Server started on port 5000");
});