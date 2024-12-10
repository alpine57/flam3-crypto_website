import psycopg2
import importlib
import logging

# Database connection setup
DB_CONFIG = {
    "dbname": "your_db_name",
    "user": "your_username",
    "password": "your_password",
    "host": "your_host",
    "port": "your_port"
}

# Dictionary to track active bot instances
active_bots = {}

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')


def get_bot_configuration(bot_name, bot_type, exchange):
    """
    Fetches bot configuration from the database.

    Args:
        bot_name (str): The name of the bot (e.g., 'spot_bot_1').
        bot_type (str): The type of the bot ('spot' or 'futures').
        exchange (str): The exchange name (e.g., 'bybit').

    Returns:
        dict: The configuration details of the bot.
    """
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        with conn.cursor() as cur:
            cur.execute("""
                SELECT id, bot_name, bot_type, exchange, api_key, api_secret, trade_amount, trade_pair, time_frame
                FROM bot_configurations
                WHERE bot_name = %s AND bot_type = %s AND exchange = %s
            """, (bot_name, bot_type, exchange))
            config = cur.fetchone()
            if not config:
                raise ValueError(f"No configuration found for bot: {bot_name}, type: {bot_type} on exchange: {exchange}")
            # Convert tuple to dictionary using column names
            column_names = ["id", "bot_name", "bot_type", "exchange", "api_key", "api_secret", "trade_amount", "trade_pair", "time_frame"]
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


def start_bot(bot_name, bot_type, exchange):
    """
    Starts a bot of the given name, type, and exchange.

    Args:
        bot_name (str): The name of the bot to start (e.g., 'spot_bot_1').
        bot_type (str): The type of bot ('spot' or 'futures').
        exchange (str): The exchange name (e.g., 'bybit').

    Returns:
        str: The instance identifier of the started bot.
    """
    # Fetch bot configuration from the database
    config = get_bot_configuration(bot_name, bot_type, exchange)
    kwargs = {
        "api_key": config["api_key"],
        "api_secret": config["api_secret"],
        "trade_amount": config["trade_amount"],
        "trade_pair": config["trade_pair"],
        "time_frame": config["time_frame"]
    }

    # Dynamically import the start function
    logging.info(f"Starting bot: {bot_name}, type: {bot_type} on exchange: {exchange}")
    start_function, _ = dynamic_import(bot_name)
    instance_id = start_function(**kwargs)

    # Store the instance identifier of the started bot in the active_bots dictionary
    active_bots[(bot_name, bot_type, exchange)] = instance_id
    logging.info(f"Bot {bot_name}, type: {bot_type} started on {exchange} with instance ID: {instance_id}")
    return instance_id


def stop_bot(bot_name, bot_type, exchange):
    """
    Stops the bot of the given name, type, and exchange.

    Args:
        bot_name (str): The name of the bot to stop (e.g., 'spot_bot_1').
        bot_type (str): The type of bot ('spot' or 'futures').
        exchange (str): The exchange name (e.g., 'bybit').

    Returns:
        None
    """
    key = (bot_name, bot_type, exchange)
    if key not in active_bots:
        raise ValueError(f"No active instance found for bot: {bot_name}, type: {bot_type} on exchange: {exchange}")

    instance_id = active_bots.pop(key)

    # Dynamically import the stop function
    logging.info(f"Stopping bot: {bot_name}, type: {bot_type} on exchange: {exchange}")
    _, stop_function = dynamic_import(bot_name)
    stop_function(instance_id)

    logging.info(f"Bot {bot_name}, type: {bot_type} stopped on {exchange}")

