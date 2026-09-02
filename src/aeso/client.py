"""Thin, observable client for the AESO public reporting API."""

from __future__ import annotations

import logging
import os
import threading
import time
from datetime import date, timedelta
from typing import Any, Iterator

import requests
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential

LOGGER = logging.getLogger(__name__)


class AESOHTTPError(requests.HTTPError):
    """HTTP error carrying the response status for retry classification."""

    def __init__(self, response: requests.Response) -> None:
        super().__init__(f"AESO request failed with HTTP {response.status_code}", response=response)
        self.status_code = response.status_code


def _retryable(exc: BaseException) -> bool:
    return isinstance(exc, AESOHTTPError) and (exc.status_code == 429 or exc.status_code >= 500)


class AESOClient:
    BASE_URL = "https://api.aeso.ca/report/v1.1"
    CURRENT_SUPPLY_URL = "https://api.aeso.ca/report/v1/csd/generation/assets/current"

    def __init__(self, api_key: str | None = None, session: requests.Session | None = None, min_interval: float = 1.0) -> None:
        self.api_key = api_key or os.environ.get("AESO_API_KEY")
        if not self.api_key:
            raise ValueError("AESO_API_KEY must be set")
        self.session = session or requests.Session()
        self.session.headers.update({"X-API-Key": self.api_key, "Accept": "application/json"})
        self.min_interval = min_interval
        self._last_request = 0.0
        self._lock = threading.Lock()

    def _throttle(self) -> None:
        with self._lock:
            elapsed = time.monotonic() - self._last_request
            if elapsed < self.min_interval:
                time.sleep(self.min_interval - elapsed)
            self._last_request = time.monotonic()

    @retry(
        retry=retry_if_exception(_retryable),
        wait=wait_exponential(multiplier=1, min=1, max=30),
        stop=stop_after_attempt(4),
        reraise=True,
    )
    def _get(self, url: str, params: dict[str, str] | None = None) -> dict[str, Any]:
        self._throttle()
        LOGGER.info("aeso_request", extra={"url": url, "params": params})
        response = self.session.get(url, params=params, timeout=30)
        if response.status_code >= 400:
            raise AESOHTTPError(response)
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict):
            raise ValueError("AESO response must be a JSON object")
        return payload

    def pool_price(self, start_date: date, end_date: date) -> list[dict[str, Any]]:
        if end_date < start_date:
            raise ValueError("end_date must be on or after start_date")
        payload = self._get(
            f"{self.BASE_URL}/price/poolPrice",
            {"startDate": start_date.isoformat(), "endDate": end_date.isoformat()},
        )
        return payload.get("return", {}).get("Pool Price Report", [])

    def pool_price_chunks(self, start_date: date, end_date: date, chunk_days: int = 365) -> Iterator[list[dict[str, Any]]]:
        cursor = start_date
        while cursor <= end_date:
            chunk_end = min(cursor + timedelta(days=chunk_days - 1), end_date)
            yield self.pool_price(cursor, chunk_end)
            cursor = chunk_end + timedelta(days=1)

    def current_supply(self) -> list[dict[str, Any]]:
        payload = self._get(self.CURRENT_SUPPLY_URL)
        result = payload.get("return", payload)
        if isinstance(result, dict):
            for key in ("Generation Assets", "generation_assets", "assets", "Generation Assets Report"):
                if isinstance(result.get(key), list):
                    return result[key]
        return result if isinstance(result, list) else []
