from flask import Blueprint, request, jsonify
import bcrypt
import jwt
from functools import wraps
from datetime import datetime, timedelta
from . import get_db_connection

bp = Blueprint('main', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split()[1]
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, 'your_secret_key', algorithms=["HS256"])  # Use your actual secret key
            current_user = data['username']
        except Exception:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data['username']
    email = data['email']
    password = data['password']

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cur.fetchone()

    if user:
        return jsonify({'message': 'Username already exists!'}), 400

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cur.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
                (username, email, hashed_password))
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({'message': 'User registered successfully!'}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data['username']
    password = data['password']

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if not user or not bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
        return jsonify({'message': 'Invalid credentials!'}), 401

    token = jwt.encode({
        'username': user[1],
        'exp': datetime.utcnow() + timedelta(hours=1)
    }, 'your_secret_key', algorithm="HS256")  # Use your actual secret key

    return jsonify({'token': token})

@bp.route('/protected', methods=['GET'])
@token_required
def protected_route(current_user):
    return jsonify({'message': f'Hello, {current_user}!', 'logged_in_as': current_user})

@bp.route('/users', methods=['GET'])
@token_required
def get_users(current_user):
    if current_user != 'admin':
        return jsonify({'message': 'Admin access required!'}), 403
    
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, username, email FROM users")
    users = cur.fetchall()
    cur.close()
    conn.close()
    
    users_list = [{'id': user[0], 'username': user[1], 'email': user[2]} for user in users]
    return jsonify(users_list), 200
