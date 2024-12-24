import requests
import time
import hmac
import hashlib
import logging
from exchanges.utils import handle_rate_limit  # Utility function for rate limits

class BybitAPI:
    BASE_URL = "https://api.bybit.com"

    def __init__(self, api_key, api_secret):
        self.api_key = api_key
        self.api_secret = api_secret
        self.logger = logging.getLogger(__name__)

    def _create_signature(self, params):
        sorted_params = '&'.join([f"{key}={value}" for key, value in sorted(params.items())])
        return hmac.new(
            self.api_secret.encode('utf-8'),
            sorted_params.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    @handle_rate_limit  # Decorator for rate limit handling
    def _send_request(self, method, endpoint, params=None, is_signed=False):
        url = f"{self.BASE_URL}{endpoint}"
        if params is None:
            params = {}
        if is_signed:
            params['api_key'] = self.api_key
            params['timestamp'] = int(time.time() * 1000)
            params['sign'] = self._create_signature(params)
        try:
            response = requests.request(method, url, params=params)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            self.logger.error(f"Request to {endpoint} failed: {e}")
            raise RuntimeError(f"Bybit API request failed: {e}")

    def get_balance(self):
        endpoint = "/v2/private/wallet/balance"
        return self._send_request("GET", endpoint, is_signed=True)

    def place_trade(self, pair, amount, side, order_type="Market", price=None):
        endpoint = "/v2/private/order/create"
        params = {
            "symbol": pair,
            "order_type": order_type,
            "qty": amount,
            "side": side,
        }
        if price:
            params["price"] = price
        return self._send_request("POST", endpoint, params=params, is_signed=True)

    def fetch_trade_history(self, pair):
        endpoint = "/v2/private/execution/list"
        params = {"symbol": pair}
        return self._send_request("GET", endpoint, params=params, is_signed=True)

