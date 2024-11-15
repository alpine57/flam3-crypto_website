from flask import Blueprint, render_template, request, redirect, url_for, current_app, jsonify
import bcrypt
import jwt
from datetime import datetime, timedelta
import psycopg2
from functools import wraps

bp = Blueprint('main', __name__)

# Database connection
def get_db_connection():
    try:
        conn = psycopg2.connect(
            'postgresql://flame_crypto_user:96yoBV9vkxXQLJM8MjWOSNYHwGqkQYXw@dpg-csl7uejv2p9s73b4bjbg-a.oregon-postgres.render.com/flame_crypto'
        )
        return conn
    except Exception as e:
        print("Database connection error:", e)
        return None

# Utility: Login Required Decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.cookies.get('token')
        if not token:
            return redirect(url_for('main.login'))  # Redirect to login if no token
        try:
            # Verify the JWT token
            jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return redirect(url_for('main.login'))  # Redirect if token is expired
        except jwt.InvalidTokenError:
            return redirect(url_for('main.login'))  # Redirect if token is invalid
        return f(*args, **kwargs)
    return decorated_function

# Route: Login Page
@bp.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        data = request.form
        username = data['username']
        password = data['password']

        conn = get_db_connection()
        if conn is None:
            return "Database connection failed", 500

        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if not user or not bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
            return render_template('login.html', message='Invalid credentials!')

        # Generate JWT token
        token = jwt.encode({
            'username': user[1],
            'exp': datetime.utcnow() + timedelta(hours=1)  # Token valid for 1 hour
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        response = redirect(url_for('main.index'))
        response.set_cookie('token', token, httponly=True, secure=True)  # Secure cookie
        return response

    return render_template('login.html')

# Route: Register Page
@bp.route('/register', methods=['POST', 'GET'])
def register():
    if request.method == 'POST':
        data = request.form
        username = data['username']
        email = data['email']
        password = data['password']

        conn = get_db_connection()
        if conn is None:
            return "Database connection failed", 500

        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()

        if user:
            return render_template('register.html', message='Username already exists!')

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cur.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                    (username, email, hashed_password))
        conn.commit()
        cur.close()
        conn.close()

        # Automatically log in the user by generating a token
        token = jwt.encode({
            'username': username,
            'exp': datetime.utcnow() + timedelta(hours=1)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        response = redirect(url_for('main.index'))
        response.set_cookie('token', token, httponly=True, secure=True)  # Secure cookie
        return response

    return render_template('register.html')

# Route: Logout
@bp.route('/logout')
def logout():
    response = redirect(url_for('main.login'))
    response.set_cookie('token', '', expires=0)  # Clear the token cookie
    return response

# Route: Index Page (Protected)
@bp.route('/')
@login_required
def index():
    return render_template('index.html')

