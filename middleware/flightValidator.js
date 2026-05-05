const Flight = require('../models/Flight');
const City = require('../models/City');

// Önemli kurallar:
// 1. Aynı şehirden aynı saatte 2 uçuş olamaz
// 2. Aynı şehre aynı saatte 2 uçuş varamaz
// 3. Uçuş süresi mantıklı olmalı (min 30dk, max 4 saat)
// 4. Varış saati kalkış saatinden sonra olmalı
// 5. Koltuk sayısı mantıklı (20-300 arası)

const validateFlightRules = async (flightData) => {
    const errors = [];

    // 1. Aynı şehirden aynı saatte uçuş kontrolü
    const sameDepartureHour = await Flight.findOne({
        'from_city': flightData.from_city,
        departure_time: {
            $gte: new Date(flightData.departure_time.getTime() - 30*60*1000), // 30dk tolerans
            $lte: new Date(flightData.departure_time.getTime() + 30*60*1000)
        }
    });
    if (sameDepartureHour) {
        errors.push('Bu şehirden aynı saatte başka uçuş var!');
    }

    // 2. Aynı şehre aynı saatte varış kontrolü
    const sameArrivalHour = await Flight.findOne({
        'to_city': flightData.to_city,
        arrival_time: {
            $gte: new Date(flightData.arrival_time.getTime() - 30*60*1000),
            $lte: new Date(flightData.arrival_time.getTime() + 30*60*1000)
        }
    });
    if (sameArrivalHour) {
        errors.push('Bu şehre aynı saatte başka uçuş var!');
    }

    // 3. Uçuş süresi kontrolü
    const flightDuration = (flightData.arrival_time - flightData.departure_time) / (1000 * 60);
    if (flightDuration < 30) {
        errors.push('Uçuş süresi en az 30 dakika olmalı!');
    }
    if (flightDuration > 240) { // 4 saat
        errors.push('Uçuş süresi en fazla 4 saat olabilir!');
    }

    // 4. Koltuk kontrolü
    if (flightData.seats_total < 20 || flightData.seats_total > 300) {
        errors.push('Koltuk sayısı 20-300 arası olmalı!');
    }
    if (flightData.seats_available > flightData.seats_total) {
        errors.push('Müsait koltuk sayısı toplam koltuk sayısını geçemez!');
    }

    return errors;
};

module.exports = { validateFlightRules };