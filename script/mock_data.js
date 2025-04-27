import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/user.model.js';
dotenv.config();

// Connect to MongoDB using the URI from .env file
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));


  const createMockData = async () => {
    try {
      // Clear existing users (for testing purposes)
      await User.deleteMany({});
  
      // Create mock users up to 30
      const users = await User.insertMany([
        { full_name: 'John Doe', username: 'johndoe', password: 'password123', profilePic: 'https://example.com/john.jpg' },
        { full_name: 'Bob Johnson', username: 'bobjohnson', password: 'password123', profilePic: 'https://example.com/bob.jpg' },
        { full_name: 'Charlie Brown', username: 'charliebrown', password: 'password123', profilePic: 'https://example.com/charlie.jpg' },
        { full_name: 'David Williams', username: 'davidwilliams', password: 'password123', profilePic: 'https://example.com/david.jpg' },
        { full_name: 'Eve Adams', username: 'eveadams', password: 'password123', profilePic: 'https://example.com/eve.jpg' },
        { full_name: 'Grace Lee', username: 'gracelee', password: 'password123', profilePic: 'https://example.com/grace.jpg' },
        { full_name: 'Hannah Scott', username: 'hannahscott', password: 'password123', profilePic: 'https://example.com/hannah.jpg' },
        { full_name: 'Isaac Moore', username: 'isaacmoore', password: 'password123', profilePic: 'https://example.com/isaac.jpg' },
        { full_name: 'Jake Harris', username: 'jakeharris', password: 'password123', profilePic: 'https://example.com/jake.jpg' },
        { full_name: 'Liam Clark', username: 'liamclark', password: 'password123', profilePic: 'https://example.com/liam.jpg' },
        { full_name: 'Mason King', username: 'masonking', password: 'password123', profilePic: 'https://example.com/mason.jpg' },
        { full_name: 'Noah Carter', username: 'noahcarter', password: 'password123', profilePic: 'https://example.com/noah.jpg' },
        { full_name: 'Olivia Turner', username: 'oliviaturner', password: 'password123', profilePic: 'https://example.com/olivia.jpg' },
        { full_name: 'Peyton Roberts', username: 'peytonroberts', password: 'password123', profilePic: 'https://example.com/peyton.jpg' },
        { full_name: 'Quinn Miller', username: 'quinnmiller', password: 'password123', profilePic: 'https://example.com/quinn.jpg' },
        { full_name: 'Riley Evans', username: 'rileyevans', password: 'password123', profilePic: 'https://example.com/riley.jpg' },
        { full_name: 'Sophie Walker', username: 'sophiewalker', password: 'password123', profilePic: 'https://example.com/sophie.jpg' },
        { full_name: 'Tyler Lewis', username: 'tylerlewis', password: 'password123', profilePic: 'https://example.com/tyler.jpg' },
        { full_name: 'Ursula Price', username: 'ursulaprice', password: 'password123', profilePic: 'https://example.com/ursula.jpg' },
        { full_name: 'Victoria King', username: 'victoriaking', password: 'password123', profilePic: 'https://example.com/victoria.jpg' },
        { full_name: 'Wesley Harris', username: 'wesleyharris', password: 'password123', profilePic: 'https://example.com/wesley.jpg' },
        { full_name: 'Xander Coleman', username: 'xandercoleman', password: 'password123', profilePic: 'https://example.com/xander.jpg' },
        { full_name: 'Yara Moore', username: 'yaramore', password: 'password123', profilePic: 'https://example.com/yara.jpg' },
        { full_name: 'Zane Grant', username: 'zanemore', password: 'password123', profilePic: 'https://example.com/zane.jpg' },
        { full_name: 'Ava Green', username: 'avagreen', password: 'password123', profilePic: 'https://example.com/ava.jpg' },
        { full_name: 'Brady Scott', username: 'bradyscott', password: 'password123', profilePic: 'https://example.com/brady.jpg' },
        { full_name: 'Caitlin Mitchell', username: 'caitlinmitchell', password: 'password123', profilePic: 'https://example.com/caitlin.jpg' },
        { full_name: 'Derek Thompson', username: 'derekthompson', password: 'password123', profilePic: 'https://example.com/derek.jpg' },
        { full_name: 'Ella Harris', username: 'ellaharris', password: 'password123', profilePic: 'https://example.com/ella.jpg' }
      ]);
  
      // Get user IDs
      const userIds = users.map(user => user._id);
  
      // Assign relationships between users
      await User.findByIdAndUpdate(userIds[0], {
        $addToSet: {
          sentRequests: [userIds[1], userIds[2], userIds[5]],
          receivedRequests: [userIds[6], userIds[7]],
          friends: [userIds[4]],
          blockedUsers: [userIds[9]]
        }
      });
  
      await User.findByIdAndUpdate(userIds[1], {
        $addToSet: {
          sentRequests: [userIds[3], userIds[8]],
          receivedRequests: [userIds[2]],
          friends: [userIds[0]],
          blockedUsers: [userIds[5]]
        }
      });
  
      await User.findByIdAndUpdate(userIds[2], {
        $addToSet: {
          sentRequests: [userIds[6]],
          receivedRequests: [userIds[0]],
          friends: [userIds[4], userIds[5]],
          blockedUsers: [userIds[8]]
        }
      });
  
      await User.findByIdAndUpdate(userIds[3], {
        $addToSet: {
          sentRequests: [userIds[7]],
          receivedRequests: [userIds[1]],
          friends: [userIds[4]],
          blockedUsers: [userIds[0]]
        }
      });
  
      await User.findByIdAndUpdate(userIds[4], {
        $addToSet: {
          sentRequests: [userIds[6]],
          receivedRequests: [userIds[0], userIds[2]],
          friends: [userIds[0], userIds[1]],
          blockedUsers: [userIds[9]]
        }
      });
  
      await User.findByIdAndUpdate(userIds[5], {
        $addToSet: {
          sentRequests: [userIds[8]],
          receivedRequests: [userIds[2]],
          friends: [userIds[0]],
          blockedUsers: [userIds[1]]
        }
      });
  
      await User.findByIdAndUpdate(userIds[6], {
        $addToSet: {
          sentRequests: [userIds[7]],
          receivedRequests: [userIds[0]],
          friends: [userIds[4]],
          blockedUsers: [userIds[9]]
        }
      });
  
      await User.findByIdAndUpdate(userIds[7], {
        $addToSet: {
          sentRequests: [userIds[8]],
          receivedRequests: [userIds[0]],
          friends: [userIds[4]],
          blockedUsers: [userIds[2]]
        }
      });
  
      await User.findByIdAndUpdate(userIds[8], {
        $addToSet: {
          sentRequests: [userIds[2]],
          receivedRequests: [userIds[1]],
          friends: [userIds[0]],
          blockedUsers: [userIds[6]]
        }
      });
  
      await User.findByIdAndUpdate(userIds[9], {
        $addToSet: {
          sentRequests: [userIds[4]],
          receivedRequests: [userIds[0]],
          friends: [userIds[5]],
          blockedUsers: [userIds[3]]
        }
      });
  
      console.log('Mock data created successfully!');
    } catch (error) {
      console.error('Error creating mock data:', error);
    }
  };
// Create mock data
createMockData();
