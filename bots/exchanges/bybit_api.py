import requests
import time
import hmac
import hashlib
import logging
from exchanges.utils import handle_rate_limit  # Utility function for rate limits
# Setup logging
logger = logging.getLogger(__name__)

class BybitAPI:
    BASE_URL = "https://api.bybit.com"

    def __init__(self, api_key, api_secret):
        self.api_key = api_key
        self.api_secret = api_secret

    def _create_signature(self, params):
        """Create HMAC SHA256 signature."""
        sorted_params = '&'.join(f"{key}={value}" for key, value in sorted(params.items()))
        return hmac.new(
            self.api_secret.encode('utf-8'),
            sorted_params.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    def _send_request(self, method, endpoint, params=None, is_signed=False):
        """Send a request to the Bybit API."""
        url = f"{self.BASE_URL}{endpoint}"
        if params is None:
            params = {}
        if is_signed:
            params['api_key'] = self.api_key
            params['timestamp'] = int(time.time() * 1000)
            params['sign'] = self._create_signature(params)

        try:
            if method == "GET":
                response = requests.get(url, params=params)
            elif method == "POST":
                response = requests.post(url, json=params)
            elif method == "DELETE":
                response = requests.delete(url, params=params)
            else:
                raise ValueError("Unsupported HTTP method")
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"Request failed: {e}")
            raise RuntimeError(f"Bybit API request failed: {e}")

    # Market Endpoints
    def get_current_price(self, symbol):
        """Fetch the latest price for a specific symbol."""
        endpoint = "/v2/public/tickers"
        params = {"symbol": symbol}
        response = self._send_request("GET", endpoint, params)
        return response.get("result", [{}])[0]

    def get_order_book_depth(self, symbol):
        """Fetch order book depth for a symbol."""
        endpoint = "/v2/public/orderBook/L2"
        params = {"symbol": symbol}
        return self._send_request("GET", endpoint, params)

    def get_average_price(self, symbol):
        """Fetch the average price for a symbol (not directly supported by Bybit)."""
        order_book = self.get_order_book_depth(symbol)
        bids = order_book.get("result", [])
        total_price, total_quantity = 0, 0
        for bid in bids:
            total_price += float(bid["price"]) * float(bid["size"])
            total_quantity += float(bid["size"])
        avg_price = total_price / total_quantity if total_quantity > 0 else None
        return {"symbol": symbol, "average_price": avg_price}

    # Account Endpoints
    def get_account_balance(self):
        """Fetch account balance."""
        endpoint = "/v2/private/wallet/balance"
        response = self._send_request("GET", endpoint, is_signed=True)
        return response.get("result", {})

    def get_all_orders(self, symbol):
        """Fetch all past and current orders for a specific symbol."""
        endpoint = "/v2/private/order/list"
        params = {"symbol": symbol}
        return self._send_request("GET", endpoint, params, is_signed=True)

    def get_trade_history(self, symbol):
        """Fetch executed trade data for a specific symbol."""
        endpoint = "/v2/private/execution/list"
        params = {"symbol": symbol}
        return self._send_request("GET", endpoint, params, is_signed=True)

    # Trading Endpoints
    def place_order(self, symbol, side, order_type, qty, price=None, time_in_force="GoodTillCancel"):
        """Place a new order."""
        endpoint = "/v2/private/order/create"
        params = {
            "symbol": symbol,
            "side": side,
            "order_type": order_type,
            "qty": qty,
            "time_in_force": time_in_force,
        }
        if order_type == "Limit" and price:
            params["price"] = price
        return self._send_request("POST", endpoint, params, is_signed=True)

    def cancel_order(self, order_id):
        """Cancel an open order."""
        endpoint = "/v2/private/order/cancel"
        params = {"order_id": order_id}
        return self._send_request("POST", endpoint, params, is_signed=True)

    # Utility Endpoints
    def get_server_time(self):
        """Fetch Bybit server time."""
        endpoint = "/v2/public/time"
        return self._send_request("GET", endpoint)

    def get_exchange_information(self):
        """Fetch Bybit exchange information."""
        endpoint = "/v2/public/symbols"
        return self._send_request("GET", endpoint)

