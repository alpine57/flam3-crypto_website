from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

class BotConfiguration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    bot_name = db.Column(db.String(80), unique=True, nullable=False)
    exchange = db.Column(db.String(50), nullable=False)
    api_key = db.Column(db.String(255), nullable=False)
    api_secret = db.Column(db.String(255), nullable=False)
    trade_amount = db.Column(db.Float, nullable=False)
    trade_pair = db.Column(db.String(50), nullable=False)
    time_frame = db.Column(db.String(20), nullable=False)
    leverage = db.Column(db.Integer, nullable=True)  # Optional for spot bots

