from flask import Blueprint, jsonify, request, render_template, current_app, redirect, url_for, make_response
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

@bp.route('/index')
@token_required
def index(current_user):
    return render_template('index.html', username=current_user)

@bp.route('/')
def home():
    # Redirect to login_page or render an appropriate template
    return redirect(url_for('main.login_page'))

@bp.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        # Ensure request contains JSON data
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'Content-Type must be application/json and contain valid JSON'}), 415

        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        # Validate fields
        if not username or not password:
            return jsonify({'status': 'error', 'message': 'Username and password are required'}), 400

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if not user or not bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
            return jsonify({'status': 'error', 'message': 'Invalid credentials!'}), 401

        # Generate JWT token
        token = jwt.encode({
            'username': user[1],
            'exp': datetime.utcnow() + timedelta(hours=1)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        # Return JSON response with redirect URL
        response = jsonify({'status': 'success', 'redirect': url_for('main.index')})
        response.set_cookie('token', token, httponly=True, secure=True, samesite='Lax')
        return response

    # Render login page for GET request
    return render_template('login.html')

@bp.route('/login_page')
def login_page():
    return render_template('login_signup.html')

@bp.route('/register', methods=['POST'])
def register():
    # Ensure request contains JSON data
    if not request.is_json:
        return jsonify({'status': 'error', 'message': 'Content-Type must be application/json and contain valid JSON'}), 415

    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Validate fields
    if not username or not email or not password:
        return jsonify({'status': 'error', 'message': 'Username, email, and password are required'}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if username already exists
    cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cur.fetchone()

    if user:
        cur.close()
        conn.close()
        return jsonify({'status': 'error', 'message': 'Username already exists!'}), 400

    # Hash password and store user in database
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cur.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", (username, email, hashed_password))
    conn.commit()
    cur.close()
    conn.close()

    # Generate JWT token for new user
    token = jwt.encode({
        'username': username,
        'exp': datetime.utcnow() + timedelta(hours=1)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")

    # Return JSON response with redirect URL
    response = jsonify({"status": "success", "redirect": url_for('main.index')})
    response.set_cookie('token', token, httponly=True, secure=True, samesite='Lax')
    return response

@routes.route('/api/bot/spot/toggle', methods=['POST'])
@token_required
def toggle_spot_bot(current_user):
    """Toggles the Spot bot and saves its configuration in the database."""
    data = request.json
    bot_status = data.get("status")
    bot_type = "spot"
    api_key = data.get("api_key")
    api_secret = data.get("api_secret")
    trade_amount = data.get("trade_amount")
    trade_pair = data.get("trade_pair")
    time_frame = data.get("time_frame")
    exchange = data.get("exchange")

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if a bot configuration already exists for this user and bot type
    cur.execute("""
        SELECT id FROM bot_configurations 
        WHERE user_id = (SELECT id FROM users WHERE username = %s) AND bot_type = %s AND exchange = %s
    """, (current_user, bot_type, exchange))
    bot_config = cur.fetchone()

    if bot_status:  # Start the bot
        if bot_config:
            # Update existing bot configuration
            cur.execute("""
                UPDATE bot_configurations
                SET status = TRUE, api_key = %s, api_secret = %s, trade_amount = %s, 
                    trade_pair = %s, time_frame = %s, updated_at = NOW()
                WHERE id = %s
            """, (api_key, api_secret, trade_amount, trade_pair, time_frame, bot_config[0]))
        else:
            # Insert a new bot configuration
            cur.execute("""
                INSERT INTO bot_configurations 
                (user_id, bot_type, exchange, status, api_key, api_secret, trade_amount, trade_pair, time_frame)
                VALUES (
                    (SELECT id FROM users WHERE username = %s), %s, %s, TRUE, %s, %s, %s, %s, %s
                )
            """, (current_user, bot_type, exchange, api_key, api_secret, trade_amount, trade_pair, time_frame))

        # Start the bot for the specified exchange
        if exchange == "binance":
            active_bots["binance_spot"] = start_binance_spot_bot(api_key, api_secret, trade_amount, trade_pair, time_frame)
        elif exchange == "bybit":
            active_bots["bybit_spot"] = start_bybit_spot_bot(api_key, api_secret, trade_amount, trade_pair, time_frame)

        conn.commit()
        return jsonify({"success": True, "message": f"{exchange.capitalize()} Spot bot started!"})

    else:  # Stop the bot
        if bot_config:
            # Update the status in the database
            cur.execute("""
                UPDATE bot_configurations
                SET status = FALSE, updated_at = NOW()
                WHERE id = %s
            """, (bot_config[0],))

            # Stop the bot for the specified exchange
            if exchange == "binance" and "binance_spot" in active_bots:
                stop_binance_spot_bot(active_bots["binance_spot"])
                del active_bots["binance_spot"]
            elif exchange == "bybit" and "bybit_spot" in active_bots:
                stop_bybit_spot_bot(active_bots["bybit_spot"])
                del active_bots["bybit_spot"]

            conn.commit()
            return jsonify({"success": True, "message": f"{exchange.capitalize()} Spot bot stopped!"})

    return jsonify({"success": False, "message": "Failed to toggle Spot bot status."})

@routes.route('/api/bot/futures/toggle', methods=['POST'])
@token_required
def toggle_futures_bot(current_user):
    """Toggles the Futures bot and saves its configuration in the database."""
    data = request.json
    bot_status = data.get("status")
    bot_type = "futures"
    api_key = data.get("api_key")
    api_secret = data.get("api_secret")
    trade_amount = data.get("trade_amount")
    trade_pair = data.get("trade_pair")
    time_frame = data.get("time_frame")
    leverage = data.get("leverage")
    exchange = data.get("exchange")

    conn = get_db_connection()
    cur = conn.cursor()

    # Check if a bot configuration already exists for this user and bot type
    cur.execute("""
        SELECT id FROM bot_configurations 
        WHERE user_id = (SELECT id FROM users WHERE username = %s) AND bot_type = %s AND exchange = %s
    """, (current_user, bot_type, exchange))
    bot_config = cur.fetchone()

    if bot_status:  # Start the bot
        if bot_config:
            # Update existing bot configuration
            cur.execute("""
                UPDATE bot_configurations
                SET status = TRUE, api_key = %s, api_secret = %s, trade_amount = %s, 
                    trade_pair = %s, time_frame = %s, leverage = %s, updated_at = NOW()
                WHERE id = %s
            """, (api_key, api_secret, trade_amount, trade_pair, time_frame, leverage, bot_config[0]))
        else:
            # Insert a new bot configuration
            cur.execute("""
                INSERT INTO bot_configurations 
                (user_id, bot_type, exchange, status, api_key, api_secret, trade_amount, trade_pair, time_frame, leverage)
                VALUES (
                    (SELECT id FROM users WHERE username = %s), %s, %s, TRUE, %s, %s, %s, %s, %s, %s
                )
            """, (current_user, bot_type, exchange, api_key, api_secret, trade_amount, trade_pair, time_frame, leverage))

        # Start the bot for the specified exchange
        if exchange == "binance":
            active_bots["binance_futures"] = start_binance_futures_bot(api_key, api_secret, trade_amount, trade_pair, time_frame, leverage)
        elif exchange == "bybit":
            active_bots["bybit_futures"] = start_bybit_futures_bot(api_key, api_secret, trade_amount, trade_pair, time_frame, leverage)

        conn.commit()
        return jsonify({"success": True, "message": f"{exchange.capitalize()} Futures bot started!"})

    else:  # Stop the bot
        if bot_config:
            # Update the status in the database
            cur.execute("""
                UPDATE bot_configurations
                SET status = FALSE, updated_at = NOW()
                WHERE id = %s
            """, (bot_config[0],))

            # Stop the bot for the specified exchange
            if exchange == "binance" and "binance_futures" in active_bots:
                stop_binance_futures_bot(active_bots["binance_futures"])
                del active_bots["binance_futures"]
            elif exchange == "bybit" and "bybit_futures" in active_bots:
                stop_bybit_futures_bot(active_bots["bybit_futures"])
                del active_bots["bybit_futures"]

            conn.commit()
            return jsonify({"success": True, "message": f"{exchange.capitalize()} Futures bot stopped!"})

    return jsonify({"success": False, "message": "Failed to toggle Futures bot status."})



