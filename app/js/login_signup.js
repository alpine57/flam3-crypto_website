function openForm(formName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("form-container");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(formName).classList.add("active");
    document.querySelector(`[onclick="openForm('${formName}')"]`).classList.add("active");
}

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

    // Update active tab link
    tabLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`button[onclick="openForm('${formName}')"]`).classList.add('active');
}

// Function to handle Login submission
function loginUser() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorMessage = document.querySelector('#login .error-message');

    // Ensure both username and password are entered
    if (!username || !password) {
        errorMessage.innerText = 'Username and password are required';
        return;
    }

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                document.cookie = `token=${data.token}; path=/`; // Set JWT token in cookies
                window.location.href = '/'; // Redirect to homepage
            } else {
                errorMessage.innerText = data.message || 'Login failed';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.innerText = 'An error occurred during login.';
        });
}

// Function to handle Signup submission
function signupUser() {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const errorMessage = document.querySelector('#signup .error-message');

    // Ensure all fields are filled
    if (!username || !email || !password) {
        errorMessage.innerText = 'All fields are required';
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                document.cookie = `token=${data.token}; path=/`; // Set JWT token in cookies
                window.location.href = '/'; // Redirect to homepage
            } else {
                errorMessage.innerText = data.message || 'Signup failed';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.innerText = 'An error occurred during signup.';
        });
}

