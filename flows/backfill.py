"""Runnable Prefect backfill flow: python flows/backfill.py --start 2025-01-01 --end 2025-01-07"""

from __future__ import annotations

import argparse
import logging
from datetime import date

from prefect import flow, task

from src.aeso.client import AESOClient
from src.pipeline.storage import connect, load_pool_prices, load_supply_assets

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
LOGGER = logging.getLogger(__name__)


@task(retries=2, retry_delay_seconds=30, log_prints=False)
def extract_pool_prices(start_date: date, end_date: date) -> list[dict]:
    client = AESOClient()
    rows = [row for chunk in client.pool_price_chunks(start_date, end_date) for row in chunk]
    LOGGER.info("pool_price_extract_complete", extra={"start_date": start_date.isoformat(), "end_date": end_date.isoformat(), "row_count": len(rows)})
    return rows


@task(retries=2, retry_delay_seconds=30, log_prints=False)
def load_pool_price_rows(rows: list[dict]) -> int:
    conn = connect()
    try:
        return load_pool_prices(conn, rows)
    finally:
        conn.close()


@task(retries=2, retry_delay_seconds=30, log_prints=False)
def extract_and_load_supply() -> int:
    client = AESOClient()
    conn = connect()
    try:
        return load_supply_assets(conn, client.current_supply())
    finally:
        conn.close()


@flow(name="aeso-pool-price-backfill", log_prints=True)
def backfill(start_date: date, end_date: date) -> int:
    rows = extract_pool_prices(start_date, end_date)
    loaded = load_pool_price_rows(rows)
    LOGGER.info("backfill_complete", extra={"loaded_rows": loaded})
    return loaded


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", required=True, type=date.fromisoformat)
    parser.add_argument("--end", required=True, type=date.fromisoformat)
    args = parser.parse_args()
    backfill(args.start, args.end)
