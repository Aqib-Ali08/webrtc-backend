import { Router } from "express";
import { hash, compare } from "bcrypt";
import User from "../models/user.js";

const router = Router();

// Register
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password,gender } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });  // Corrected this line
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await hash(password, 10);
    // Set profile picture
    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
    // Create new user
    const newUser = new User({ username, email, password: hashedPassword ,gender,profilePic: gender === 'Male' ? boyProfilePic : girlProfilePic});
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });  // Corrected this line
    if (!user) return res.status(400).json({ message: "User does not exist" });

    // Check password
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: "Invalid credentials" });

    res.status(200).json({ message: "Login successful", user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

// Fetch User by Email
router.post("/users", async (req, res) => {
  try {
    const {email} = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email }); // Query database
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error" });
  }
});


export default router;
