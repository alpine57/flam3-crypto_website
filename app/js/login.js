// Function to toggle between Login and Signup forms
function openForm(formName) {
    const loginForm = document.getElementById('login');
    const signupForm = document.getElementById('signup');
    const tabLinks = document.querySelectorAll('.tab-link');

    if (formName === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    } else {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    }

    tabLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`button[onclick="openForm('${formName}')"]`).classList.add('active');
}

// Login function
function loginUser() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorMessage = document.getElementById('login-error-message');

    errorMessage.innerText = '';

    if (!username || !password) {
        errorMessage.innerText = 'Username and password are required.';
        return;
    }

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.token) {
                document.cookie = `token=${data.token}; path=/`;
                window.location.href = '/';
            } else {
                errorMessage.innerText = data.message || 'Login failed.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.innerText = 'An error occurred during login.';
        });
}

// Signup function
function signupUser() {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const errorMessage = document.getElementById('signup-error-message');

    errorMessage.innerText = '';

    if (!username || !email || !password) {
        errorMessage.innerText = 'All fields are required.';
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorMessage.innerText = 'Invalid email format.';
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.token) {
                document.cookie = `token=${data.token}; path=/`;
                window.location.href = '/';
            } else {
                errorMessage.innerText = data.message || 'Signup failed.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.innerText = 'An error occurred during signup.';
        });
}

