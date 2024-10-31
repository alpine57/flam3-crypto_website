import os
import psycopg2
from flask import Flask

def get_db_connection():
    DATABASE_URL = os.getenv('DATABASE_URL', 'your_database_url_here')
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_secret_key'  # Change this to a random secret key

    with app.app_context():
        from .routes import bp as main_bp
        app.register_blueprint(main_bp)

    return app

