// Get references to form elements
const loginForm = document.getElementById('login');
const loginMessage = document.getElementById('loginMessage');

// Function to handle login - now using only database authentication
loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Get email and password from form
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validate that both fields are filled
    if (!email || !password) {
        loginMessage.textContent = 'Please enter both email and password.';
        loginMessage.style.color = '#d9534f';
        return;
    }

    // Show loading message
    loginMessage.textContent = 'Authenticating...';
    loginMessage.style.color = '#007bff';

    try {
        // Send login request to backend API
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        // Parse the response
        const result = await response.json();

        if (result.success) {
            // Login successful - store user info and redirect
            localStorage.setItem('currentUser', JSON.stringify({
                employeeid: result.user.employeeid,
                name: result.user.name,
                email: result.user.email,
                isadmin: result.user.isadmin
            }));

            // Show success message
            loginMessage.textContent = `Login successful! Welcome ${result.user.name}. Redirecting...`;
            loginMessage.style.color = '#28a745';

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = result.redirect_url;
            }, 1000);

        } else {
            // Login failed - show error message
            loginMessage.textContent = result.message || 'Invalid email or password.';
            loginMessage.style.color = '#d9534f';
        }

    } catch (error) {
        // Handle network or server errors
        console.error('Login error:', error);
        loginMessage.textContent = 'Unable to connect to server. Please try again later.';
        loginMessage.style.color = '#d9534f';
    }
});

// Forgot Password Logic -----------------------------------------------------------------------------------
async function forgotPassword() {
    const email = document.getElementById('email').value.trim();

    if (!email) {
        alert("Please enter your email first.");
        return;
    }

    try {
        const response = await fetch("/api/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        alert(data.message);

    } catch (error) {
        console.error("Forgot password error:", error);
        alert("Unable to process request right now.");
    }
}
