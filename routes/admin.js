const express = require('express');
const Admin = require('../models/Admin');
const Flight = require('../models/Flight'); 
const Ticket = require('../models/Ticket'); 
const { validateFlightRules } = require('../middleware/flightValidator'); 
const router = express.Router();
// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const admin = await Admin.findOne({ username });
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid username or password.' });
        }

        res.json({ 
            message: '✅ Login successful!',
            token: 'admin_token_123' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//ADD FLIGHT
router.post('/flights', async (req, res) => {
    try {
        // String olarak gelen tarihleri Date objesine çeviriyoruz (Validator'un çalışması için)
        req.body.departure_time = new Date(req.body.departure_time);
        req.body.arrival_time = new Date(req.body.arrival_time);
        req.body.seats_available = req.body.seats_total; // İlk eklendiğinde tüm koltuklar boş
        const errors = await validateFlightRules(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ error: errors.join(', ') });
        }
        req.body.flight_id = 'FL' + Date.now().toString().slice(-6); 
        
        const newFlight = await Flight.create(req.body);
        res.status(201).json({ message: 'Flight added successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// VIEW/DELETE FLIGHTS İÇİN
router.get('/flights', async (req, res) => {
    try {
        const flights = await Flight.find()
            .populate('from_city', 'city_name')
            .populate('to_city', 'city_name')
            .sort({ departure_time: -1 }); 
        res.json(flights);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// DELETE FLIGHT
router.delete('/flights/:id', async (req, res) => {
    // Silme işleminden hemen önce eklenecek kod:
    const ticketCount = await Ticket.countDocuments({ flight_id: req.params.id });
    if (ticketCount > 0) {
        return res.status(400).json({ error: 'Cannot delete! There are sold tickets for this flight.' });
    }
    try {
        await Flight.findByIdAndDelete(req.params.id);
        res.json({ message: 'Flight deleted successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//VIEW BOOKINGS
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate({
                path: 'flight_id',
                populate: [
                    { path: 'from_city', select: 'city_name' },
                    { path: 'to_city', select: 'city_name' }
                ]
            })
            .sort({ createdAt: -1 }); 
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// EDIT FLIGHT
router.put('/flights/:id', async (req, res) => {
    try {
        //Gelen tarihleri Date formatına çevirelim
        if(req.body.departure_time) req.body.departure_time = new Date(req.body.departure_time);
        if(req.body.arrival_time) req.body.arrival_time = new Date(req.body.arrival_time);
        const existingFlight = await Flight.findById(req.params.id);
        if (!existingFlight) {
            return res.status(404).json({ error: 'Flight not found!' });
        }
        const mergedData = { ...existingFlight.toObject(), ...req.body };
        //
        const errors = await validateFlightRules(mergedData, req.params.id);
        
        if (errors.length > 0) {
            return res.status(400).json({ error: errors.join(', ') });
        }
        // Kuralları geçtiyse güncellemeyi yap
        const updatedFlight = await Flight.findByIdAndUpdate(
            req.params.id, 
            req.body, // Sadece değişenleri veritabanına yaz
            { new: true } 
        );

        res.json({ message: 'Flight updated successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;