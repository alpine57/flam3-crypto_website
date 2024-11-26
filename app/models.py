from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

class SpotBotConfiguration(db.Model):
    __tablename__ = 'spot_bot_configurations'
    id = db.Column(db.Integer, primary_key=True)
    bot_name = db.Column(db.String(50), nullable=False)
    exchange = db.Column(db.String(20), nullable=False)
    api_key = db.Column(db.String(100), nullable=False)
    api_secret = db.Column(db.String(100), nullable=False)
    trade_amount = db.Column(db.Float, nullable=False)
    trade_pair = db.Column(db.String(20), nullable=False)
    time_frame = db.Column(db.String(10), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SpotBotConfiguration {self.bot_name} - {self.exchange}>"

class FuturesBotConfiguration(db.Model):
    __tablename__ = 'futures_bot_configurations'
    id = db.Column(db.Integer, primary_key=True)
    bot_name = db.Column(db.String(50), nullable=False)
    exchange = db.Column(db.String(20), nullable=False)
    api_key = db.Column(db.String(100), nullable=False)
    api_secret = db.Column(db.String(100), nullable=False)
    trade_amount = db.Column(db.Float, nullable=False)
    trade_pair = db.Column(db.String(20), nullable=False)
    time_frame = db.Column(db.String(10), nullable=False)
    leverage = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<FuturesBotConfiguration {self.bot_name} - {self.exchange}>"
