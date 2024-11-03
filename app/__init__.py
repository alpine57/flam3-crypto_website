from flask import Flask
from .routes import bp as main_bp

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_secret_key_here'  # Set a real secret key here
    app.register_blueprint(main_bp)
    return app

