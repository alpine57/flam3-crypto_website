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

    // Clear error messages
    document.querySelectorAll('.error-message').forEach(msg => (msg.innerText = ''));
}

function loginUser() {
    const username = document.getElementById('login-username')?.value.trim();
    const password = document.getElementById('login-password')?.value.trim();
    const errorMessage = document.getElementById('login-error-message');

    if (!username || !password) {
        errorMessage.innerText = 'Both username and password are required.';
        return;
    }

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
        .then(response => {
            if (!response.ok) throw response;
            return response.json();
        })
        .then(data => {
            if (data.redirect) {
                window.location.href = data.redirect;
            }
        })
        .catch(async error => {
            const errorText = await error.json().then(err => err.message || 'An error occurred');
            errorMessage.innerText = errorText;
        });
}

function signupUser() {
    const username = document.getElementById('signup-username')?.value.trim();
    const email = document.getElementById('signup-email')?.value.trim();
    const password = document.getElementById('signup-password')?.value.trim();
    const errorMessage = document.getElementById('signup-error-message');

    if (!username || !email || !password) {
        errorMessage.innerText = 'All fields are required: Username, Email, and Password.';
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
    })
        .then(response => {
            if (!response.ok) throw response;
            return response.json();
        })
        .then(data => {
            if (data.redirect) {
                window.location.href = data.redirect;
            }
        })
        .catch(async error => {
            const errorText = await error.json().then(err => err.message || 'An error occurred');
            errorMessage.innerText = errorText;
        });
}

