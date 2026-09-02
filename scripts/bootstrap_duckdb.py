import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from src.pipeline.storage import connect, load_pool_prices

conn = connect()
try:
    load_pool_prices(conn, [
        {"begin_datetime_utc": "2025-01-01T07:00:00Z", "begin_datetime_mpt": "2025-01-01 00:00", "pool_price": "123.4", "forecast_pool_price": "120.0", "rolling_30day_avg": "99.1"},
        {"begin_datetime_utc": "2025-01-01T08:00:00Z", "begin_datetime_mpt": "2025-01-01 01:00", "pool_price": "87.2", "forecast_pool_price": "90.0", "rolling_30day_avg": "99.0"},
    ])
finally:
    conn.close()
