import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import User from "./models/User.model.js"; // your user model

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
// Save or update user after Clerk authentication
app.post("/api/saveUser", async (req, res) => {
  const { clerkId, name, email } = req.body;

  if (!clerkId || !email) {
    return res.status(400).json({ message: "clerkId and email are required" });
  }

  try {
    let user = await User.findOne({ clerkId });

    if (!user) {
      // Create new user if not found
      user = new User({
        clerkId,
        name,
        email,
      });
      await user.save();
      return res.status(201).json({ message: "User created", user });
    } else {
      // Update existing user (e.g. update name if changed)
      user.name = name || user.name;
      await user.save();
      return res.status(200).json({ message: "User updated", user });
    }
  } catch (err) {
    console.error("Error in /api/saveUser:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// Get user by Clerk ID
app.get("/api/users/:clerkId", async (req, res) => {
  try {
    const user = await User.findOne({ clerkId: req.params.clerkId });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/addTransaction", async (req, res) => {
  const { email, transaction } = req.body;

  try {
    const updatedUser = await User.updateOne(
      { email },
      { $push: { transactions: transaction } }
    );

    res.status(200).json({ message: "Transaction added!", updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add transaction" });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
