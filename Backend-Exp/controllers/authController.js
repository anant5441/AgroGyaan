import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // check existing user by email or phone
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists with this email or phone" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      phone,
      password_hash: hashedPassword,
      role
    });

    await user.save();
    res.json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
export const login = async (req, res, next) => {
  try {
    const { identifier, password, role } = req.body;
    
    if (!identifier || !password || !role) {
      return res.status(400).json({ 
        success: false,
        code: 'MISSING_FIELDS',
        msg: "Please provide all required fields" 
      });
    }

    // First check if user exists with this email/phone (regardless of role)
    const userExists = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });

    if (!userExists) {
      return res.status(400).json({
        success: false,
        code: 'USER_NOT_FOUND',
        msg: "User not found with this email or phone"
      });
    }

    // Now check if user has the correct role
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
      role
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        code: 'ROLE_MISMATCH',
        msg: "Role mismatch. Please check your selected role and try again."
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        msg: "Invalid credentials. Please check your password."
      });
    }

    // create token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        language_pref: user.language_pref,
        trust_score: user.trust_score
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      msg: "Internal server error during login"
    });
  }
};