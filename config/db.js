import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Check if connection is properly established
    if (conn.connection && conn.connection.host) {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } else {
      console.log(`✅ MongoDB Connected: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce'}`);
    }
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
