const Flight = require('../models/Flight');
const City = require('../models/City');
const validateFlightRules = async (flightData, flightId = null) => {
    const errors = [];
    // A. Aynı şehre uçuş olamaz
    if (String(flightData.from_city) === String(flightData.to_city)) {
        errors.push('Departure and destination cities cannot be the same!');
    }
    // B. Geçmişe uçuş eklenemez
    if (new Date(flightData.departure_time) < new Date()) {
        errors.push('Departure time cannot be in the past!');
    }
    // C. Bedava veya eksi değer uçuş olamaz
    if (flightData.price <= 0) {
        errors.push('Ticket price must be strictly greater than 0!');
    }
    // 1. Aynı şehirden aynı saatte uçuş kontrolü
    let depQuery = {
        'from_city': flightData.from_city,
        departure_time: {
            $gte: new Date(flightData.departure_time.getTime() - 30*60*1000), // 30dk tolerans
            $lte: new Date(flightData.departure_time.getTime() + 30*60*1000)
        }
    };
    if (flightId) depQuery._id = { $ne: flightId }; // Güncelleme yapılıyorsa kendisini atla

    const sameDepartureHour = await Flight.findOne(depQuery);
    if (sameDepartureHour) {
        errors.push('There is already a flight departing from this city at the same time!');
    }
    // 2. Aynı şehre aynı saatte varış kontrolü
    let arrQuery = {
        'to_city': flightData.to_city,
        arrival_time: {
            $gte: new Date(flightData.arrival_time.getTime() - 30*60*1000),
            $lte: new Date(flightData.arrival_time.getTime() + 30*60*1000)
        }
    };
    if (flightId) arrQuery._id = { $ne: flightId }; // Güncelleme yapılıyorsa kendisini atla

    const sameArrivalHour = await Flight.findOne(arrQuery);
    if (sameArrivalHour) {
        errors.push('There is already a flight arriving at this city at the same time!');
    }
    // 3. Uçuş süresi kontrolü
    const flightDuration = (flightData.arrival_time - flightData.departure_time) / (1000 * 60);
    if (flightDuration < 30) {
        errors.push('Flight duration must be at least 30 minutes!');
    }
    if (flightDuration > 240) { // 4 saat mantık olarak yeterli.
        errors.push('Flight duration must be at most 4 hours!');
    }
    // 4. Koltuk kontrolü
    if (flightData.seats_total < 20 || flightData.seats_total > 300) {
        errors.push('Seat count must be between 20 and 300!');
    }
    if (flightData.seats_available > flightData.seats_total) {
        errors.push('Available seats count cannot exceed total seats count!');
    }
    return errors;
};

module.exports = { validateFlightRules };