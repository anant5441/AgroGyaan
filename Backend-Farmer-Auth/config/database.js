import mongoose from 'mongoose';

/**
 * Database Configuration
 * Handles MongoDB connection with proper error handling and options
 */

const connectDB = async () => {
  try {
    // Connection options for better performance and reliability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('🔗 Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Mongoose disconnected from MongoDB');
    });

    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Exit process with failure
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 */
export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('📦 Database connection closed through app termination');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

/**
 * Database health check
 */
export const checkDBHealth = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  return {
    status: states[state],
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    port: mongoose.connection.port
  };
};

export default connectDB;