// Get references to form elements
const loginForm = document.getElementById('login');
const loginMessage = document.getElementById('loginMessage');

// test user (get rid for final)
const testUser = {
    email: 'test@example.com',
    password: '123'
};

// Function to handle login
loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        loginMessage.textContent = 'Please enter both email and password.';
        loginMessage.style.color = '#d9534f';
        return;
    }

    // test user (get rid for final)
    if (email === testUser.email && password === testUser.password) {
        loginMessage.textContent = 'Login successful! Redirecting...';
        loginMessage.style.color = '#28a745';
        setTimeout(() => {
            window.location.href = 'ownerView.html';
        }, 1000);
        return;
    }

    // Send login request to DB (using json)
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (result.success) {
            loginMessage.textContent = 'Login successful! Redirecting...';
            loginMessage.style.color = '#28a745';
            setTimeout(() => {
                window.location.href = 'employeeView.html';
            }, 1000);
        } else {
            loginMessage.textContent = result.message || 'Invalid email or password.';
            loginMessage.style.color = '#d9534f';
        }

    } catch (error) {                           
        console.error('Error:', error);
        loginMessage.textContent = 'Server error. Please try again later.';
        loginMessage.style.color = '#d9534f';
    } //will happen becausse no DB
});
