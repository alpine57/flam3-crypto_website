from flask import Flask
from .routes import bp as main_bp

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] =  '9f80b09595a52aee7f1910222adc2255'  # Set a real secret key here
    app.register_blueprint(main_bp)
    return app

