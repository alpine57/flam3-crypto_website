import psycopg2
import importlib
import logging
from exchanges.bybit_api import BybitAPI
from exchanges.binance_api import BinanceAPI

# Database connection setup
DB_CONFIG = {
    'dbname': 'verceldb',
    'user': 'default',
    'password': 'zyqGFZc0HWt2',
    'host': 'ep-still-band-a4xu3rci.us-east-1.aws.neon.tech',
    'port': 5432
}

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BotManager:
    def __init__(self):
        """
        Initialize the BotManager with support for multiple exchanges and bots.
        """
        self.bots = {}  # Dictionary to track active bots
        self.exchange_classes = {
            "bybit": BybitAPI,
            "binance": BinanceAPI,
        }

    def get_bot_configuration(self, user_id, bot_name, bot_type, exchange):
        """
        Fetches bot configuration from the database for a specific user.
        """
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, bot_name, exchange, api_key, api_secret, trade_amount, trade_pair, time_frame, bot_type
                    FROM spot_bot_configurations
                    WHERE user_id = %s AND bot_name = %s AND bot_type = %s AND exchange = %s
                """, (user_id, bot_name, bot_type, exchange))
                config = cur.fetchone()
                if not config:
                    raise ValueError(f"No configuration found for user_id: {user_id}, bot_name: {bot_name}, bot_type: {bot_type}, exchange: {exchange}")
                column_names = ["id", "bot_name", "exchange", "api_key", "api_secret", "trade_amount", "trade_pair", "time_frame", "bot_type"]
                return dict(zip(column_names, config))
        except psycopg2.Error as e:
            logger.error(f"Database error: {e}")
            raise
        finally:
            conn.close()

    def dynamic_import(self, bot_name):
        """
        Dynamically imports the start and stop functions for the given bot.
        """
        try:
            module_path = f"bots.{bot_name}.custom_bot"
            bot_module = importlib.import_module(module_path)
            return bot_module.start_bot, bot_module.stop_bot
        except ImportError as e:
            raise ValueError(f"Failed to import bot: {bot_name}. Error: {e}")

    def start_bot(self, user_id, bot_name, bot_type, exchange):
        """
        Starts a bot for a specific user.
        """
        config = self.get_bot_configuration(user_id, bot_name, bot_type, exchange)
        kwargs = {
            "api_key": config["api_key"],
            "api_secret": config["api_secret"],
            "trade_amount": config["trade_amount"],
            "trade_pair": config["trade_pair"],
            "time_frame": config["time_frame"]
        }
        logging.info(f"Starting bot: {bot_name} (ID: {config['id']}), type: {bot_type} on exchange: {exchange}")
        start_function, _ = self.dynamic_import(bot_name)
        start_function(**kwargs)
        self.bots[(user_id, bot_name, bot_type, exchange)] = config["id"]
        logger.info(f"Bot {bot_name} (ID: {config['id']}), type: {bot_type} started on {exchange}")
        return config["id"]

    def stop_bot(self, user_id, bot_name, bot_type, exchange):
        """
        Stops a bot for a specific user.
        """
        key = (user_id, bot_name, bot_type, exchange)
        if key not in self.bots:
            raise ValueError(f"No active instance found for user_id: {user_id}, bot: {bot_name}, type: {bot_type} on exchange: {exchange}")

        bot_id = self.bots.pop(key)
        logging.info(f"Stopping bot: {bot_name} (ID: {bot_id}), type: {bot_type} on exchange: {exchange}")
        _, stop_function = self.dynamic_import(bot_name)
        stop_function(bot_id)
        logger.info(f"Bot {bot_name} (ID: {bot_id}), type: {bot_type} stopped on {exchange}")

    def list_active_bots_by_exchange(self):
        """
        Returns a dictionary where exchanges are keys and values are the number of active bots.
        """
        active_bots_count = {}
        for (user_id, bot_name, bot_type, exchange), bot_id in self.bots.items():
            if exchange not in active_bots_count:
                active_bots_count[exchange] = 0
            active_bots_count[exchange] += 1
        return active_bots_count

