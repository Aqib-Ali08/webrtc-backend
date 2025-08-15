import dotenv from 'dotenv';
import mongoose from "mongoose";
import Messages from "../src/models/messages.model.js";
dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
const conversationId = "689e136fefc579dd4d6de746";
const senderId = "689c9573b034b4fd97056fd0"; // your user id

const dummyMessages = [];

for (let i = 1; i <= 20; i++) {
    dummyMessages.push({
        sender: senderId,
        conversation: conversationId,
        content: `Logged in user Test message #${i}`,
        createdAt: new Date(Date.now() - i * 60000) // 1 min apart
    });
}

await Messages.insertMany(dummyMessages);

console.log("Dummy messages inserted!");
process.exit();
