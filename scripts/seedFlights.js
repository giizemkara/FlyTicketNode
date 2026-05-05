const mongoose = require('mongoose');
const Flight = require('../models/Flight');
const City = require('../models/City');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

async function cleanAndSeed() {
    try {
        console.log('🧹 Mevcut uçuşlar siliniyor...');
        await Flight.deleteMany({}); // TÜM uçuşları sil
        
        const sampleFlights = [
            {
                flight_id: 'F001',
                from_city: 'İstanbul', 
                to_city: 'Ankara',
                departure_time: '2026-05-04T10:00:00',
                arrival_time: '2026-05-04T11:30:00',
                price: 850, seats_total: 180, seats_available: 120
            },
            {
                flight_id: 'F002',
                from_city: 'İstanbul', 
                to_city: 'İzmir',
                departure_time: '2026-05-04T09:30:00',
                arrival_time: '2026-05-04T10:45:00',
                price: 720, seats_total: 150, seats_available: 100
            },
            {
                flight_id: 'F003',
                from_city: 'Ankara', 
                to_city: 'Antalya',
                departure_time: '2026-05-04T14:00:00',
                arrival_time: '2026-05-04T15:45:00',
                price: 950, seats_total: 200, seats_available: 180
            },
            {
                flight_id: 'F004',
                from_city: 'İstanbul', 
                to_city: 'Antalya',
                departure_time: '2026-05-05T07:00:00',
                arrival_time: '2026-05-05T08:30:00',
                price: 1200, seats_total: 200, seats_available: 150
            }
        ];

        for (let f of sampleFlights) {
            const fromCity = await City.findOne({ city_name: f.from_city });
            const toCity = await City.findOne({ city_name: f.to_city });
            
            if (!fromCity || !toCity) {
                console.log(`❌ ${f.from_city} veya ${f.to_city} bulunamadı!`);
                continue;
            }
            
            await Flight.create({
                flight_id: f.flight_id,
                from_city: fromCity._id,
                to_city: toCity._id,
                departure_time: new Date(f.departure_time),
                arrival_time: new Date(f.arrival_time),
                price: f.price,
                seats_total: f.seats_total,
                seats_available: f.seats_available
            });
            console.log(`✅ ${f.flight_id} eklendi: ${f.from_city} → ${f.to_city}`);
        }
        
        console.log('🎉 4 uçuş başarıyla eklendi!');
        console.log('🔍 Test: http://localhost:3000/api/flights');
        process.exit(0);
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
}

cleanAndSeed();