const express = require('express');
const Ticket = require('../models/Ticket');
const Flight = require('../models/Flight');
const router = express.Router();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
// Bilet al
router.post('/', async (req, res) => {
    try {
        const { passenger_name, passenger_surname, passenger_email, flight_id, seat_number } = req.body;

        // Flight kontrol et
        const flight = await Flight.findById(flight_id);
        if (!flight) {
            return res.status(404).json({ error: 'Flight not found!' });
        }
        if (flight.seats_available <= 0) {
            return res.status(400).json({ error: 'No seats available on this flight!' });
        }

        // Ticket oluştur
        const ticket = new Ticket({
            ticket_id: 'TK' + Date.now(),
            passenger_name,
            passenger_surname,
            passenger_email,
            flight_id: flight._id,
            seat_number
        });

        await ticket.save();
        // SEND E-TICKET VIA EMAIL
        try {
            const flightDetails = await require('../models/Flight').findById(flight._id)
                .populate('from_city')
                .populate('to_city');

            const mailOptions = {
                from: 'gizemkara.ar@gmail.com', 
                to: passenger_email, 
                subject: `✈︎ Your E-Ticket is Confirmed: ${ticket.ticket_id}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                        <div style="background-color: #667eea; color: white; padding: 20px; text-align: center;">
                            <h2 style="margin: 0;">FlyTicket Boarding Pass</h2>
                        </div>
                        <div style="padding: 20px; background-color: #f8f9fa;">
                            <p>Dear <strong>${passenger_name} ${passenger_surname}</strong>,</p>
                            <p>Thank you for choosing FlyTicket. Your flight booking is confirmed. Here are your e-ticket details:</p>
                            
                            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                <tr>
                                    <td style="padding: 15px; border-bottom: 1px solid #eee;"><strong>Ticket PNR:</strong></td>
                                    <td style="padding: 15px; border-bottom: 1px solid #eee; color: #667eea; font-weight: bold;">${ticket.ticket_id}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px; border-bottom: 1px solid #eee;"><strong>Flight Route:</strong></td>
                                    <td style="padding: 15px; border-bottom: 1px solid #eee;">${flightDetails.from_city.city_name} ➔ ${flightDetails.to_city.city_name}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 15px; border-bottom: 1px solid #eee;"><strong>Seat Number:</strong></td>
                                    <td style="padding: 15px; border-bottom: 1px solid #eee; font-size: 1.2rem;"><strong>${seat_number || 'Auto-Assigned'}</strong></td>
                                </tr>
                            </table>
                            
                            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">Please arrive at the airport at least 2 hours before your departure time. Have a safe flight!</p>
                        </div>
                        <div style="background-color: #333; color: white; text-align: center; padding: 10px; font-size: 0.8em;">
                            &copy; 2026 FlyTicket Airlines
                        </div>
                    </div>
                `
            };

            // E-postayı gönder 
            await transporter.sendMail(mailOptions);
            console.log("E-ticket mail sent successfully to:", passenger_email);
        } catch (mailError) {
            console.error("Email could not be sent:", mailError);
        }
        
        flight.seats_available -= 1;
        await flight.save();

        return res.status(201).json({ 
            message: 'Ticket purchased successfully!',
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
            .populate({
                path: 'flight_id',
                select: 'flight_id from_city to_city departure_time arrival_time price',
                populate: [
                    { path: 'from_city', select: 'city_name' },
                    { path: 'to_city', select: 'city_name' }
                ]
            });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Bir uçuşa ait dolu koltukları getir
router.get('/booked-seats/:flightId', async (req, res) => {
    try {
        const tickets = await Ticket.find({ flight_id: req.params.flightId }, 'seat_number');
        const bookedSeats = tickets.map(t => t.seat_number).filter(s => s != null);
        res.json(bookedSeats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;