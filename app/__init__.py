from flask import Flask
from .routes import bp as main_bp  # Adjust if needed based on your folder structure

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = '9f80b09595a52aee7f1910222adc2255'  # Set a real secret key here
    
    # Register blueprint without prefix to access routes directly
    app.register_blueprint(main_bp)
    
    return app

# To run the app in development mode directly with `app.py`
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)  # Enables debugging mode

