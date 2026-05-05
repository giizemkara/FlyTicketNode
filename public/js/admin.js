class AdminPanel {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadCities();
        this.bindEvents();
        await this.loadDashboard();
    }

    logout() {
    localStorage.removeItem('adminToken');
    window.location.href = '/login.html';
}

    bindEvents() {
        // Nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchPage(item.dataset.page);
            });
        });

        // Add flight modal
        document.getElementById('addFlightBtn').addEventListener('click', () => {
            document.getElementById('addFlightModal').style.display = 'flex';
        });

        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('addFlightModal').style.display = 'none';
        });

        // Add flight form
        document.getElementById('addFlightForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addFlight();
        });

        // Ticket search
        document.getElementById('ticketSearch').addEventListener('input', (e) => {
            this.searchTickets(e.target.value);
        });
    }

    switchPage(page) {
        document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        
        document.getElementById(page).classList.add('active');
        event.target.classList.add('active');
    }

    async loadCities() {
        const response = await fetch('/api/flights/cities');
        const cities = await response.json();
        
        const selects = ['fromCityAdmin', 'toCityAdmin'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            cities.forEach(city => {
                select.add(new Option(city.city_name, city.city_name));
            });
        });
    }

    async loadDashboard() {
        const flightsRes = await fetch('/api/admin/flights');
        const flights = await flightsRes.json();
        
        const ticketsRes = await fetch('/api/tickets');
        const tickets = await ticketsRes.json();

        document.getElementById('totalFlights').textContent = flights.length;
        document.getElementById('totalTickets').textContent = tickets.length;
        
        const totalSeats = flights.reduce((sum, f) => sum + f.seats_available, 0);
        document.getElementById('availableSeats').textContent = totalSeats;
    }

    async addFlight() {
        const flightData = {
            from_city: document.getElementById('fromCityAdmin').value,
            to_city: document.getElementById('toCityAdmin').value,
            departure_time: document.getElementById('departureTime').value,
            arrival_time: document.getElementById('arrivalTime').value,
            price: parseInt(document.getElementById('price').value),
            seats_total: parseInt(document.getElementById('seatsTotal').value)
        };

        try {
            const response = await fetch('/api/flights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flightData)
            });

            const result = await response.json();
            
            if (response.ok) {
                alert('✅ Uçuş eklendi!');
                document.getElementById('addFlightModal').style.display = 'none';
                document.getElementById('addFlightForm').reset();
                this.loadFlights();
                this.loadDashboard();
            } else {
                alert('❌ Hata: ' + (result.errors || result.error));
            }
        } catch (error) {
            alert('❌ Bağlantı hatası!');
        }
    }

    async loadFlights() {
        const response = await fetch('/api/admin/flights');
        const flights = await response.json();
        
        const tbody = document.getElementById('flightsTableBody');
        tbody.innerHTML = flights.map(flight => `
            <tr>
                <td>${flight.flight_id}</td>
                <td>${flight.from_city?.city_name || 'N/A'}</td>
                <td>${flight.to_city?.city_name || 'N/A'}</td>
                <td>${new Date(flight.departure_time).toLocaleString('tr-TR')}</td>
                <td>${new Date(flight.arrival_time).toLocaleString('tr-TR')}</td>
                <td>${flight.price}₺</td>
                <td>${flight.seats_available}/${flight.seats_total}</td>
                <td>
                    <button class="btn-small btn-edit">Düzenle</button>
                    <button class="btn-small btn-delete" onclick="admin.deleteFlight('${flight._id}')">Sil</button>
                </td>
            </tr>
        `).join('');
    }

    async loadTickets() {
        const response = await fetch('/api/tickets');
        const tickets = await response.json();
        
        const tbody = document.getElementById('ticketsTableBody');
        tbody.innerHTML = tickets.map(ticket => `
            <tr>
                <td>${ticket.ticket_id}</td>
                <td>${ticket.passenger_name} ${ticket.passenger_surname}</td>
                <td>${ticket.passenger_email}</td>
                <td>${ticket.flight_id?.flight_id || 'N/A'}</td>
                <td>${new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</td>
            </tr>
        `).join('');
    }

    async searchTickets(email) {
        if (!email) {
            await this.loadTickets();
            return;
        }
        
        const response = await fetch(`/api/tickets/${email}`);
        const tickets = await response.json();
        
        const tbody = document.getElementById('ticketsTableBody');
        tbody.innerHTML = tickets.map(ticket => `
            <tr>
                <td>${ticket.ticket_id}</td>
                <td>${ticket.passenger_name} ${ticket.passenger_surname}</td>
                <td>${ticket.passenger_email}</td>
                <td>${ticket.flight_id?.flight_id || 'N/A'}</td>
                <td>${new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</td>
            </tr>
        `).join('');
    }

    async deleteFlight(id) {
        if (!confirm('Uçuşu silmek istediğinizden emin misiniz?')) return;
        
        try {
            // DELETE endpoint sonra eklenecek
            alert('Silme özelliği yakında!');
        } catch (error) {
            alert('Silme hatası!');
        }
    }
}


const admin = new AdminPanel();

// Sayfa değişimi
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', async (e) => {
        const page = e.target.closest('.nav-item').dataset.page;
        if (page === 'flights') await admin.loadFlights();
        if (page === 'tickets') await admin.loadTickets();
    });
});