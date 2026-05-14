class FlyTicketApp {
    constructor() {
        this.init();
        this.updateNavbarAuthStatus(); // Check if user is logged in on page load
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
            console.error('Cities could not be loaded:', error);
        }
    }

    bindEvents() {
        document.getElementById('searchForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.searchFlights();
        });
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.openSeatSelection();
        });
        document.getElementById('paymentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPaymentAndBook();
        });

        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('bookingModal').style.display = 'none';
        });
        // Admin link
        document.getElementById('adminLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showAdminLogin();
        });
        //Auth Form Listeners
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
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
            alert('Please fill in all search fields!');
            return;
        }

        if (from === to) {
            alert('Departure and arrival cities cannot be the same!');
            return;
        }

        this.showLoading(true);

        try {
            const params = new URLSearchParams({ from, to, date });
            const response = await fetch(`/api/flights?${params}`);
            const flights = await response.json();

            this.displayFlights(flights);
        } catch (error) {
            console.error('Error occurred while searching for flights:', error);
            alert('An error occurred while searching for flights!');
        } finally {
            this.showLoading(false);
        }
    }

   displayFlights(flights) {
        const flightsGrid = document.getElementById('flightsGrid');
        const flightCount = document.getElementById('flightCount');
        const flightsSection = document.getElementById('flightsSection');

        // Şu anki zamanı al ve sadece gelecekteki uçuşları filtrele!
        const now = new Date();
        const availableFlights = flights.filter(flight => new Date(flight.departure_time) > now);

        if (availableFlights.length === 0) {
            flightsGrid.innerHTML = `
                <div class="no-flights">
                    <i class="fas fa-plane-slash" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>No available flights found</h3>
                    <p>There are no upcoming flights for this route today. Try another date.</p>
                </div>
            `;
        } else {
            flightsGrid.innerHTML = availableFlights.map(flight => `
                <div class="flight-card" data-flight-id="${flight._id}">
                    <div class="flight-route">
                        <div class="city">
                            <div class="city-name">${flight.from_city.city_name}</div>
                            <div class="city-time">${new Date(flight.departure_time).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                        <div class="flight-icon">➜</div>
                        <div class="city">
                            <div class="city-name">${flight.to_city.city_name}</div>
                            <div class="city-time">${new Date(flight.arrival_time).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                    </div>
                    <div class="flight-details">
                        <div class="detail-item">
                            <div class="detail-label">Duration</div>
                            <div class="detail-value">${this.formatDuration(flight.departure_time, flight.arrival_time)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Seats</div>
                            <div class="detail-value">${flight.seats_available}/${flight.seats_total}</div>
                        </div>
                    </div>
                    <div class="price-section">
                        <div class="price">${flight.price}₺</div>
                        <div style="font-size: 0.95rem; opacity: 0.9;">One Way</div>
                    </div>
                    
                    ${flight.seats_available > 0 
                        ? `<button class="book-btn" onclick="app.selectFlight('${flight._id}', '${flight.from_city.city_name}', '${flight.to_city.city_name}', '${new Date(flight.departure_time).toLocaleDateString('tr-TR')} ${new Date(flight.departure_time).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}')">
                                Buy Ticket <i class="fas fa-ticket-alt"></i>
                           </button>` 
                        : `<button class="book-btn" style="background-color: #6c757d; cursor: not-allowed; opacity: 0.7;" disabled>
                                Sold Out <i class="fas fa-ban"></i>
                           </button>`
                    }
                </div>
            `).join('');
        }

        flightCount.textContent = `${availableFlights.length} flights found`;
        flightsSection.style.display = 'block';
        window.scrollTo({ top: flightsSection.offsetTop - 100, behavior: 'smooth' });
    }
    formatDuration(start, end) {
        const diff = new Date(end) - new Date(start);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }

    selectFlight(id, from, to, time) {
        document.getElementById('selectedFlightId').value = id;
        document.getElementById('bookingModal').style.display = 'flex';
    }

   //Ödeme penceresini açan fonksiyon
    openPaymentModal() {
        const name = document.getElementById('passengerName').value;
        const surname = document.getElementById('passengerSurname').value;
        const email = document.getElementById('passengerEmail').value;

        if (!name || !surname || !email) {
            Swal.fire({ icon: 'warning', title: 'Missing Information', text: 'Please fill in all passenger information!', confirmButtonColor: '#667eea' });
            return;
        }

        //Tıklanan uçuşun fiyatını arayüzden bulalım
        const flightId = document.getElementById('selectedFlightId').value;
        const flightCard = document.querySelector(`.flight-card[data-flight-id="${flightId}"]`);
        const price = flightCard ? flightCard.querySelector('.price').innerText : 'Unknown';

        document.getElementById('paymentAmountDisplay').innerText = price;
        document.getElementById('paymentModal').style.display = 'flex';
    }

    //Ödeme penceresini kapatan fonksiyon
    closePaymentModal() {
        document.getElementById('paymentModal').style.display = 'none';
        document.getElementById('paymentForm').reset();
    }

    //Ödemeyi onaylayıp bileti backend'e gönderen fonksiyon
    async processPaymentAndBook() {
        const flightId = document.getElementById('selectedFlightId').value;
        const name = document.getElementById('passengerName').value;
        const surname = document.getElementById('passengerSurname').value;
        const email = document.getElementById('passengerEmail').value;

        this.showLoading(true);

        //Ödeme doğrulama simülasyonu 
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    passenger_name: name,
                    passenger_surname: surname,
                    passenger_email: email,
                    flight_id: flightId,
                    seat_number: document.getElementById('selectedSeatNumber').value 
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.closePaymentModal();
                document.getElementById('bookingModal').style.display = 'none';
                this.clearBookingForm();
                
                Swal.fire({
                    icon: 'success',
                    title: 'Payment Successful!',
                    html: `Your Ticket Number: <strong>${result.ticket_id}</strong><br>You can view your ticket from the "Check Ticket" menu.`,
                    confirmButtonColor: '#28a745'
                });
            } else {
                Swal.fire({ icon: 'error', title: 'Payment Failed', text: result.error, confirmButtonColor: '#dc3545' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Failed to connect to the server!', confirmButtonColor: '#dc3545' });
        } finally {
            this.showLoading(false);
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
    //Müşteri Bilet Sorgulama Fonksiyonu
    async findMyTickets() {
        const email = document.getElementById('searchEmail').value;
        const resultDiv = document.getElementById('myTicketsResult');
        
        if (!email) {
            Swal.fire({ icon: 'warning', title: 'Warning', text: 'Please enter your email address!', confirmButtonColor: '#667eea' });
            return;
        }

        resultDiv.innerHTML = '<div style="text-align:center;"><i class="fas fa-spinner fa-spin fa-2x" style="color:#667eea;"></i></div>';

        try {
            const response = await fetch(`/api/tickets/${email}`);
            const tickets = await response.json();

            if (tickets.length === 0) {
                resultDiv.innerHTML = '<div style="text-align:center; color:#666; padding: 1rem; background:#f8f9fa; border-radius:10px;">No tickets found for this email address.</div>';
                return;
            }

            resultDiv.innerHTML = tickets.map(t => {
                const flight = t.flight_id;
                const route = flight ? `${flight.from_city.city_name} ➔ ${flight.to_city.city_name}` : 'Canceled Flight';
                const time = flight ? new Date(flight.departure_time).toLocaleString('tr-TR') : '-';
                
                return `
                <div style="background: #f8f9fa; border: 1px solid #e1e5e9; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="color: #667eea; font-weight: 700; margin-bottom: 0.2rem;"><i class="fas fa-ticket-alt"></i> ${t.ticket_id}</div>
                        <div style="font-weight: 600; color: #333;">${route}</div>
                        <div style="font-size: 0.85rem; color: #666;"><i class="fas fa-calendar-alt"></i> ${time}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.9rem; color: #555;">Passenger</div>
                        <div style="font-weight: 600;">${t.passenger_name} ${t.passenger_surname}</div>
                        <button onclick="window.print()" style="background-color: #667eea; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; font-size: 0.8rem; font-weight: bold; transition: background 0.3s;">
                            <i class="fas fa-file-pdf"></i> Download
                        </button>
                    </div>
                </div>`;
            }).join('');
        } catch (error) {
            resultDiv.innerHTML = '<div style="color:red; text-align:center;">Connection error occurred.</div>';
        }
    }
    // AUTHENTICATION FUNCTIONS (Login / Register)
    openAuthModal() {
        document.getElementById('authModal').style.display = 'flex';
    }

    closeAuthModal() {
        document.getElementById('authModal').style.display = 'none';
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
    }

    switchAuthTab(tab) {
        if (tab === 'login') {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('tabLogin').style.cssText = 'cursor: pointer; color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px;';
            document.getElementById('tabRegister').style.cssText = 'cursor: pointer; color: #999; padding-bottom: 5px; border-bottom: none;';
        } else {
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('registerForm').style.display = 'block';
            document.getElementById('tabRegister').style.cssText = 'cursor: pointer; color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 5px;';
            document.getElementById('tabLogin').style.cssText = 'cursor: pointer; color: #999; padding-bottom: 5px; border-bottom: none;';
        }
    }
    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value;
        const surname = document.getElementById('regSurname').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, surname, email, password })
            });
            const result = await response.json();

            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Success!', text: 'Registration successful! You can now log in.', confirmButtonColor: '#28a745' });
                this.switchAuthTab('login');
                document.getElementById('registerForm').reset();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: result.error || 'Registration failed.', confirmButtonColor: '#dc3545' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Server is not responding.', confirmButtonColor: '#dc3545' });
        }
    }
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();

            if (response.ok) {
                //Save user info to local storage
                localStorage.setItem('flyticket_user', JSON.stringify(result.user));
                this.updateNavbarAuthStatus();
                this.closeAuthModal();
                Swal.fire({ icon: 'success', title: 'Welcome!', text: `Hello, ${result.user.name}!`, timer: 1500, showConfirmButton: false });
            } else {
                Swal.fire({ icon: 'error', title: 'Login Failed', text: result.error || 'Invalid credentials.', confirmButtonColor: '#dc3545' });
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Server is not responding.', confirmButtonColor: '#dc3545' });
        }
    }
    logoutUser() {
        localStorage.removeItem('flyticket_user');
        this.updateNavbarAuthStatus();
        Swal.fire({ icon: 'info', title: 'Logged Out', text: 'You have been logged out successfully.', timer: 1500, showConfirmButton: false });
    }
    updateNavbarAuthStatus() {
        const userStr = localStorage.getItem('flyticket_user');
        const loginBtn = document.getElementById('navLoginBtn');
        const profileDiv = document.getElementById('navUserProfile');
        const userNameSpan = document.getElementById('navUserName');
        if (userStr) {
            const user = JSON.parse(userStr);
            if(loginBtn) loginBtn.style.display = 'none';
            if(profileDiv) profileDiv.style.display = 'flex';
            if(userNameSpan) userNameSpan.innerText = `${user.name} ${user.surname}`;
            // Automatically fill passenger details if logged in
            const pName = document.getElementById('passengerName');
            const pSurname = document.getElementById('passengerSurname');
            const pEmail = document.getElementById('passengerEmail');
            if(pName && pSurname && pEmail) {
                pName.value = user.name;
                pSurname.value = user.surname;
                pEmail.value = user.email;
            }
        } else {
            if(loginBtn) loginBtn.style.display = 'block';
            if(profileDiv) profileDiv.style.display = 'none';
        }
    }
    // SEAT SELECTION FUNCTIONS
    openSeatSelection() {
        const name = document.getElementById('passengerName').value;
        const surname = document.getElementById('passengerSurname').value;
        const email = document.getElementById('passengerEmail').value;

        if (!name || !surname || !email) {
            Swal.fire({ icon: 'warning', title: 'Missing Info', text: 'Please fill in all passenger details!', confirmButtonColor: '#667eea' });
            return;
        }

        this.renderSeats();
        document.getElementById('bookingModal').style.display = 'none';
        document.getElementById('seatModal').style.display = 'flex';
    }

    renderSeats() {
        const seatMap = document.getElementById('seatMap');
        seatMap.innerHTML = ''; //Temizle
        document.getElementById('selectedSeatNumber').value = ''; //Seçimi sıfırla

        const rows = 6; // 6 sıra koltuk
        const letters = ['A', 'B', 'C', 'D']; // 2 sağda 2 solda

        for (let i = 1; i <= rows; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'seat-row';
            
            letters.forEach((letter, index) => {
                const seatNum = `${i}${letter}`;
                const seatDiv = document.createElement('div');
                seatDiv.className = 'seat';
                seatDiv.innerText = seatNum;
                seatDiv.onclick = () => {
                    // Önce diğer seçilileri temizle
                    document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
                    seatDiv.classList.add('selected');
                    document.getElementById('selectedSeatNumber').value = seatNum;
                };

                rowDiv.appendChild(seatDiv);
                // 2. koltuktan sonra koridor boşluğu (B ile C arasına)
                if (index === 1) {
                    const aisle = document.createElement('div');
                    aisle.className = 'aisle';
                    rowDiv.appendChild(aisle);
                }
            });
            seatMap.appendChild(rowDiv);
        }
    }async renderSeats() {
        const flightId = document.getElementById('selectedFlightId').value;
        const seatMap = document.getElementById('seatMap');
        seatMap.innerHTML = '<div style="text-align:center; padding:20px;"><i class="fas fa-spinner fa-spin"></i> Loading seats...</div>'; 
        
        try {
            // 1. Dolu koltukları backend'den çek
            const response = await fetch(`/api/tickets/booked-seats/${flightId}`);
            const bookedSeats = await response.json();

            seatMap.innerHTML = ''; 
            document.getElementById('selectedSeatNumber').value = ''; 

            const rows = 6; 
            const letters = ['A', 'B', 'C', 'D']; 

            for (let i = 1; i <= rows; i++) {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'seat-row';
                
                letters.forEach((letter, index) => {
                    const seatNum = `${i}${letter}`;
                    const seatDiv = document.createElement('div');
                    
                    // Eğer koltuk doluysa 'occupied' class'ı ekle, değilse normal 'seat'
                    const isBooked = bookedSeats.includes(seatNum);
                    seatDiv.className = isBooked ? 'seat occupied' : 'seat';
                    seatDiv.innerText = seatNum;
                    
                    if (!isBooked) {
                        seatDiv.onclick = () => {
                            document.querySelectorAll('.seat.selected').forEach(s => s.classList.remove('selected'));
                            seatDiv.classList.add('selected');
                            document.getElementById('selectedSeatNumber').value = seatNum;
                        };
                    } else {
                        seatDiv.title = "This seat is already booked";
                    }

                    rowDiv.appendChild(seatDiv);
                    if (index === 1) {
                        const aisle = document.createElement('div');
                        aisle.className = 'aisle';
                        rowDiv.appendChild(aisle);
                    }
                });
                seatMap.appendChild(rowDiv);
            }
        } catch (error) {
            console.error("Seats could not be loaded:", error);
            seatMap.innerHTML = "Error loading seats.";
        }
    }

    confirmSeatAndPay() {
        const selectedSeat = document.getElementById('selectedSeatNumber').value;
        if (!selectedSeat) {
            Swal.fire({ icon: 'warning', title: 'Seat Required', text: 'Please select a seat to continue.', confirmButtonColor: '#ffc107' });
            return;
        }
        
        document.getElementById('seatModal').style.display = 'none';
        this.openPaymentModal();
    }
}
// Global app instance
const app = new FlyTicketApp();

function closeSuccess() {
    document.getElementById('successModal').style.display = 'none';
}