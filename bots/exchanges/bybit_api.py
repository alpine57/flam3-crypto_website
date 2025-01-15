import requests
import time
import hmac
import hashlib
import threading
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class BybitAPI:
    BASE_URL = "https://api.bybit.com"

    def __init__(self, api_key, api_secret):
        """
        Initialize the BybitAPI instance for a bot.
        """
        self.api_key = api_key
        self.api_secret = api_secret
        self.session = requests.Session()  # Use a session for better performance in repeated requests
        self.lock = threading.Lock()  # Thread-safety for shared operations

    def _create_signature(self, params):
        """
        Create HMAC SHA256 signature.
        """
        sorted_params = '&'.join(f"{key}={value}" for key, value in sorted(params.items()))
        return hmac.new(
            self.api_secret.encode('utf-8'),
            sorted_params.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

    def _send_request(self, method, endpoint, params=None, is_signed=False):
        """
        Send a request to the Bybit API.
        """
        url = f"{self.BASE_URL}{endpoint}"
        if params is None:
            params = {}
        if is_signed:
            params['api_key'] = self.api_key
            params['timestamp'] = int(time.time() * 1000)
            params['sign'] = self._create_signature(params)

        try:
            with self.lock:  # Ensure thread-safety during requests
                if method == "GET":
                    response = self.session.get(url, params=params)
                elif method == "POST":
                    response = self.session.post(url, json=params)
                elif method == "DELETE":
                    response = self.session.delete(url, params=params)
                else:
                    raise ValueError("Unsupported HTTP method")

                response.raise_for_status()
                return response.json()
        except requests.RequestException as e:
            logger.error(f"Request failed: {e}")
            raise RuntimeError(f"Bybit API request failed: {e}")

    # Example Public Endpoint
    def get_current_price(self, symbol):
        """
        Fetch the latest price for a specific symbol.
        """
        endpoint = "/v2/public/tickers"
        params = {"symbol": symbol}
        response = self._send_request("GET", endpoint, params)
        return response.get("result", [{}])[0]

    # Example Private Endpoint
    def get_account_balance(self):
        """
        Fetch account balance.
        """
        endpoint = "/v2/private/wallet/balance"
        response = self._send_request("GET", endpoint, is_signed=True)
        return response.get("result", {})

