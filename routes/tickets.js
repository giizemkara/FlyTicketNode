const express = require('express');
const Ticket = require('../models/Ticket');
const Flight = require('../models/Flight');
const router = express.Router();

// Bilet al
router.post('/', async (req, res) => {
    try {
        const { passenger_name, passenger_surname, passenger_email, flight_id } = req.body;

        // Flight kontrol et
        const flight = await Flight.findById(flight_id);
        if (!flight) {
            return res.status(404).json({ error: 'Uçuş bulunamadı!' });
        }
        if (flight.seats_available <= 0) {
            return res.status(400).json({ error: 'Uçuşta yer yok!' });
        }

        // Ticket oluştur
        const ticket = new Ticket({
            ticket_id: 'TK' + Date.now(),
            passenger_name,
            passenger_surname,
            passenger_email,
            flight_id: flight._id
        });

        await ticket.save();

        // Flight seats_available azalt
        flight.seats_available -= 1;
        await flight.save();

        res.json({ 
            message: 'Bilet başarıyla alındı!',
            ticket_id: ticket.ticket_id 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Biletleri listele (email ile)
router.get('/:email', async (req, res) => {
    try {
        const tickets = await Ticket.find({ passenger_email: req.params.email })
            .populate('flight_id', 'flight_id from_city to_city departure_time arrival_time price');
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;