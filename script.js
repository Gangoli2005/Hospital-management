// --- Initial Data ---
const TOTAL_BED_COUNT = 20;

const defaultDoctors = [
    { 
        id: 1, 
        name: "Dr. Smith", 
        specialization: "Cardiology", 
        experience: 15,
        address: "123 Medical Lane, Cityville",
        image: "https://i.pravatar.cc/150?img=11", 
        shift: "09:00 AM - 05:00 PM", 
        break: "01:00 PM - 02:00 PM", 
        status: "Available" 
    },
    { 
        id: 2, 
        name: "Dr. Johnson", 
        specialization: "Neurology", 
        experience: 8,
        address: "456 Health Blvd, Metro",
        image: "https://i.pravatar.cc/150?img=5", 
        shift: "10:00 AM - 06:00 PM", 
        break: "02:00 PM - 03:00 PM", 
        status: "On Leave" 
    }
];

// --- Load Data ---
let doctors = JSON.parse(localStorage.getItem('doctors')) || defaultDoctors;
let patients = JSON.parse(localStorage.getItem('patients')) || [];
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let emergencies = JSON.parse(localStorage.getItem('emergencies')) || [];
let beds = JSON.parse(localStorage.getItem('beds'));

if (!beds || beds.length === 0) {
    beds = [];
    for (let i = 1; i <= TOTAL_BED_COUNT; i++) {
        beds.push({ id: i, status: 'Available' });
    }
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    saveData();
    updateDashboard();
    renderDoctors();
    renderPatients();
    renderAppointments();
    renderBeds();
    renderEmergencies();
    populateDoctorSelect();
});

function saveData() {
    localStorage.setItem('doctors', JSON.stringify(doctors));
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('appointments', JSON.stringify(appointments));
    localStorage.setItem('emergencies', JSON.stringify(emergencies));
    localStorage.setItem('beds', JSON.stringify(beds));
    updateDashboard();
    populateDoctorSelect();
}

// --- Render Functions ---

function renderDoctors() {
    const tbody = document.getElementById('doctors-table-body');
    tbody.innerHTML = '';
    doctors.forEach(doc => {
        const statusClass = doc.status === 'Available' ? 'status-available' : 'status-leave';
        
        // Use default avatar if image is missing
        const imgUrl = doc.image || `https://ui-avatars.com/api/?name=${doc.name}&background=random`;

        tbody.innerHTML += `
            <tr>
                <td><img src="${imgUrl}" class="doctor-avatar" alt="Doc"></td>
                <td>
                    <b>${doc.name}</b><br>
                    <small style="color:gray;">${doc.address}</small>
                </td>
                <td>
                    ${doc.specialization}<br>
                    <small>${doc.experience} Years Exp.</small>
                </td>
                <td>${doc.shift}</td>
                <td>
                    <button class="status-btn ${statusClass}" onclick="toggleDoctorStatus(${doc.id})">
                        ${doc.status}
                    </button>
                </td>
                <td><button class="btn-danger" onclick="deleteDoctor(${doc.id})">Remove</button></td>
            </tr>`;
    });
}

function renderAppointments() {
    const tbody = document.getElementById('appointments-table-body');
    tbody.innerHTML = '';
    appointments.slice().reverse().forEach(app => {
        const statusClass = app.status === 'Confirmed' ? 'status-confirmed' : 'status-pending';
        const timeDisplay = app.time ? app.time : '09:00'; 
        const feeDisplay = app.fees ? `$${app.fees}` : '-';

        tbody.innerHTML += `
            <tr>
                <td>${app.patient}<br><small>${app.phone}</small></td>
                <td>${app.doctor}</td>
                <td>${app.date} <br> <i class="fa-regular fa-clock"></i> ${timeDisplay}</td>
                <td><b>${feeDisplay}</b></td>
                <td><button class="status-btn ${statusClass}" onclick="toggleAppStatus(${app.id})">${app.status}</button></td>
                <td><button class="btn-danger" onclick="cancelAppointment(${app.id})">Cancel</button></td>
            </tr>`;
    });
}

function renderBeds() {
    const grid = document.getElementById('bed-grid-container');
    grid.innerHTML = '';
    beds.forEach(bed => {
        const isFree = bed.status === 'Available';
        const bedClass = isFree ? 'bed-free' : 'bed-occupied';
        const icon = isFree ? 'fa-bed' : 'fa-procedures';
        grid.innerHTML += `
            <div class="bed-box ${bedClass}" onclick="toggleBed(${bed.id})">
                <i class="fa-solid ${icon}"></i> Bed ${bed.id} <br> <small>${bed.status}</small>
            </div>`;
    });
}

function renderPatients() {
    const tbody = document.getElementById('patients-table-body');
    tbody.innerHTML = '';
    patients.forEach(pat => {
        const appointment = appointments.find(a => a.patient === pat.name);
        const status = appointment ? appointment.status : 'No Appointment';
        tbody.innerHTML += `
            <tr>
                <td>${pat.name}</td>
                <td>${pat.phone}</td>
                <td>${pat.gender}</td>
                <td>${status}</td>
                <td><button class="btn-danger" onclick="dischargePatient(${pat.id})">Discharge</button></td>
            </tr>`;
    });
}

