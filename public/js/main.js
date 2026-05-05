class FlyTicketApp {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadCities();
        this.bindEvents();
        this.setMinDate();
    }

    async loadCities() {
        try {
            const response = await fetch('/api/flights/cities');
            const cities = await response.json();
            
            const fromSelect = document.getElementById('fromCity');
            const toSelect = document.getElementById('toCity');
            
            cities.forEach(city => {
                const option1 = new Option(city.city_name, city.city_name);
                const option2 = new Option(city.city_name, city.city_name);
                fromSelect.add(option1);
                toSelect.add(option2);
            });
        } catch (error) {
            console.error('Şehirler yüklenemedi:', error);
        }
    }

    bindEvents() {
        document.getElementById('searchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.searchFlights();
        });

        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.bookTicket();
        });

        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('bookingModal').style.display = 'none';
        });

        // Admin link
        document.getElementById('adminLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAdminLogin();
        });
    }

    setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('departureDate').min = today;
        document.getElementById('departureDate').value = today;
    }

    async searchFlights() {
        const from = document.getElementById('fromCity').value;
        const to = document.getElementById('toCity').value;
        const date = document.getElementById('departureDate').value;

        if (!from || !to || !date) {
            alert('Lütfen tüm alanları doldurun!');
            return;
        }

        if (from === to) {
            alert('Kalkış ve varış şehirleri aynı olamaz!');
            return;
        }

        this.showLoading(true);

        try {
            const params = new URLSearchParams({ from, to, date });
            const response = await fetch(`/api/flights?${params}`);
            const flights = await response.json();

            this.displayFlights(flights);
        } catch (error) {
            console.error('Uçuş aranırken hata:', error);
            alert('Uçuş aranırken hata oluştu!');
        } finally {
            this.showLoading(false);
        }
    }

    displayFlights(flights) {
        const flightsGrid = document.getElementById('flightsGrid');
        const flightCount = document.getElementById('flightCount');
        const flightsSection = document.getElementById('flightsSection');

        if (flights.length === 0) {
            flightsGrid.innerHTML = `
                <div class="no-flights">
                    <i class="fas fa-plane-slash" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>Bu kriterlerde uçuş bulunamadı</h3>
                    <p>Kriterleri değiştirip tekrar arayın</p>
                </div>
            `;
        } else {
            flightsGrid.innerHTML = flights.map(flight => `
                <div class="flight-card" data-flight-id="${flight._id}">
                    <div class="flight-route">
                        <div class="city">
                            <div class="city-name">${flight.from_city.city_name}</div>
                            <div class="city-time">${new Date(flight.departure_time).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                        <div class="flight-icon">
                            ➜
                        </div>
                        <div class="city">
                            <div class="city-name">${flight.to_city.city_name}</div>
                            <div class="city-time">${new Date(flight.arrival_time).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                    </div>
                    <div class="flight-details">
                        <div class="detail-item">
                            <div class="detail-label">Süre</div>
                            <div class="detail-value">${this.formatDuration(flight.departure_time, flight.arrival_time)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Koltuk</div>
                            <div class="detail-value">${flight.seats_available}/${flight.seats_total}</div>
                        </div>
                    </div>
                    <div class="price-section">
                        <div class="price">${flight.price}₺</div>
                        <div style="font-size: 0.95rem; opacity: 0.9;">Tek yön</div>
                    </div>
                    <button class="book-btn" onclick="app.selectFlight('${flight._id}', '${flight.from_city.city_name}', '${flight.to_city.city_name}', '${new Date(flight.departure_time).toLocaleDateString('tr-TR')} ${new Date(flight.departure_time).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}')">
                        Bilet Al <i class="fas fa-ticket-alt"></i>
                    </button>
                </div>
            `).join('');
        }

        flightCount.textContent = `${flights.length} uçuş bulundu`;
        flightsSection.style.display = 'block';
        window.scrollTo({ top: flightsSection.offsetTop - 100, behavior: 'smooth' });
    }

    formatDuration(start, end) {
        const diff = new Date(end) - new Date(start);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}sa ${minutes}dk`;
    }

    selectFlight(id, from, to, time) {
        document.getElementById('selectedFlightId').value = id;
        document.getElementById('bookingModal').style.display = 'flex';
    }

    async bookTicket() {
        const flightId = document.getElementById('selectedFlightId').value;
        const name = document.getElementById('passengerName').value;
        const surname = document.getElementById('passengerSurname').value;
        const email = document.getElementById('passengerEmail').value;

        if (!name || !surname || !email) {
            alert('Lütfen tüm alanları doldurun!');
            return;
        }

        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passenger_name: name,
                    passenger_surname: surname,
                    passenger_email: email,
                    flight_id: flightId
                })
            });

            if (response.ok) {
                document.getElementById('bookingModal').style.display = 'none';
                document.getElementById('successModal').style.display = 'flex';
                this.clearBookingForm();
            } else {
                const error = await response.json();
                alert('Hata: ' + error.error);
            }
        } catch (error) {
            alert('Bilet alınırken hata oluştu!');
        }
    }

    clearBookingForm() {
        document.getElementById('bookingForm').reset();
    }

    showLoading(show) {
        document.getElementById('loading').style.display = show ? 'flex' : 'none';
    }

    showAdminLogin() {
            window.location.href = '/login.html';
       
    }
}

// Global app instance
const app = new FlyTicketApp();

function closeSuccess() {
    document.getElementById('successModal').style.display = 'none';
}