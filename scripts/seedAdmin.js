const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB bağlı'))
    .catch(err => console.error('❌ MongoDB hata:', err));

async function seedAdmin() {
    try {
        console.log('🧹 Eski admin siliniyor...');
        await Admin.deleteMany({}); // Önce sil
        
        console.log('👤 Yeni admin oluşturuluyor...');
        const admin = await Admin.create({
            username: 'admin',
            password: 'admin123'
        });
        
        console.log('🎉 ADMIN HAZIR!');
        console.log('========================');
        console.log('👤 Kullanıcı adı: admin');
        console.log('🔑 Şifre: admin123');
        console.log('📱 Login: http://localhost:3000/login.html');
        console.log('========================');
        process.exit(0);
    } catch (error) {
        console.error('❌ HATA:', error.message);
        process.exit(1);
    }
}

seedAdmin();