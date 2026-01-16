import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// REGISTER
export const register = async (req, res) => {
  try {
    const { name, phone, password, role, email } = req.body;

    // Validation - Check required fields
    if (!name || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_REQUIRED_FIELDS',
        msg: "Name, phone, password, and role are required fields"
      });
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_PHONE',
        msg: "Phone number must be 10 digits"
      });
    }

    // Check if user already exists with same phone AND role
    const existingUser = await User.findOne({
      phone: phone,
      role: role
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        code: 'PHONE_ROLE_EXISTS',
        msg: "User already exists with this phone number and role"
      });
    }

    // If email is provided, check if it's already used for the same role
    if (email) {
      const emailExists = await User.findOne({
        email: email,
        role: role
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          code: 'EMAIL_ROLE_EXISTS',
          msg: "Email already exists for this role"
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (email is optional)
    const userData = {
      name,
      phone,
      password_hash: hashedPassword,
      role
    };

    // Only add email if provided
    if (email) {
      userData.email = email;
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({
      success: true,
      msg: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      success: false,
      code: 'SERVER_ERROR',
      error: err.message
    });
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

    // Determine if identifier is phone or email
    const isPhone = /^[0-9]{10}$/.test(identifier);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (!isPhone && !isEmail) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_IDENTIFIER',
        msg: "Please provide a valid phone number or email address"
      });
    }

    // Build query based on identifier type
    let query;
    if (isPhone) {
      query = { phone: identifier, role };
    } else {
      query = { email: identifier, role };
    }

    // Find user with correct role
    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        msg: "Invalid credentials or role mismatch"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_CREDENTIALS',
        msg: "Invalid credentials. Please check your password."
      });
    }

    // Create token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
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