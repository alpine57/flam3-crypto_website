import psycopg2
import importlib
import logging
from bots.utils.bot_operations import BotManager

# Database connection setup
DB_CONFIG = {
    'dbname': 'verceldb',
    'user': 'default',
    'password': 'zyqGFZc0HWt2',
    'host': 'ep-still-band-a4xu3rci.us-east-1.aws.neon.tech',
    'port': 5432
}

# Dictionary to track active bot instances
active_bots = {}

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def get_bot_configuration(user_id, bot_name, bot_type, exchange):
    """
    Fetches bot configuration from the database for a specific user.

    Args:
        user_id (int): The ID of the user.
        bot_name (str): The name of the bot (e.g., 'spot_bot_1').
        bot_type (str): The type of the bot ('spot' or 'futures').
        exchange (str): The exchange name (e.g., 'binance').

    Returns:
        dict: The configuration details of the bot.
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
            # Convert tuple to dictionary using column names
            column_names = ["id", "bot_name", "exchange", "api_key", "api_secret", "trade_amount", "trade_pair", "time_frame", "bot_type"]
            return dict(zip(column_names, config))
    except psycopg2.Error as e:
        logging.error(f"Database error: {e}")
        raise
    finally:
        conn.close()

def dynamic_import(bot_name):
    """
    Dynamically imports the start and stop functions for the given bot.

    Args:
        bot_name (str): The name of the bot to import.

    Returns:
        tuple: The start and stop functions of the bot.
    """
    try:
        module_path = f"bots.{bot_name}.custom_bot"
        bot_module = importlib.import_module(module_path)
        return bot_module.start_bot, bot_module.stop_bot
    except ImportError as e:
        raise ValueError(f"Failed to import bot: {bot_name}. Error: {e}")

def start_bot(user_id, bot_name, bot_type, exchange):
    """
    Starts a bot for a specific user.

    Args:
        user_id (int): The ID of the user starting the bot.
        bot_name (str): The name of the bot to start (e.g., 'spot_bot_1').
        bot_type (str): The type of the bot ('spot' or 'futures').
        exchange (str): The exchange name (e.g., 'binance').

    Returns:
        int: The bot_id of the started bot.
    """
    # Fetch bot configuration from the database
    config = get_bot_configuration(user_id, bot_name, bot_type, exchange)
    kwargs = {
        "api_key": config["api_key"],
        "api_secret": config["api_secret"],
        "trade_amount": config["trade_amount"],
        "trade_pair": config["trade_pair"],
        "time_frame": config["time_frame"]
    }

    # Dynamically import the start function
    logging.info(f"Starting bot: {bot_name} (ID: {config['id']}), type: {bot_type} on exchange: {exchange}")
    start_function, _ = dynamic_import(bot_name)
    start_function(**kwargs)

    # Store the bot in the active_bots dictionary
    active_bots[(user_id, bot_name, bot_type, exchange)] = config["id"]
    logging.info(f"Bot {bot_name} (ID: {config['id']}), type: {bot_type} started on {exchange}")
    return config["id"]

def stop_bot(user_id, bot_name, bot_type, exchange):
    """
    Stops a bot for a specific user.

    Args:
        user_id (int): The ID of the user stopping the bot.
        bot_name (str): The name of the bot to stop (e.g., 'spot_bot_1').
        bot_type (str): The type of the bot ('spot' or 'futures').
        exchange (str): The exchange name (e.g., 'binance').

    Returns:
        None
    """
    key = (user_id, bot_name, bot_type, exchange)
    if key not in active_bots:
        raise ValueError(f"No active instance found for user_id: {user_id}, bot: {bot_name}, type: {bot_type} on exchange: {exchange}")

    bot_id = active_bots.pop(key)
    logging.info(f"Stopping bot: {bot_name} (ID: {bot_id}), type: {bot_type} on exchange: {exchange}")
    _, stop_function = dynamic_import(bot_name)
    stop_function(bot_id)
    logging.info(f"Bot {bot_name} (ID: {bot_id}), type: {bot_type} stopped on {exchange}")

def list_active_bots_by_exchange():
    """
    Returns a dictionary where exchanges are keys and values are the number of active bots.

    Example:
        {
            "binance": 1,  # 1 bot still active
            "bybit": 3     # 3 bots still active
        }
    """
    active_bots_count = {}
    for (user_id, bot_name, bot_type, exchange), bot_id in active_bots.items():
        if exchange not in active_bots_count:
            active_bots_count[exchange] = 0
        active_bots_count[exchange] += 1
    return active_bots_count



class BotManager:
    """
    Manages bot operations such as starting, stopping, and listing active bots.
    """
    @staticmethod
    def start_bot(user_id, bot_name, bot_type, exchange):
        """
        Starts a bot for a specific user.
        """
        return start_bot(user_id, bot_name, bot_type, exchange)

    @staticmethod
    def stop_bot(user_id, bot_name, bot_type, exchange):
        """
        Stops a bot for a specific user.
        """
        return stop_bot(user_id, bot_name, bot_type, exchange)

    @staticmethod
    def list_active_bots_by_exchange():
        """
        Returns a dictionary where exchanges are keys and values are the number of active bots.
        """
        return list_active_bots_by_exchange()
