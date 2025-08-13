import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../src/models/user.model.js';
dotenv.config();

// Connect to MongoDB using the URI from .env file
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};
const createMockData = async () => {
  try {
    // Clear existing users (for testing purposes)
    await User.deleteMany({});

    // Create mock users up to 30
    const users = await User.insertMany([
      { full_name: 'John Doe', username: 'johndoe', password: await hashPassword('password123'), profilePic: 'https://example.com/john.jpg' },
      { full_name: 'Bob Johnson', username: 'bobjohnson', password: await hashPassword('password123'), profilePic: 'https://example.com/bob.jpg' },
      { full_name: 'Charlie Brown', username: 'charliebrown', password: await hashPassword('password123'), profilePic: 'https://example.com/charlie.jpg' },
      { full_name: 'David Williams', username: 'davidwilliams', password: await hashPassword('password123'), profilePic: 'https://example.com/david.jpg' },
      { full_name: 'Eve Adams', username: 'eveadams', password: await hashPassword('password123'), profilePic: 'https://example.com/eve.jpg' },
      { full_name: 'Grace Lee', username: 'gracelee', password: await hashPassword('password123'), profilePic: 'https://example.com/grace.jpg' },
      { full_name: 'Hannah Scott', username: 'hannahscott', password: await hashPassword('password123'), profilePic: 'https://example.com/hannah.jpg' },
      { full_name: 'Isaac Moore', username: 'isaacmoore', password: await hashPassword('password123'), profilePic: 'https://example.com/isaac.jpg' },
      { full_name: 'Jake Harris', username: 'jakeharris', password: await hashPassword('password123'), profilePic: 'https://example.com/jake.jpg' },
      { full_name: 'Liam Clark', username: 'liamclark', password: await hashPassword('password123'), profilePic: 'https://example.com/liam.jpg' },
      { full_name: 'Mason King', username: 'masonking', password: await hashPassword('password123'), profilePic: 'https://example.com/mason.jpg' },
      { full_name: 'Noah Carter', username: 'noahcarter', password: await hashPassword('password123'), profilePic: 'https://example.com/noah.jpg' },
      { full_name: 'Olivia Turner', username: 'oliviaturner', password: await hashPassword('password123'), profilePic: 'https://example.com/olivia.jpg' },
      { full_name: 'Peyton Roberts', username: 'peytonroberts', password: await hashPassword('password123'), profilePic: 'https://example.com/peyton.jpg' },
      { full_name: 'Quinn Miller', username: 'quinnmiller', password: await hashPassword('password123'), profilePic: 'https://example.com/quinn.jpg' },
      { full_name: 'Riley Evans', username: 'rileyevans', password: await hashPassword('password123'), profilePic: 'https://example.com/riley.jpg' },
      { full_name: 'Sophie Walker', username: 'sophiewalker', password: await hashPassword('password123'), profilePic: 'https://example.com/sophie.jpg' },
      { full_name: 'Tyler Lewis', username: 'tylerlewis', password: await hashPassword('password123'), profilePic: 'https://example.com/tyler.jpg' },
      { full_name: 'Ursula Price', username: 'ursulaprice', password: await hashPassword('password123'), profilePic: 'https://example.com/ursula.jpg' },
      { full_name: 'Victoria King', username: 'victoriaking', password: await hashPassword('password123'), profilePic: 'https://example.com/victoria.jpg' },
      { full_name: 'Wesley Harris', username: 'wesleyharris', password: await hashPassword('password123'), profilePic: 'https://example.com/wesley.jpg' },
      { full_name: 'Xander Coleman', username: 'xandercoleman', password: await hashPassword('password123'), profilePic: 'https://example.com/xander.jpg' },
      { full_name: 'Yara Moore', username: 'yaramore', password: await hashPassword('password123'), profilePic: 'https://example.com/yara.jpg' },
      { full_name: 'Zane Grant', username: 'zanemore', password: await hashPassword('password123'), profilePic: 'https://example.com/zane.jpg' },
      { full_name: 'Ava Green', username: 'avagreen', password: await hashPassword('password123'), profilePic: 'https://example.com/ava.jpg' },
      { full_name: 'Brady Scott', username: 'bradyscott', password: await hashPassword('password123'), profilePic: 'https://example.com/brady.jpg' },
      { full_name: 'Caitlin Mitchell', username: 'caitlinmitchell', password: await hashPassword('password123'), profilePic: 'https://example.com/caitlin.jpg' },
      { full_name: 'Derek Thompson', username: 'derekthompson', password: await hashPassword('password123'), profilePic: 'https://example.com/derek.jpg' },
      { full_name: 'Ella Harris', username: 'ellaharris', password: await hashPassword('password123'), profilePic: 'https://example.com/ella.jpg' },
      { full_name: 'Finn Howard', username: 'finnhoward', password: await hashPassword('password123'), profilePic: 'https://example.com/finn.jpg' },
      { full_name: 'Gabriel Foster', username: 'gabrielfoster', password: await hashPassword('password123'), profilePic: 'https://example.com/gabriel.jpg' },
      { full_name: 'Hazel Bennett', username: 'hazelbennett', password: await hashPassword('password123'), profilePic: 'https://example.com/hazel.jpg' },
      { full_name: 'Ian Brooks', username: 'ianbrooks', password: await hashPassword('password123'), profilePic: 'https://example.com/ian.jpg' },
      { full_name: 'Jasmine Cole', username: 'jasminecole', password: await hashPassword('password123'), profilePic: 'https://example.com/jasmine.jpg' },
      { full_name: 'Kevin Hughes', username: 'kevinhughes', password: await hashPassword('password123'), profilePic: 'https://example.com/kevin.jpg' },
      { full_name: 'Luna Parker', username: 'lunaparker', password: await hashPassword('password123'), profilePic: 'https://example.com/luna.jpg' },
      { full_name: 'Marcus Reed', username: 'marcusreed', password: await hashPassword('password123'), profilePic: 'https://example.com/marcus.jpg' },
      { full_name: 'Nora Sanders', username: 'norasanders', password: await hashPassword('password123'), profilePic: 'https://example.com/nora.jpg' },
      { full_name: 'Owen Baker', username: 'owenbaker', password: await hashPassword('password123'), profilePic: 'https://example.com/owen.jpg' },
      { full_name: 'Paige Martinez', username: 'paigemartinez', password: await hashPassword('password123'), profilePic: 'https://example.com/paige.jpg' },
      { full_name: 'Quincy Rogers', username: 'quincyrogers', password: await hashPassword('password123'), profilePic: 'https://example.com/quincy.jpg' },
      { full_name: 'Ruby Bell', username: 'rubybell', password: await hashPassword('password123'), profilePic: 'https://example.com/ruby.jpg' },
      { full_name: 'Samuel Price', username: 'samuelprice', password: await hashPassword('password123'), profilePic: 'https://example.com/samuel.jpg' },
      { full_name: 'Tessa Griffin', username: 'tessagriffin', password: await hashPassword('password123'), profilePic: 'https://example.com/tessa.jpg' },
      { full_name: 'Ulysses Kim', username: 'ulysseskim', password: await hashPassword('password123'), profilePic: 'https://example.com/ulysses.jpg' },
      { full_name: 'Violet Hayes', username: 'violethayes', password: await hashPassword('password123'), profilePic: 'https://example.com/violet.jpg' },
      { full_name: 'Wyatt Scott', username: 'wyattscott', password: await hashPassword('password123'), profilePic: 'https://example.com/wyatt.jpg' },
      { full_name: 'Ximena Torres', username: 'ximenatorres', password: await hashPassword('password123'), profilePic: 'https://example.com/ximena.jpg' },
      { full_name: 'Yusuf Ali', username: 'yusufali', password: await hashPassword('password123'), profilePic: 'https://example.com/yusuf.jpg' },
      { full_name: 'Zoey Rivera', username: 'zoeyrivera', password: await hashPassword('password123'), profilePic: 'https://example.com/zoey.jpg' }

    ]);

    console.log('Mock data created successfully!');
  } catch (error) {
    console.error('Error creating mock data:', error);
  }
};
// Create mock data
createMockData();
