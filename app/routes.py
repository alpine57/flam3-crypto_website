from flask import Blueprint, jsonify, request, render_template, current_app, redirect, url_for
import bcrypt
import jwt
from functools import wraps
from datetime import datetime, timedelta
import psycopg2
import os

bp = Blueprint('main', __name__)

DATABASE_URL = os.getenv('postgresql://flame_crypto_user:96yoBV9vkxXQLJM8MjWOSNYHwGqkQYXw@dpg-csl7uejv2p9s73b4bjbg-a.oregon-postgres.render.com/flame_crypto')



def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token')
        if not token:
            return redirect(url_for('main.login_page'))
        
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = data['username']
        except jwt.ExpiredSignatureError:
            return redirect(url_for('main.login_page'))
        except Exception:
            return redirect(url_for('main.login_page'))

        return f(current_user, *args, **kwargs)
    return decorated

@bp.route('/')
@token_required
def index(current_user):
    return render_template('index.html', username=current_user)

@bp.route('/login', methods=['POST', 'GET'])
def login():
    if request.method == 'POST':
        # Handle form data for POST request
        username = request.form.get('username')
        password = request.form.get('password')

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if not user or not bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
            return render_template('login_signup.html', message='Invalid credentials!', login_action=url_for('main.login'), signup_action=url_for('main.register'))

        # Generate JWT token
        token = jwt.encode({
            'username': user[1],
            'exp': datetime.utcnow() + timedelta(hours=1)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        response = redirect(url_for('main.index'))
        response.set_cookie('token', token)
        return response

    # Render login/signup page for GET request
    return render_template('login_signup.html', login_action=url_for('main.login'), signup_action=url_for('main.register'))

@bp.route('/register', methods=['POST'])
def register():
    # Handle form data for registration
    username = request.form.get('username')
    email = request.form.get('email')
    password = request.form.get('password')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cur.fetchone()

    if user:
        # Return with a message if username already exists
        return render_template('login_signup.html', message='Username already exists!', login_action=url_for('main.login'), signup_action=url_for('main.register'))

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
    response.set_cookie('token', token)
    return response

@bp.route('/login_page')
def login_page():
    return render_template('login_signup.html', login_action=url_for('main.login'), signup_action=url_for('main.register'))

