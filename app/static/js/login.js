// Function to toggle between Login and Signup forms
function openForm(formName) {
    const loginForm = document.getElementById('login');
    const signupForm = document.getElementById('signup');
    const tabLinks = document.querySelectorAll('.tab-link');
    
    if (!loginForm || !signupForm) {
        console.error('Login or signup form elements not found');
        return;
    }

    if (formName === 'login') {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    } else if (formName === 'signup') {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
    }
    
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
    
    errorMessage.innerText = '';

    if (!username || !password) {
        errorMessage.innerText = 'Username and password are required.';
        return;
    }

    // Show some loading state
    const loginButton = document.querySelector('#login button[type="button"]');
    if (loginButton) {
        loginButton.disabled = true;
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
    })
    .finally(() => {
        if (loginButton) {
            loginButton.disabled = false;
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

    errorMessage.innerText = '';

    if (!username || !email || !password) {
        errorMessage.innerText = 'All fields are required.';
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errorMessage.innerText = 'Invalid email format.';
        return;
    }

    // Show some loading state
    const signupButton = document.querySelector('#signup button[type="button"]');
    if (signupButton) {
        signupButton.disabled = true;
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
    })
    .finally(() => {
        if (signupButton) {
            signupButton.disabled = false;
        }
    });
}

