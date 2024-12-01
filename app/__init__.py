from flask import Flask
from app.routes import routes  # Import the routes Blueprint (make sure it's named 'routes' in routes.py)

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = '9f80b09595a52aee7f1910222adc2255'  # Set a real secret key here

    # Register blueprint
    app.register_blueprint(routes)  # Register the routes blueprint without any prefix (or set a prefix if needed)

    return app

# To run the app in development mode directly with `app.py`
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)  # Enables debugging mode

