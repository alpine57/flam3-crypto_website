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

    tabLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`button[onclick="openForm('${formName}')"]`).classList.add('active');
}

// Handle Login form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Ensure both username and password are entered
    if (!username || !password) {
        document.getElementById('errorMessage').innerText = 'Username and password are required';
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
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            document.cookie = `token=${data.token}; path=/`;  // Set JWT token in cookies
            window.location.href = '/';  // Redirect to homepage
        } else {
            document.getElementById('errorMessage').innerText = data.message || 'Login failed';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('errorMessage').innerText = 'An error occurred during login.';
    });
});

// Handle Signup form submission
document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the default form submission

    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    // Ensure all fields are filled
    if (!username || !email || !password) {
        document.getElementById('errorMessage').innerText = 'All fields are required';
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
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            document.cookie = `token=${data.token}; path=/`;  // Set JWT token in cookies
            window.location.href = '/';  // Redirect to homepage after successful signup
        } else {
            document.getElementById('errorMessage').innerText = data.message || 'Signup failed';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('errorMessage').innerText = 'An error occurred during signup.';
    });
});

