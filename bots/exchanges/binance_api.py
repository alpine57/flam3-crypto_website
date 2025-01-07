import requests
import time
import hmac
import hashlib
import logging
from exchanges.utils import handle_rate_limit  # Utility function for rate limits

# Setup logging
logger = logging.getLogger(__name__)

class BinanceAPI:
    def __init__(self, api_key, api_secret):
        self.client = Client(api_key, api_secret)

    # Market Endpoints
    def get_current_price(self, symbol):
        """Fetch the latest price for a specific symbol."""
        try:
            price = self.client.get_symbol_ticker(symbol=symbol)
            return price
        except Exception as e:
            logger.error(f"Error fetching current price for {symbol}: {e}")
            raise RuntimeError(f"Failed to fetch current price: {e}")

    def get_order_book_depth(self, symbol, limit=10):
        """Fetch order book depth for a symbol."""
        try:
            depth = self.client.get_order_book(symbol=symbol, limit=limit)
            return depth
        except Exception as e:
            logger.error(f"Error fetching order book depth for {symbol}: {e}")
            raise RuntimeError(f"Failed to fetch order book depth: {e}")

    def get_average_price(self, symbol):
        """Fetch the average price of a symbol."""
        try:
            avg_price = self.client.get_avg_price(symbol=symbol)
            return avg_price
        except Exception as e:
            logger.error(f"Error fetching average price for {symbol}: {e}")
            raise RuntimeError(f"Failed to fetch average price: {e}")

    # Account Endpoints
    def get_account_information(self):
        """Fetch account balances, permissions, and trading details."""
        try:
            account_info = self.client.get_account()
            return account_info
        except Exception as e:
            logger.error(f"Error fetching account information: {e}")
            raise RuntimeError(f"Failed to fetch account information: {e}")

    def get_all_orders(self, symbol):
        """Fetch all past and current orders for a specific symbol."""
        try:
            orders = self.client.get_all_orders(symbol=symbol)
            return orders
        except Exception as e:
            logger.error(f"Error fetching all orders for {symbol}: {e}")
            raise RuntimeError(f"Failed to fetch all orders: {e}")

    def get_trade_history(self, symbol):
        """Fetch executed trade data for an account."""
        try:
            trades = self.client.get_my_trades(symbol=symbol)
            return trades
        except Exception as e:
            logger.error(f"Error fetching trade history for {symbol}: {e}")
            raise RuntimeError(f"Failed to fetch trade history: {e}")

    # Trading Endpoints
    def place_order(self, symbol, side, order_type, quantity, price=None):
        """
        Place a new order (buy/sell).
        Order type can be market, limit, etc.
        """
        try:
            if order_type == "LIMIT":
                if not price:
                    raise ValueError("Limit orders require a price.")
                order = self.client.create_order(
                    symbol=symbol,
                    side=side,
                    type=order_type,
                    timeInForce="GTC",
                    quantity=quantity,
                    price=price
                )
            else:  # Market order
                order = self.client.create_order(
                    symbol=symbol,
                    side=side,
                    type=order_type,
                    quantity=quantity
                )
            return order
        except Exception as e:
            logger.error(f"Error placing order for {symbol}: {e}")
            raise RuntimeError(f"Failed to place order: {e}")

    def cancel_order(self, symbol, order_id=None, client_order_id=None):
        """Cancel an open order by order ID or client order ID."""
        try:
            if order_id:
                result = self.client.cancel_order(symbol=symbol, orderId=order_id)
            elif client_order_id:
                result = self.client.cancel_order(symbol=symbol, origClientOrderId=client_order_id)
            else:
                raise ValueError("Either order_id or client_order_id must be provided.")
            return result
        except Exception as e:
            logger.error(f"Error canceling order for {symbol}: {e}")
            raise RuntimeError(f"Failed to cancel order: {e}")

    # Utility Endpoints
    def get_exchange_information(self):
        """Fetch data about available symbols, trading pairs, and exchange rules."""
        try:
            exchange_info = self.client.get_exchange_info()
            return exchange_info
        except Exception as e:
            logger.error(f"Error fetching exchange information: {e}")
            raise RuntimeError(f"Failed to fetch exchange information: {e}")

    def get_server_time(self):
        """Fetch the current server time."""
        try:
            server_time = self.client.get_server_time()
            return server_time
        except Exception as e:
            logger.error(f"Error fetching server time: {e}")
            raise RuntimeError(f"Failed to fetch server time: {e}")

