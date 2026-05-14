const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, surname, email, password } = req.body;

        // E-posta daha önce kullanılmış mı kontrol et
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'This email is already registered.' });
        }

        // Şifreyi kriptola (Hash işlemi)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Kullanıcıyı veritabanına kaydet
        const newUser = new User({
            name,
            surname,
            email,
            password: hashedPassword
        });
        await newUser.save();

        res.status(201).json({ message: 'Registration successful! You can now log in.' });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during registration.' });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kullanıcıyı e-posta adresinden bul
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'No account found with this email.' });
        }

        // Girilen şifre ile veritabanındaki kriptolu şifreyi karşılaştır
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password.' });
        }

        // Başarılı giriş
        res.json({
            message: 'Login successful!',
            user: {
                id: user._id,
                name: user.name,
                surname: user.surname,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during login.' });
    }
});

module.exports = router;