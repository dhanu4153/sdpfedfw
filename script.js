// Data stores (would ideally come from backend API)
const events = [
    { id: 1, name: "Club Meeting", date: "2025-11-10" },
    { id: 2, name: "Sports Day", date: "2025-11-15" },
    { id: 3, name: "Art Competition", date: "2025-11-20" }
];

const participationData = {};

// Utility to render upcoming events
function renderEvents() {
    const eventList = document.getElementById('event-list');
    eventList.innerHTML = '';
    events.forEach(event => {
        const div = document.createElement('div');
        div.textContent = `${event.name} - ${event.date}`;
        eventList.appendChild(div);
    });
}

// Render participation summary
function renderParticipation() {
    const container = document.getElementById('participation-summary');
    container.innerHTML = '';
    if (Object.keys(participationData).length === 0) {
        container.textContent = 'No participation data available.';
        return;
    }
    for (const [student, events] of Object.entries(participationData)) {
        const div = document.createElement('div');
        div.textContent = `${student}: Participated in ${events.length} event(s)`;
        container.appendChild(div);
    }
}

// Handle registration form submit
const registrationForm = document.getElementById('registration-form');
registrationForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const studentName = document.getElementById('studentName').value.trim();
    const selectedEvent = document.getElementById('eventSelect').value;
    if (!participationData[studentName]) {
        participationData[studentName] = [];
    }
    participationData[studentName].push(selectedEvent);
    document.getElementById('confirmation').textContent = `Thank you, ${studentName}, for registering for ${selectedEvent}.`;
    registrationForm.reset();
    renderParticipation();
});

// Initial render
renderEvents();
renderParticipation();
