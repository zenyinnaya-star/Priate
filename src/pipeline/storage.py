"""Raw ingestion tables shared by local DuckDB and production Postgres."""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

import duckdb

LOGGER = logging.getLogger(__name__)

DDL = """
CREATE TABLE IF NOT EXISTS raw_pool_prices (
    begin_datetime_utc TIMESTAMP PRIMARY KEY,
    begin_datetime_mpt VARCHAR,
    pool_price DOUBLE,
    forecast_pool_price DOUBLE,
    rolling_30day_avg DOUBLE,
    ingested_at TIMESTAMP NOT NULL,
    raw_payload JSON NOT NULL
);
CREATE TABLE IF NOT EXISTS raw_supply_assets (
    asset_name VARCHAR,
    fuel_type VARCHAR,
    operating_status VARCHAR,
    net_generation DOUBLE,
    capacity DOUBLE,
    snapshot_at TIMESTAMP NOT NULL,
    raw_payload JSON NOT NULL,
    PRIMARY KEY (asset_name, snapshot_at)
);
"""


def _number(value: Any) -> float | None:
    if value in (None, "", "null"):
        return None
    return float(str(value).replace(",", ""))


def _timestamp(value: Any) -> datetime:
    parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    return parsed.astimezone(timezone.utc).replace(tzinfo=None)


def connect(path: str | Path | None = None) -> duckdb.DuckDBPyConnection:
    db_path = str(path or os.getenv("DUCKDB_PATH", "data/alberta_grid.duckdb"))
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    conn = duckdb.connect(db_path)
    conn.execute(DDL)
    return conn


def load_pool_prices(conn: duckdb.DuckDBPyConnection, rows: Iterable[dict[str, Any]]) -> int:
    ingested_at = datetime.now(timezone.utc).replace(tzinfo=None)
    values = []
    for row in rows:
        values.append((
            _timestamp(row["begin_datetime_utc"]), row.get("begin_datetime_mpt"), _number(row.get("pool_price")),
            _number(row.get("forecast_pool_price")), _number(row.get("rolling_30day_avg")), ingested_at, json.dumps(row),
        ))
    conn.executemany("""
        INSERT OR REPLACE INTO raw_pool_prices
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, values)
    LOGGER.info("pool_prices_loaded", extra={"row_count": len(values)})
    return len(values)


def load_supply_assets(conn: duckdb.DuckDBPyConnection, rows: Iterable[dict[str, Any]], snapshot_at: datetime | None = None) -> int:
    snapshot = (snapshot_at or datetime.now(timezone.utc)).astimezone(timezone.utc).replace(tzinfo=None)
    values = []
    for row in rows:
        values.append((
            row.get("asset_name") or row.get("assetName") or row.get("name"),
            row.get("fuel_type") or row.get("fuelType") or row.get("fuel"),
            row.get("operating_status") or row.get("operatingStatus") or row.get("status"),
            _number(row.get("net_generation") or row.get("netGeneration") or row.get("output")),
            _number(row.get("capacity") or row.get("maxCapacity")), snapshot, json.dumps(row),
        ))
    conn.executemany("INSERT OR REPLACE INTO raw_supply_assets VALUES (?, ?, ?, ?, ?, ?, ?)", values)
    LOGGER.info("supply_assets_loaded", extra={"row_count": len(values)})
    return len(values)
