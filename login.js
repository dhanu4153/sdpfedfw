document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Mock Data if it doesn't exist
    function initializeData() {
        if (!localStorage.getItem('users')) {
            const mockUsers = [
                { id: 'admin', username: 'admin', password: '123', role: 'admin' },
                { id: 's1', username: 'student1', password: '123', role: 'student' },
                { id: 's2', username: 'student2', password: '123', role: 'student' }
            ];
            localStorage.setItem('users', JSON.stringify(mockUsers));
        }

        if (!localStorage.getItem('activities')) {
            const mockActivities = [
                { 
                    id: 'a1', 
                    name: 'Chess Club', 
                    description: 'Weekly chess meetings to challenge your mind and strategic skills. All levels welcome!', 
                    date: '', 
                    imageUrl: 'https://picsum.photos/id/11/400/200' // Placeholder image
                },
                { 
                    id: 'a2', 
                    name: 'Art Workshop', 
                    description: 'Explore various art forms, from painting to sculpture. Unleash your creativity!', 
                    date: '2025-11-20T14:00', 
                    imageUrl: 'https://picsum.photos/id/28/400/200' // Placeholder image
                },
                { 
                    id: 'a3', 
                    name: 'Basketball Tryouts', 
                    description: 'Show your skills and try out for the university basketball team. Bring your A-game!', 
                    date: '2025-11-22T17:00', 
                    imageUrl: 'https://picsum.photos/id/173/400/200' // Placeholder image
                },
                { 
                    id: 'a4', 
                    name: 'Robotics Challenge', 
                    description: 'Design, build, and program your own robots for exciting challenges!', 
                    date: '2025-12-05T10:00', 
                    imageUrl: 'https://picsum.photos/id/83/400/200' // Placeholder image
                },
                 { 
                    id: 'a5', 
                    name: 'Debate Society', 
                    description: 'Join the weekly debates and sharpen your public speaking and critical thinking skills.', 
                    date: '2025-11-28T18:30', 
                    imageUrl: 'https://picsum.photos/id/40/400/200' // Placeholder image
                }
            ];
            localStorage.setItem('activities', JSON.stringify(mockActivities));
        }

        if (!localStorage.getItem('registrations')) {
            const mockRegistrations = [
                { userId: 's1', activityId: 'a1' },
                { userId: 's1', activityId: 'a3' },
                { userId: 's2', activityId: 'a2' },
                { userId: 's2', activityId: 'a1' }
            ];
            localStorage.setItem('registrations', JSON.stringify(mockRegistrations));
        }
    }

    // 2. Handle Login
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            // Find the user
            const user = users.find(u => u.username === username && u.password === password);
            
            if (user) {
                // Store current user in session (or local) storage
                localStorage.setItem('currentUser', JSON.stringify(user));
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                loginError.textContent = 'Invalid username or password.';
            }
        });
    }

    // Run initialization
    initializeData();
});