from flask import Blueprint, jsonify, request, render_template, current_app, redirect, url_for, make_response
import bcrypt
import jwt
from functools import wraps
from datetime import datetime, timedelta
import psycopg2
import os
from flask import Flask

app = Flask(__name__, static_folder='static', template_folder='templates')

# Define the blueprint as 'routes'
routes = Blueprint('routes', __name__)

# Ensure DATABASE_URL is correctly loaded from environment variables
DATABASE_URL = os.getenv('DATABASE_URL',"postgresql://default:zyqGFZc0HWt2@ep-still-band-a4xu3rci.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require" )

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
            return redirect(url_for('routes.login'))  # Redirect if token is missing

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = data['username']
        except jwt.ExpiredSignatureError:
            return redirect(url_for('routes.login'))  # Redirect if token is expired
        except jwt.InvalidTokenError:
            return redirect(url_for('routes.login'))  # Redirect if token is invalid

        return f(current_user, *args, **kwargs)
    return decorated

# Example route
@routes.route('/index')
@token_required
def index(current_user):
    return render_template('index.html', username=current_user)

# Home route
@routes.route('/')
def home():
    return redirect(url_for('routes.login'))  # Corrected to use the 'login' route

# Login route
@routes.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'Content-Type must be application/json and contain valid JSON'}), 415

        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'status': 'error', 'message': 'Username and password are required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if not user or not bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):  # Assuming password is in the 4th column
            return jsonify({'status': 'error', 'message': 'Invalid credentials!'}), 401

        token = jwt.encode({
            'username': user[1],
            'exp': datetime.utcnow() + timedelta(hours=1)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        response = jsonify({'status': 'success', 'redirect': url_for('routes.index')})
        response.set_cookie('token', token, httponly=True, secure=True, samesite='Lax')
        return response

    return render_template('login_signup.html')

# Register route
@routes.route('/register', methods=['POST'])
def register():
    if not request.is_json:
        return jsonify({'status': 'error', 'message': 'Content-Type must be application/json and contain valid JSON'}), 415

    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'status': 'error', 'message': 'Username, email, and password are required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cur.fetchone()

    if user:
        cur.close()
        conn.close()
        return jsonify({'status': 'error', 'message': 'Username already exists!'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cur.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", (username, email, hashed_password))
    conn.commit()
    cur.close()
    conn.close()

    token = jwt.encode({
        'username': username,
        'exp': datetime.utcnow() + timedelta(hours=1)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")

    response = jsonify({"status": "success", "redirect": url_for('routes.index')})
    response.set_cookie('token', token, httponly=True, secure=True, samesite='Lax')
    return response




@routes.route('/api/bot/futures/config', methods=['POST'])
@token_required
def configure_futures_bot(current_user):
    """Handles Futures bot configuration and saves it to the database."""
    data = request.json
    bot_type = "futures"
    exchange = data.get("exchange")
    api_key = data.get("apiKey")
    api_secret = data.get("apiSecret")
    trade_amount = data.get("tradeAmount")
    trade_pair = data.get("tradePair")
    time_frame = data.get("timeFrame")
    leverage = data.get("leverage")

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if a Futures bot configuration exists for the user
    cur.execute("""
        SELECT id FROM futures_bot_configurations
        WHERE user_id = (SELECT id FROM users WHERE username = %s) AND bot_type = %s AND exchange = %s
    """, (current_user, bot_type, exchange))
    bot_config = cur.fetchone()

    if bot_config:
        # Update existing Futures bot configuration
        cur.execute("""
            UPDATE futures_bot_configurations
            SET api_key = %s, api_secret = %s, trade_amount = %s, trade_pair = %s, 
                time_frame = %s, leverage = %s, updated_at = NOW()
            WHERE id = %s
        """, (api_key, api_secret, trade_amount, trade_pair, time_frame, leverage, bot_config[0]))
    else:
        # Insert a new Futures bot configuration
        cur.execute("""
            INSERT INTO futures_bot_configurations 
            (user_id, bot_type, exchange, api_key, api_secret, trade_amount, trade_pair, time_frame, leverage)
            VALUES (
                (SELECT id FROM users WHERE username = %s), %s, %s, %s, %s, %s, %s, %s, %s
            )
        """, (current_user, bot_type, exchange, api_key, api_secret, trade_amount, trade_pair, time_frame, leverage))

    conn.commit()
    return jsonify({"success": True, "message": "Futures bot configuration saved successfully!"})

@routes.route('/api/bot/spot/config', methods=['POST'])
@token_required
def configure_spot_bot(current_user):
    """Handles Spot bot configuration and saves it to the database."""
    data = request.json
    bot_type = "spot"
    exchange = data.get("exchange")
    api_key = data.get("apiKey")
    api_secret = data.get("apiSecret")
    trade_amount = data.get("tradeAmount")
    trade_pair = data.get("tradePair")
    time_frame = data.get("timeFrame")

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if a Spot bot configuration exists for the user
    cur.execute("""
        SELECT id FROM spot_bot_configurations
        WHERE user_id = (SELECT id FROM users WHERE username = %s) AND bot_type = %s AND exchange = %s
    """, (current_user, bot_type, exchange))
    bot_config = cur.fetchone()

    if bot_config:
        # Update existing Spot bot configuration
        cur.execute("""
            UPDATE spot_bot_configurations
            SET api_key = %s, api_secret = %s, trade_amount = %s, trade_pair = %s, 
                time_frame = %s, updated_at = NOW()
            WHERE id = %s
        """, (api_key, api_secret, trade_amount, trade_pair, time_frame, bot_config[0]))
    else:
        # Insert a new Spot bot configuration
        cur.execute("""
            INSERT INTO spot_bot_configurations 
            (user_id, bot_type, exchange, api_key, api_secret, trade_amount, trade_pair, time_frame)
            VALUES (
                (SELECT id FROM users WHERE username = %s), %s, %s, %s, %s, %s, %s, %s
            )
        """, (current_user, bot_type, exchange, api_key, api_secret, trade_amount, trade_pair, time_frame))

    conn.commit()
    return jsonify({"success": True, "message": "Spot bot configuration saved successfully!"})

