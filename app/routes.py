from flask import Blueprint, jsonify, request, render_template, current_app, redirect, url_for
import bcrypt
import jwt
from functools import wraps
from datetime import datetime, timedelta
import psycopg2
import os

bp = Blueprint('main', __name__)

# Ensure DATABASE_URL is correctly loaded from environment variables
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://flame_crypto_user:96yoBV9vkxXQLJM8MjWOSNYHwGqkQYXw@dpg-csl7uejv2p9s73b4bjbg-a.oregon-postgres.render.com/flame_crypto')

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Ensure it is set in the environment variables.")

def get_db_connection():
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        raise RuntimeError(f"Database connection failed: {str(e)}")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token')  # Retrieve token from cookies

        if not token:
            return redirect(url_for('main.login_page'))  # Redirect if token is missing

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = data['username']
        except jwt.ExpiredSignatureError:
            return redirect(url_for('main.login_page'))  # Redirect if token is expired
        except jwt.InvalidTokenError:
            return redirect(url_for('main.login_page'))  # Redirect if token is invalid

        return f(current_user, *args, **kwargs)
    return decorated

@bp.route('/')
@token_required
def index(current_user):
    return render_template('index.html', username=current_user)

@bp.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        # Ensure request contains JSON data
        if not request.is_json:
            return jsonify({'message': 'Content-Type must be application/json and contain valid JSON'}), 415

        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        # Validate fields
        if not username or not password:
            return jsonify({'message': 'Username and password are required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if not user or not bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
            return jsonify({'message': 'Invalid credentials!'}), 401

        # Generate JWT token
        token = jwt.encode({
            'username': user[1],
            'exp': datetime.utcnow() + timedelta(hours=1)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        # Return JSON response with redirect URL and token
        response = jsonify({'redirect': 'index'})
        response.set_cookie('token', token)
        return response  # After successful login, it will return a redirect instruction

    # Render login page for GET request
    return render_template('login.html')

@bp.route('/login_page')
def login_page():
    return render_template('login_signup.html')

@bp.route('/register', methods=['POST'])
def register():
    # Ensure request contains JSON data
    if not request.is_json:
        return jsonify({'message': 'Content-Type must be application/json and contain valid JSON'}), 415

    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Validate fields
    if not username or not email or not password:
        return jsonify({'message': 'Username, email, and password are required'}), 400

    # Check if username already exists
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cur.fetchone()

    if user:
        cur.close()
        conn.close()
        return jsonify({'message': 'Username already exists!'}), 400

    # Hash password and store user in database
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cur.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                (username, email, hashed_password))
    conn.commit()
    cur.close()
    conn.close()

    # Generate JWT token for new user
    token = jwt.encode({
        'username': username,
        'exp': datetime.utcnow() + timedelta(hours=1)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")

    # Return JSON response with redirect URL and token
    response = jsonify({"redirect": "index"})
    response.set_cookie('token', token)
    return response  # After successful registration, it will return a redirect instruction

@bp.route('/protected', methods=['GET'])
@token_required
def protected_route(current_user):
    return jsonify({'message': f'Hello, {current_user}!', 'logged_in_as': current_user})

