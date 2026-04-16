const mongoose = require('mongoose');
const dns = require('dns');
const dotenv = require('dotenv');
const User = require('./models/User');

// Force DNS resolution for Atlas
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // Delete existing admin to ensure fresh seed
    await User.deleteOne({ email: 'admin@gmail.com' });
    await User.deleteOne({ email: 'admin@walkwithus.com' });

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('-----------------------------------');
    console.log('Admin user created successfully');
    console.log('Email: admin@gmail.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('-----------------------------------');
    
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
