import time
import logging

def handle_rate_limit(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except RuntimeError as e:
            if "rate limit" in str(e).lower():
                logging.warning("Rate limit hit, retrying after delay...")
                time.sleep(1)  # Adjust based on API documentation
                return func(*args, **kwargs)
            raise
    return wrapper

