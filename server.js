require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(express.json());

// ✅ Routes
app.use("/api/auth", require("./routes/auth"));

// ✅ Home route (test)
app.get("/", (req, res) => {
  res.send("SkillSwap Backend Running 🚀");
});

// ✅ MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ✅ Server Start
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});