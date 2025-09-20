import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    default: 'farmer',
    enum: ['farmer', 'admin']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  // Additional farmer-specific fields
  farmLocation: {
    type: String,
    trim: true
  },
  farmSize: {
    type: Number,
    min: [0, 'Farm size cannot be negative']
  },
  primaryCrops: [{
    type: String,
    trim: true
  }],
  phoneNumber: {
    type: String,
    trim: true,
    match: [/^[+]?[\d\s-()]+$/, 'Please provide a valid phone number']
  },
  profilePicture: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
farmerSchema.index({ email: 1 });
farmerSchema.index({ isActive: 1 });
farmerSchema.index({ createdAt: -1 });

// Virtual for farmer's full profile
farmerSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    farmLocation: this.farmLocation,
    farmSize: this.farmSize,
    primaryCrops: this.primaryCrops,
    phoneNumber: this.phoneNumber,
    profilePicture: this.profilePicture,
    isVerified: this.isVerified,
    memberSince: this.createdAt,
    lastLogin: this.lastLogin
  };
});

// Pre-save middleware to hash password
farmerSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
farmerSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to update last login
farmerSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save({ validateBeforeSave: false });
};

// Static method to find farmer by email with password
farmerSchema.statics.findByEmailWithPassword = function(email) {
  return this.findOne({ email, isActive: true }).select('+password');
};

// Static method to check if email exists
farmerSchema.statics.emailExists = async function(email) {
  const farmer = await this.findOne({ email });
  return !!farmer;
};

const Farmer = mongoose.model('Farmer', farmerSchema);

export default Farmer;