function renderEmergencies() {
    const tbody = document.getElementById('emergency-table-body');
    tbody.innerHTML = '';
    emergencies.forEach(em => {
        tbody.innerHTML += `
            <tr>
                <td>${em.id}</td>
                <td>${em.time}</td>
                <td class="priority-high">CRITICAL</td>
                <td><button class="btn-submit" onclick="resolveEmergency(${em.id})">Resolve</button></td>
            </tr>`;
    });
}

function updateDashboard() {
    document.getElementById('total-doctors').innerText = doctors.length;
    document.getElementById('total-appointments').innerText = appointments.length;
    document.getElementById('total-emergencies').innerText = emergencies.length;
    const availableCount = beds.filter(b => b.status === 'Available').length;
    document.getElementById('beds-available-count').innerText = `${availableCount} / ${TOTAL_BED_COUNT}`;
}

function populateDoctorSelect() {
    const select = document.getElementById('doctor-select');
    select.innerHTML = '<option value="">Select Doctor</option>';
    doctors.forEach(doc => {
        const option = document.createElement('option');
        option.value = doc.name;
        option.innerText = doc.name + (doc.status === 'On Leave' ? ' (On Leave)' : '');
        select.appendChild(option);
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => sec.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    if(event) event.currentTarget.classList.add('active');
}

// --- Logic & Actions ---

// ADD DOCTOR (Updated with Image, Exp, Address)
document.getElementById('add-doctor-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Use random placeholder if no image URL provided
    let imgInput = document.getElementById('new-doc-img').value;
    const name = document.getElementById('new-doc-name').value;
    if(!imgInput) {
        imgInput = `https://ui-avatars.com/api/?name=${name}&background=random`;
    }

    doctors.push({
        id: Date.now(),
        name: name,
        specialization: document.getElementById('new-doc-spec').value,
        experience: document.getElementById('new-doc-exp').value,
        address: document.getElementById('new-doc-address').value,
        image: imgInput,
        shift: document.getElementById('new-doc-shift').value,
        break: document.getElementById('new-doc-break').value,
        status: "Available"
    });
    saveData();
    renderDoctors();
    this.reset();
});

// REMOVE DOCTOR
window.deleteDoctor = function(id) {
    if(confirm("Remove doctor?")) {
        doctors = doctors.filter(d => d.id !== id);
        saveData();
        renderDoctors();
    }
};

// TOGGLE DOCTOR STATUS
window.toggleDoctorStatus = function(id) {
    const doc = doctors.find(d => d.id === id);
    if (doc) {
        doc.status = doc.status === 'Available' ? 'On Leave' : 'Available';
        saveData();
        renderDoctors();
    }
};

// OTHER LOGIC (Unchanged)
document.getElementById('appointment-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('patient-name').value;
    
    appointments.push({
        id: Date.now(),
        patient: name,
        phone: document.getElementById('patient-phone').value,
        gender: document.getElementById('patient-gender').value,
        address: document.getElementById('patient-address').value,
        doctor: document.getElementById('doctor-select').value,
        date: document.getElementById('app-date').value,
        time: document.getElementById('app-time').value, 
        fees: document.getElementById('app-fees').value, 
        status: "Pending"
    });

    if (!patients.find(p => p.name === name)) {
        patients.push({
            id: Date.now() + 1,
            name: name,
            phone: document.getElementById('patient-phone').value,
            gender: document.getElementById('patient-gender').value
        });
    }

    saveData();
    renderAppointments();
    renderPatients();
    this.reset();
    alert('Appointment Booked Successfully!');
});

window.toggleBed = function(id) {
    const bed = beds.find(b => b.id === id);
    if(bed) {
        bed.status = bed.status === 'Available' ? 'Occupied' : 'Available';
        saveData();
        renderBeds();
    }
};

window.addEmergency = function() {
    const now = new Date().toLocaleTimeString();
    emergencies.push({ id: Date.now(), time: now, status: 'Critical' });
    alert("Emergency Alert Triggered!");
    saveData();
    renderEmergencies();
};

window.resolveEmergency = function(id) {
    if(confirm("Mark resolved?")) {
        emergencies = emergencies.filter(e => e.id !== id);
        saveData();
        renderEmergencies();
    }
};

window.toggleAppStatus = function(id) {
    const app = appointments.find(a => a.id === id);
    if (app) {
        app.status = app.status === 'Pending' ? 'Confirmed' : 'Pending';
        saveData();
        renderAppointments();
        renderPatients();
    }
};

window.cancelAppointment = function(id) {
    if(confirm("Cancel appointment?")) {
        appointments = appointments.filter(a => a.id !== id);
        saveData();
        renderAppointments();
        renderPatients();
    }
};

window.dischargePatient = function(id) {
    if(confirm("Discharge patient?")) {
        patients = patients.filter(p => p.id !== id);
        saveData();
        renderPatients();
    }
};