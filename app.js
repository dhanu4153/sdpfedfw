document.addEventListener('DOMContentLoaded', () => {
    // --- DATA ---
    // Helper functions to get/set data from localStorage
    const getActivities = () => JSON.parse(localStorage.getItem('activities')) || [];
    const saveActivities = (activities) => localStorage.setItem('activities', JSON.stringify(activities));
    const getRegistrations = () => JSON.parse(localStorage.getItem('registrations')) || [];
    const saveRegistrations = (registrations) => localStorage.setItem('registrations', JSON.stringify(registrations));
    const getUsers = () => JSON.parse(localStorage.getItem('users')) || [];

    // --- AUTHENTICATION ---
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // If no user is logged in, redirect to login page
        window.location.href = 'index.html';
        return;
    }

    // Set user name in nav
    // Set profile icon initial
    document.getElementById('profile-icon').setAttribute('data-initial', currentUser.username.charAt(0).toUpperCase()); 

    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });

    // --- VIEW RENDERING ---
    const adminView = document.getElementById('admin-view');
    const studentView = document.getElementById('student-view');

    if (currentUser.role === 'admin') {
        adminView.classList.remove('hidden');
        renderAdminDashboard();
        setupNavigation('admin-view'); // Setup sidebar nav
    } else {
        studentView.classList.remove('hidden');
        renderStudentDashboard();
        setupNavigation('student-view'); // Setup sidebar nav
    }

    // --- HELPER FUNCTIONS FOR STATS ---
    function calculateAdminStats() {
        const activities = getActivities();
        const users = getUsers();
        const registrations = getRegistrations();
        
        const totalActivities = activities.length;
        const totalStudents = users.filter(u => u.role === 'student').length;
        
        // Count unique students who have registered for at least one activity
        const activeStudentIds = new Set(registrations.map(r => r.userId));
        const activeStudents = activeStudentIds.size;

        const participationRate = totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(0) : 0;

        // Upcoming events (e.g., next 30 days)
        const now = new Date();
        const thirtyDaysLater = new Date();
        thirtyDaysLater.setDate(now.getDate() + 30);

        const upcomingEvents = activities.filter(activity => {
            if (!activity.date) return false;
            const eventDate = new Date(activity.date);
            return eventDate > now && eventDate <= thirtyDaysLater;
        }).length;

        return {
            totalActivities,
            totalStudents,
            participationRate: `${participationRate}%`,
            upcomingEvents
        };
    }

    function calculateStudentStats() {
        const activities = getActivities();
        const registrations = getRegistrations();
        
        const myRegistrations = registrations.filter(r => r.userId === currentUser.id);
        const myRegisteredActivitiesCount = myRegistrations.length;

        const now = new Date();
        const myUpcomingActivities = myRegistrations.filter(r => {
            const activity = activities.find(a => a.id === r.activityId);
            if (!activity || !activity.date) return false;
            const eventDate = new Date(activity.date);
            return eventDate > now;
        }).length;

        // Simple points: 10 points per registered activity (can be expanded)
        const totalPoints = myRegisteredActivitiesCount * 10;

        const totalAvailableActivities = activities.length;
        const myParticipationRate = totalAvailableActivities > 0 ? 
            ((myRegisteredActivitiesCount / totalAvailableActivities) * 100).toFixed(0) : 0;

        return {
            myRegisteredActivitiesCount,
            myUpcomingActivities,
            myParticipationRate: `${myParticipationRate}%`,
            totalPoints
        };
    }

    function renderDashboardStats(stats, targetElementId) {
        const statsContainer = document.getElementById(targetElementId);
        statsContainer.innerHTML = ''; // Clear existing

        const statItems = [];
        if (currentUser.role === 'admin') {
            statItems.push(
                { label: 'Total Activities', value: stats.totalActivities, class: 'neutral' },
                { label: 'Total Students', value: stats.totalStudents, class: 'neutral' },
                { label: 'Participation Rate', value: stats.participationRate, class: 'positive' },
                { label: 'Upcoming Events', value: stats.upcomingEvents, class: 'info' }
            );
        } else { // Student
            statItems.push(
                { label: 'My Registered', value: stats.myRegisteredActivitiesCount, class: 'neutral' },
                { label: 'Upcoming Activities', value: stats.myUpcomingActivities, class: 'info' },
                { label: 'My Participation', value: stats.myParticipationRate, class: 'positive' },
                { label: 'Total Points', value: stats.totalPoints, class: 'neutral' }
            );
        }

        statItems.forEach(item => {
            statsContainer.innerHTML += `
                <div class="stat-card ${item.class}">
                    <div class="value">${item.value}</div>
                    <div class="label">${item.label}</div>
                </div>
            `;
        });
    }

    // --- ADMIN FUNCTIONS ---
    function renderAdminDashboard() {
        // Render stats
        const adminStats = calculateAdminStats();
        renderDashboardStats(adminStats, 'admin-stats');

        // Handle new activity creation
        const createForm = document.getElementById('create-activity-form');
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const activities = getActivities();
            const newActivity = {
                id: 'a' + (Date.now()), // More unique ID
                name: document.getElementById('activity-name').value,
                description: document.getElementById('activity-desc').value,
                date: document.getElementById('activity-date').value,
                imageUrl: document.getElementById('activity-image-url').value || 'https://picsum.photos/400/200?random=' + Date.now() // Default placeholder
            };
            
            activities.push(newActivity);
            saveActivities(activities);
            
            createForm.reset();
            renderAdminActivityList(); // Refresh the list
            renderDashboardStats(calculateAdminStats(), 'admin-stats'); // Refresh stats
            alert('Activity created successfully!');
        });
        
        renderAdminActivityList();
    }

    function renderAdminActivityList() {
        const listElement = document.getElementById('admin-activity-list');
        const activities = getActivities();
        const registrations = getRegistrations();
        const users = getUsers();
        
        listElement.innerHTML = ''; // Clear existing list

        if (activities.length === 0) {
            listElement.innerHTML = '<p>No activities created yet.</p>';
        }

        activities.forEach(activity => {
            // Find participants for this activity
            const participants = registrations
                .filter(r => r.activityId === activity.id)
                .map(r => {
                    const user = users.find(u => u.id === r.userId);
                    return user ? user.username : 'Unknown';
                });

            listElement.innerHTML += `
                <div class="card">
                    ${activity.imageUrl ? `<img src="${activity.imageUrl}" alt="${activity.name}" class="card-image">` : ''}
                    <div class="card-content">
                        <h3>${activity.name}</h3>
                        <p>${activity.description}</p>
                        <h4>Participation (${participants.length})</h4>
                        <ul class="participation-list">
                            ${participants.length > 0 ? participants.map(p => `<li>${p}</li>`).join('') : '<li>No participants yet.</li>'}
                        </ul>
                        <div class="card-footer">
                            <span class="card-date">Date: ${activity.date ? new Date(activity.date).toLocaleString() : 'N/A'}</span>
                            <button class="btn btn-danger" data-id="${activity.id}">Delete Activity</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        // Add event listeners for delete buttons
        listElement.querySelectorAll('.btn-danger').forEach(button => {
            button.addEventListener('click', (e) => {
                const activityId = e.target.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this activity? This will also remove all registrations for it.')) {
                    deleteActivity(activityId);
                }
            });
        });
    }

    function deleteActivity(activityId) {
        let activities = getActivities();
        let registrations = getRegistrations();
        
        // Filter out the activity and its registrations
        activities = activities.filter(a => a.id !== activityId);
        registrations = registrations.filter(r => r.activityId !== activityId);
        
        saveActivities(activities);
        saveRegistrations(registrations);
        renderAdminActivityList(); // Refresh view
        renderDashboardStats(calculateAdminStats(), 'admin-stats'); // Refresh stats
    }


    // --- STUDENT FUNCTIONS ---
    function renderStudentDashboard() {
        // Render stats
        const studentStats = calculateStudentStats();
        renderDashboardStats(studentStats, 'student-stats');
        
        renderStudentActivityLists();
    }

    function renderStudentActivityLists() {
        const allActivitiesList = document.getElementById('all-activities-list');
        const myActivitiesList = document.getElementById('my-activities-list');
        
        const allActivities = getActivities();
        const myRegistrations = getRegistrations().filter(r => r.userId === currentUser.id);
        const myActivityIds = myRegistrations.map(r => r.activityId);

        allActivitiesList.innerHTML = '';
        myActivitiesList.innerHTML = '';

        if (allActivities.length === 0) {
            allActivitiesList.innerHTML = '<p>No activities available right now. Check back later!</p>';
        }

        allActivities.forEach(activity => {
            const isRegistered = myActivityIds.includes(activity.id);
            
            const cardHTML = `
                <div class="card">
                    ${activity.imageUrl ? `<img src="${activity.imageUrl}" alt="${activity.name}" class="card-image">` : ''}
                    <div class="card-content">
                        <h3>${activity.name}</h3>
                        <p>${activity.description}</p>
                        <div class="card-footer">
                            <span class="card-date">${activity.date ? new Date(activity.date).toLocaleString() : 'Ongoing'}</span>
                            <button class="btn ${isRegistered ? 'btn-danger' : 'btn-primary'}" 
                                    data-id="${activity.id}" 
                                    ${isRegistered ? 'data-action="unregister"' : 'data-action="register"'}>
                                ${isRegistered ? 'Unregister' : 'Register'}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            if (isRegistered) {
                myActivitiesList.innerHTML += cardHTML;
            }
            allActivitiesList.innerHTML += cardHTML;
        });

        if (myActivitiesList.innerHTML === '') {
            myActivitiesList.innerHTML = '<p>You are not registered for any activities. Explore the available activities below!</p>';
        }
        
        // Add event listeners for register/unregister buttons
        allActivitiesList.querySelectorAll('.btn').forEach(addRegistrationHandler);
        myActivitiesList.querySelectorAll('.btn').forEach(addRegistrationHandler);
    }
    
    function addRegistrationHandler(button) {
         button.addEventListener('click', (e) => {
            const activityId = e.target.getAttribute('data-id');
            const action = e.target.getAttribute('data-action');
            let registrations = getRegistrations();

            if (action === 'register') {
                registrations.push({ userId: currentUser.id, activityId: activityId });
            } else { // unregister
                registrations = registrations.filter(r => !(r.userId === currentUser.id && r.activityId === activityId));
            }
            
            saveRegistrations(registrations);
            // Refresh everything
            renderStudentActivityLists();
            renderDashboardStats(calculateStudentStats(), 'student-stats');
        });
    }

    // --- NEW: SIDEBAR NAVIGATION LOGIC ---
    function setupNavigation(viewId) {
        const view = document.getElementById(viewId);
        const navLinks = view.querySelectorAll('.nav-link');
        const sections = view.querySelectorAll('.dashboard-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Get target section ID from 'data-target' attribute
                const targetId = link.getAttribute('data-target');
                
                // Update active link
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                link.classList.add('active');
                
                // Show/hide sections
                sections.forEach(section => {
                    if (section.id === targetId) {
                        section.classList.remove('hidden');
                    } else {
                        section.classList.add('hidden');
                    }
                });
            });
        });
    }

});