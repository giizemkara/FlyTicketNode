document.addEventListener('DOMContentLoaded', () => {
    loadCities();
    loadFlights();
    loadTickets();
    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = '/login.html';
    });

    // Uçuş kaydetme formu
    document.getElementById('addFlightForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const flightData = {
            from_city: document.getElementById('flightFrom').value,
            to_city: document.getElementById('flightTo').value,
            departure_time: document.getElementById('flightDeparture').value,
            arrival_time: document.getElementById('flightArrival').value,
            price: Number(document.getElementById('flightPrice').value),
            seats_total: Number(document.getElementById('flightSeats').value)
        };

        if (flightData.from_city === flightData.to_city) {
            return Swal.fire({ icon: 'warning', title: 'Error', text: 'Departure and arrival cities cannot be the same!', confirmButtonColor: '#ffc107' });
        }

        try {
            const response = await fetch('/api/admin/flights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flightData)
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({ icon: 'success', title: 'Successful!', text: result.message, confirmButtonColor: '#28a745' }); 
                document.getElementById('addFlightForm').reset(); 
                loadFlights();
            } else {
                Swal.fire({ icon: 'error', title: 'Rule Violation', text: result.error, confirmButtonColor: '#dc3545' }); 
            }
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Connection Error', text: 'Failed to connect to the server!', confirmButtonColor: '#dc3545' });
        }
    });
});

// 2. GLOBAL FONKSİYONLAR
// Şehirleri getiren fonksiyon
async function loadCities() {
    try {
        const response = await fetch('/api/flights/cities');
        const cities = await response.json();

        const fromSelect = document.getElementById('flightFrom');
        const toSelect = document.getElementById('flightTo');

        fromSelect.innerHTML = '<option value="">Select Departure City</option>';
        toSelect.innerHTML = '<option value="">Select Arrival City</option>';

        cities.forEach(city => {
            fromSelect.add(new Option(city.city_name, city._id));
            toSelect.add(new Option(city.city_name, city._id));
        });
    } catch (error) {
        console.error('Cities could not be loaded:', error);
    }
}
//Uçuşları getiren fonksiyon
async function loadFlights() {
    try {
        const response = await fetch('/api/admin/flights');
        const flights = await response.json();
        const tbody = document.getElementById('flightsTableBody');
        
        if (flights.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No flights found in the system.</td></tr>';
            return;
        }

        const now = new Date(); //Şu anki anı alıyoruz

        tbody.innerHTML = flights.map(flight => {
            const flightDate = new Date(flight.departure_time);
            const isPast = flightDate < now; //Uçuşun zamanı geçti mi?

            return `
                <tr class="${isPast ? 'past-flight' : ''}">
                    <td><strong>${flight.flight_id}</strong></td>
                    <td>
                        <span class="city-badge">${flight.from_city?.city_name}</span> ➔ 
                        <span class="city-badge">${flight.to_city?.city_name}</span>
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <div style="font-size: 0.9rem;"><strong>K:</strong> ${new Date(flight.departure_time).toLocaleString('tr-TR')}</div>
                            ${isPast ? '<span class="badge-completed">Completed</span>' : ''}
                        </div>
                        <div style="font-size: 0.9rem; color: #666;"><strong>V:</strong> ${new Date(flight.arrival_time).toLocaleString('tr-TR')}</div>
                    </td>
                    <td>${flight.price} ₺</td>
                    <td>${flight.seats_available} / ${flight.seats_total}</td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="openEditModal('${flight._id}', '${flight.price}', '${flight.departure_time}', '${flight.arrival_time}')"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn-sm btn-delete" onclick="deleteFlight('${flight._id}')"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Flights could not be loaded:', error);
        document.getElementById('flightsTableBody').innerHTML = '<tr><td colspan="6" style="text-align:center; color: red;">An error occurred while loading flight data!</td></tr>';
    }
}

// Silme işlemini yapan global fonksiyon
async function deleteFlight(id) {
    const confirmDelete = await Swal.fire({
        title: 'Are you sure?',
        text: "Are you sure you want to delete this flight? This action cannot be undone!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: '<i class="fas fa-trash"></i> Yes, Delete!',
        cancelButtonText: 'Cancel'
    });

    if (!confirmDelete.isConfirmed) return;

    try {
        const response = await fetch(`/api/admin/flights/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            Swal.fire({ icon: 'success', title: 'Deleted!', text: result.message, timer: 1500, showConfirmButton: false });
            loadFlights();
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: result.error });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'An error occurred while deleting the flight!' });
    }
}
// Satılan biletleri getiren global fonksiyon
async function loadTickets() {
    try {
        const response = await fetch('/api/admin/tickets');
        const tickets = await response.json();
        const tbody = document.getElementById('ticketsTableBody');
        
        if (tickets.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No tickets found in the system.</td></tr>';
            return;
        }

        tbody.innerHTML = tickets.map(ticket => {
            // Eğer uçuş silindiyse sistem çökmesin diye küçük bir kontrol
            const flight = ticket.flight_id;
            const route = flight ? `${flight.from_city?.city_name} ➔ ${flight.to_city?.city_name}` : '<span style="color:red;">Deleted Flight</span>';
            const date = new Date(ticket.createdAt).toLocaleString('tr-TR');

            return `
            <tr>
                <td><strong>${ticket.ticket_id}</strong></td>
                <td>${ticket.passenger_name} ${ticket.passenger_surname}</td>
                <td>${ticket.passenger_email}</td>
                <td><span class="city-badge">${route}</span></td>
                <td>${date}</td>
            </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Tickets could not be loaded:', error);
        document.getElementById('ticketsTableBody').innerHTML = '<tr><td colspan="5" style="text-align:center; color: red;">An error occurred while loading ticket data!</td></tr>';
    }
}
// Geçmiş tarihlerin seçilmesini engelle
function setMinDateTime() {
    const now = new Date();
    // Türkiye saati ve yerel saat dilimi ayarı
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    
    // YYYY-MM-DDTHH:mm formatı
    const minDateTime = now.toISOString().slice(0, 16);

    // Sayfadaki tüm datetime-local türündeki kutucukları bul (Ekleme ve Düzenleme formları dahil)
    const dateInputs = document.querySelectorAll('input[type="datetime-local"]');
    
    dateInputs.forEach(input => {
        input.min = minDateTime;
    });
}

document.addEventListener('DOMContentLoaded', setMinDateTime);
function openEditModal(id, price, depTime, arrTime) {
    document.getElementById('editFlightId').value = id;
    document.getElementById('editPrice').value = price;
    
    // HTML inputlarına tarihleri basabilmek için format düzeltmesi yapıyoruz
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); // Saat dilimi hatasını önler
        return d.toISOString().slice(0, 16);
    };

    document.getElementById('editDeparture').value = formatDate(depTime);
    document.getElementById('editArrival').value = formatDate(arrTime);
    
    document.getElementById('editModal').style.display = 'flex';
}

// Düzenle penceresini kapatır
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Form gönderildiğinde veritabanını günceller
document.getElementById('editFlightForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editFlightId').value;
    const data = {
        price: Number(document.getElementById('editPrice').value),
        departure_time: document.getElementById('editDeparture').value,
        arrival_time: document.getElementById('editArrival').value
    };

    try {
        const response = await fetch(`/api/admin/flights/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            Swal.fire({ icon: 'success', title: 'Updated!', text: result.message, timer: 1500, showConfirmButton: false });
            closeEditModal();
            loadFlights();
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: result.error, confirmButtonColor: '#dc3545' });
        }
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Server Error!', confirmButtonColor: '#dc3545' });
    }
});