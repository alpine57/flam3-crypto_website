import logging
from bots.exchanges.bybit_api import BybitAPI
from bots.exchanges.binance_api import BinanceAPI

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BotManager:
    def __init__(self):
        """
        Initialize the BotManager with support for multiple exchanges and bots.
        """
        self.bots = {}  # Dictionary to store bots with their configurations
        self.exchange_classes = {
            "bybit": BybitAPI,
            "binance": BinanceAPI,
        }

    def add_bot(self, bot_name, api_key, api_secret, exchange):
        """
        Add a new bot to the manager.
        
        :param bot_name: Unique name for the bot
        :param api_key: API key for the bot
        :param api_secret: API secret for the bot
        :param exchange: Name of the exchange (e.g., "bybit", "binance")
        """
        if bot_name in self.bots:
            raise ValueError(f"Bot with name '{bot_name}' already exists.")
        if exchange not in self.exchange_classes:
            raise ValueError(f"Unsupported exchange: {exchange}")
        
        # Initialize the exchange API wrapper and store the bot instance
        exchange_api_class = self.exchange_classes[exchange]
        self.bots[bot_name] = exchange_api_class(api_key, api_secret)
        logger.info(f"Bot '{bot_name}' added for exchange '{exchange}'.")

    def get_bot(self, bot_name):
        """
        Retrieve an existing bot instance by its name.
        
        :param bot_name: Name of the bot
        :return: Bot instance
        """
        if bot_name not in self.bots:
            raise ValueError(f"Bot with name '{bot_name}' does not exist.")
        return self.bots[bot_name]

    def remove_bot(self, bot_name):
        """
        Remove a bot from the manager.
        
        :param bot_name: Name of the bot to remove
        """
        if bot_name not in self.bots:
            raise ValueError(f"Bot with name '{bot_name}' does not exist.")
        del self.bots[bot_name]
        logger.info(f"Bot '{bot_name}' has been removed.")

    def list_bots(self):
        """
        List all managed bots with their associated exchanges.
        
        :return: Dictionary of bot names and their exchanges
        """
        return {bot_name: bot.__class__.__name__ for bot_name, bot in self.bots.items()}

