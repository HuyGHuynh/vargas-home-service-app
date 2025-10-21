// Get references to form elements
const loginForm = document.getElementById('login');
const loginMessage = document.getElementById('loginMessage');

// Sample accounts for testing
const sampleAccounts = [
    {
        email: 'admin@vargas',
        password: 'admin',
        role: 'admin',
        redirectTo: '/owner',
        name: 'Admin User'
    },
    {
        email: 'employee@vargas',
        password: 'employee',
        role: 'employee',
        redirectTo: '/employee/view',
        name: 'Employee User'
    }
];

// Function to handle login
loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        loginMessage.textContent = 'Please enter both email and password.';
        loginMessage.style.color = '#d9534f';
        return;
    }

    // Check sample accounts
    const account = sampleAccounts.find(acc => acc.email === email && acc.password === password);

    if (account) {
        // Store user session info in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            email: account.email,
            role: account.role,
            name: account.name
        }));

        loginMessage.textContent = `Login successful! Welcome ${account.name}. Redirecting...`;
        loginMessage.style.color = '#28a745';
        setTimeout(() => {
            window.location.href = account.redirectTo;
        }, 1000);
        return;
    }

    // If no sample account match, try backend API
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
                window.location.href = '/employee/view';
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
