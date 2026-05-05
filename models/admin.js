const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Şifre hashleme (Modern Mongoose 9+ uyumlu, next() kullanılmayan versiyon)
adminSchema.pre('save', async function () {
    // Sadece şifre alanı değiştirilmişse veya yeni ekleniyorsa şifrele
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12);
    }
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);