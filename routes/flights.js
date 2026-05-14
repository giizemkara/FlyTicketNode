const express = require('express');
const Flight = require('../models/Flight');
const City = require('../models/City');
const { validateFlightRules } = require('../middleware/flightValidator');
const router = express.Router();

// Tüm uçuşları listele
router.get('/', async (req, res) => {
    try {
        const { from, to, date } = req.query;
        let query = {};

        if (from) {
            const fromCity = await City.findOne({ city_name: from });
            if (fromCity) query.from_city = fromCity._id;
        }
        if (to) {
            const toCity = await City.findOne({ city_name: to });
            if (toCity) query.to_city = toCity._id;
        }
        if (date) {
            const startDate = new Date(`${date}T00:00:00+03:00`);
            const endDate = new Date(`${date}T23:59:59+03:00`);
            
            query.departure_time = { $gte: startDate, $lte: endDate };
        }

        const flights = await Flight.find(query)
            .populate('from_city', 'city_name')
            .populate('to_city', 'city_name')
            .sort({ departure_time: 1 });

        res.json(flights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Şehirleri listele
router.get('/cities', async (req, res) => {
    try {
        const cities = await City.find({}, 'city_name');
        res.json(cities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Yeni uçuş oluştur
router.post('/', async (req, res) => {
    try {
        const { from_city, to_city, departure_time, arrival_time, price, seats_total } = req.body;
        
        // Şehirleri bul
        const fromCityDoc = await City.findOne({ city_name: from_city });
        const toCityDoc = await City.findOne({ city_name: to_city });
        
        if (!fromCityDoc || !toCityDoc) {
            return res.status(400).json({ error: 'Şehir bulunamadı!' });
        }

        const flightData = {
            flight_id: 'F' + Date.now(),
            from_city: fromCityDoc._id,
            to_city: toCityDoc._id,
            departure_time: new Date(departure_time),
            arrival_time: new Date(arrival_time),
            price,
            seats_total,
            seats_available: seats_total
        };

        // Validation kuralları
        const errors = await require('../middleware/flightValidator').validateFlightRules(flightData);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        const flight = new require('../models/Flight')(flightData);
        await flight.save();

        res.json({ message: 'Flight added successfully!', flight });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;