import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import USER from '../models/user.model.js';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET_KEY;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const register = async (req, res) => {
  try {
    const { full_name, username, password } = req.body;

    if (!full_name || !username || !password) {
      return res.status(400).send('Name, username, and password are required');
    }

    // Check if username already exists
    const existingUser = await USER.findOne({ username });
    if (existingUser) {
      return res.status(409).send('username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new USER({
      full_name,
      username,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).send('Server error');
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send('Username and password are required');
    }

    const user = await USER.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Invalid credentials');
    }

    // Generate Access Token (expires in 1 hour)
    const accessToken = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '2d' } // Set to 2 days
    );

    // Generate Refresh Token (expires in 30 days)
    const refreshToken = jwt.sign(
      { id: user._id, username: user.username },
      JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    // Get expiry times
    const accessTokenExpiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2; // 2 days from now

    res.json({
      user:username,
      token: accessToken,
      refreshToken,
      expiresAt: accessTokenExpiry,
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).send('Server error');
  }
};
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).send('Refresh token is required');
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, username: decoded.username },
      JWT_SECRET,
      { expiresIn: '2d' } // Set to 2 days
    );
    const accessTokenExpiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2; // 2 days from now

    res.json({ token: newAccessToken, expiresAt: accessTokenExpiry, });
  } catch (error) {
    console.error('Error in refreshAccessToken:', error);
    res.status(500).send('Server error');
  }
};

export { register, login, refreshAccessToken };
