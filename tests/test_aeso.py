from datetime import date
from unittest.mock import Mock

import duckdb
import pytest
import requests

from src.aeso.client import AESOClient
from src.pipeline.storage import load_pool_prices


def response(payload, status=200):
    r = Mock(spec=requests.Response)
    r.status_code = status
    r.json.return_value = payload
    r.raise_for_status.side_effect = None
    return r


def test_pool_price_extracts_report(monkeypatch):
    session = Mock()
    session.get.return_value = response({"return": {"Pool Price Report": [{"pool_price": "42.5"}]}})
    client = AESOClient("secret", session=session, min_interval=0)
    assert client.pool_price(date(2025, 1, 1), date(2025, 1, 1)) == [{"pool_price": "42.5"}]
    session.get.assert_called_once()
    assert session.get.call_args.kwargs["params"]["startDate"] == "2025-01-01"


def test_pool_price_chunks_long_range(monkeypatch):
    client = AESOClient("secret", session=Mock(), min_interval=0)
    client.pool_price = Mock(return_value=[])
    list(client.pool_price_chunks(date(2024, 1, 1), date(2025, 1, 1), chunk_days=365))
    assert client.pool_price.call_count == 2
    assert client.pool_price.call_args_list[0].args == (date(2024, 1, 1), date(2024, 12, 30))


def test_storage_converts_numeric_strings():
    conn = duckdb.connect(":memory:")
    conn.execute("""CREATE TABLE raw_pool_prices (begin_datetime_utc TIMESTAMP PRIMARY KEY, begin_datetime_mpt VARCHAR, pool_price DOUBLE, forecast_pool_price DOUBLE, rolling_30day_avg DOUBLE, ingested_at TIMESTAMP, raw_payload JSON)""")
    count = load_pool_prices(conn, [{"begin_datetime_utc": "2025-01-01T07:00:00Z", "begin_datetime_mpt": "2025-01-01 00:00", "pool_price": "123.4", "forecast_pool_price": "125", "rolling_30day_avg": "99.1"}])
    assert count == 1
    assert conn.execute("select pool_price from raw_pool_prices").fetchone()[0] == pytest.approx(123.4)


def test_http_429_is_retried():
    session = Mock()
    session.get.side_effect = [response({}, 429), response({"return": {"Pool Price Report": []}})]
    client = AESOClient("secret", session=session, min_interval=0)
    assert client.pool_price(date(2025, 1, 1), date(2025, 1, 1)) == []
    assert session.get.call_count == 2
