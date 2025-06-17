import { connect } from 'mongoose';

const connectDB = async () => {
  const conn = await connect(process.env.MONGO_URI);
  console.log(`📦 MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;
