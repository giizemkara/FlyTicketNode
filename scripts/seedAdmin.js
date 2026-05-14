const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB!'))
    .catch(err => console.error('MongoDB error:', err));

async function seedAdmin() {
    try {
        console.log('Old admin users are being deleted...');
        await Admin.deleteMany({}); 
        
        console.log('Creating new admin user...');
        const admin = await Admin.create({
            username: 'admin',
            password: 'admin123'
        });
        
        console.log('Admin user created successfully!');
        console.log('========================');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Login: http://localhost:3000/login.html');
        console.log('========================');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

seedAdmin();