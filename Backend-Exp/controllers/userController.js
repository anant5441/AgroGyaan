import User from "../models/User.js";

// Get all users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password_hash');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password_hash');
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Create a new user
export const createUser = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }]
    });
    
    if (existingUser) {
      const error = new Error('User already exists with this email or phone');
      error.statusCode = 400;
      error.code = 'USER_ALREADY_EXISTS';
      throw error;
    }
    
    const user = new User(req.body);
    const savedUser = await user.save();
    
    const userResponse = savedUser.toObject();
    delete userResponse.password_hash;
    
    res.status(201).json(userResponse);
  } catch (error) {
    next(error);
  }
};

// Update user by ID
export const updateUser = async (req, res, next) => {
  try {
    if (req.body.password_hash) {
      delete req.body.password_hash;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password_hash');
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    
    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

// Delete user by ID
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      error.code = 'USER_NOT_FOUND';
      throw error;
    }
    
    res.json({
      message: 'User deleted successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};