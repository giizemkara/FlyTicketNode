const express = require('express');
const Admin = require('../models/Admin');
const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const admin = await Admin.findOne({ username });
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ error: '❌ Yanlış kullanıcı adı veya şifre!' });
        }

        res.json({ 
            message: '✅ Giriş başarılı!',
            token: 'admin_token_123' // Gerçek JWT sonra
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin flights CRUD (şimdilik public)
router.get('/flights', async (req, res) => {
    const flights = await require('../models/Flight').find()
        .populate('from_city', 'city_name')
        .populate('to_city', 'city_name');
    res.json(flights);
});

module.exports = router;