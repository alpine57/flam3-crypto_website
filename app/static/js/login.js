// Function to toggle between Login and Signup forms
function openForm(formName) {
    const loginForm = document.getElementById('login');
    const signupForm = document.getElementById('signup');
    const tabLinks = document.querySelectorAll('.tab-link');

    if (!loginForm || !signupForm) {
        console.error('Login or signup form elements not found');
        return;
    }

    // Toggle active forms
    if (formName === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    } else if (formName === 'signup') {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    }

    // Highlight active tab
    tabLinks.forEach(link => link.classList.remove('active'));
    const activeTab = document.querySelector(`.tab-link[onclick="openForm('${formName}')"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
}

// Login function
function loginUser() {
    const username = document.getElementById('login-username')?.value.trim();
    const password = document.getElementById('login-password')?.value.trim();
    const errorMessage = document.getElementById('login-error-message');

    if (!errorMessage) {
        console.error('Error message element not found');
        return;
    }

    // Clear previous errors
    errorMessage.innerText = '';

    // Validate input fields
    if (!username || !password) {
        errorMessage.innerText = 'Both username and password are required.';
        return;
    }

    // Show loading state
    const loginButton = document.querySelector('#login button[type="button"]');
    if (loginButton) {
        loginButton.disabled = true;
        loginButton.innerText = 'Logging in...';
    }

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid username or password.');
            }
            throw new Error(`Unexpected error occurred (Status: ${response.status})`);
        }
        return response.json();
    })
    .then(data => {
        if (data.token) {
            document.cookie = `token=${data.token}; path=/; secure`;
            window.location.href = '/';
        } else {
            errorMessage.innerText = data.message || 'Unexpected login error.';
        }
    })
    .catch(error => {
        console.error('Login Error:', error);
        errorMessage.innerText = error.message || 'An error occurred during login.';
    })
    .finally(() => {
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.innerText = 'Login';
        }
    });
}

// Signup function
function signupUser() {
    const username = document.getElementById('signup-username')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim();
    const password = document.getElementById('signup-password')?.value.trim();
    const errorMessage = document.getElementById('signup-error-message');

    if (!errorMessage) {
        console.error('Error message element not found');
        return;
    }

    // Clear previous errors
    errorMessage.innerText = '';

    // Validate input fields
    if (!username || !email || !password) {
        errorMessage.innerText = 'All fields are required: Username, Email, and Password.';
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorMessage.innerText = 'Please enter a valid email address.';
        return;
    }

    // Show loading state
    const signupButton = document.querySelector('#signup button[type="button"]');
    if (signupButton) {
        signupButton.disabled = true;
        signupButton.innerText = 'Signing up...';
    }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password }),
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 400) {
                throw new Error('Username already exists or invalid input.');
            }
            throw new Error(`Unexpected error occurred (Status: ${response.status})`);
        }
        return response.json();
    })
    .then(data => {
        if (data.token) {
            document.cookie = `token=${data.token}; path=/; secure`;
            window.location.href = '/';
        } else {
            errorMessage.innerText = data.message || 'Unexpected signup error.';
        }
    })
    .catch(error => {
        console.error('Signup Error:', error);
        errorMessage.innerText = error.message || 'An error occurred during signup.';
    })
    .finally(() => {
        if (signupButton) {
            signupButton.disabled = false;
            signupButton.innerText = 'Sign Up';
        }
    });
}

