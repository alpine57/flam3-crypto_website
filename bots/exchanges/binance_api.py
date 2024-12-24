import requests
import time
import hmac
import hashlib
import logging
from exchanges.utils import handle_rate_limit  # Utility function for rate limits

class BinanceAPI:
    BASE_URL = "https://api.binance.com"

    def __init__(self, api_key, api_secret):
        self.api_key = api_key
        self.api_secret = api_secret
        self.logger = logging.getLogger(__name__)

    def _create_signature(self, params):
        query_string = '&'.join([f"{key}={value}" for key, value in params.items()])
        return hmac.new(
            self.api_secret.encode('utf-8'),
            query_string.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    @handle_rate_limit  # Decorator for rate limit handling
    def _send_request(self, method, endpoint, params=None, is_signed=False):
        url = f"{self.BASE_URL}{endpoint}"
        headers = {
            "X-MBX-APIKEY": self.api_key
        }
        if params is None:
            params = {}
        if is_signed:
            params['timestamp'] = int(time.time() * 1000)
            params['signature'] = self._create_signature(params)
        try:
            response = requests.request(method, url, headers=headers, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            self.logger.error(f"Request to {endpoint} failed: {e}")
            raise RuntimeError(f"Binance API request failed: {e}")

    def get_balance(self):
        endpoint = "/api/v3/account"
        return self._send_request("GET", endpoint, is_signed=True)

    def place_trade(self, pair, amount, side, order_type="MARKET", price=None):
        endpoint = "/api/v3/order"
        params = {
            "symbol": pair,
            "side": side,
            "type": order_type,
            "quantity": amount,
        }
        if price:
            params["price"] = price
        return self._send_request("POST", endpoint, params=params, is_signed=True)

    def fetch_trade_history(self, pair):
        endpoint = "/api/v3/myTrades"
        params = {"symbol": pair}
        return self._send_request("GET", endpoint, params=params, is_signed=True)

