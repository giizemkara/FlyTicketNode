const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    surname: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true // Aynı e-posta ile iki kez kayıt olunmaz
    },
    password: { 
        type: String, 
        required: true // Şifreyi veritabanına kaydederken kriptolama(hash)
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);