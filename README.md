# Alberta Grid Pipeline

A production-shaped portfolio data platform for Alberta electricity market data. The repository combines a thin AESO API client, typed raw ingestion into DuckDB, dbt transformations compatible with Postgres/Supabase, Prefect orchestration, pytest coverage, and a Next.js 15/Recharts operations dashboard.

## Architecture

The ingestion boundary is intentionally narrow: `src/aeso/client.py` owns the AESO header, date formatting, one-request-per-second throttle, and retries only for HTTP 429 and 5xx responses. `src/pipeline/storage.py` converts AESO string values into typed raw tables while preserving the original response as JSON for auditability. `dbt/` then publishes staging and mart relations from the same project configuration in local DuckDB or production Postgres. Prefect tasks provide retryable orchestration and structured completion logs.

The dashboard is a polished local preview of the downstream product surface. Its chart and status panels use a deterministic seeded dataset until a production serving endpoint is wired; this keeps the frontend runnable without exposing database credentials in the browser.

## Quick start

```bash
cp .env.example .env
# set AESO_API_KEY in .env
uv sync --dev
uv run pytest
uv run python flows/backfill.py --start 2025-01-01 --end 2025-01-07
uv run dbt --project-dir dbt --profiles-dir . run
uv run dbt --project-dir dbt --profiles-dir . test
npm install
npm run dev
```

The local DuckDB file is created at `data/alberta_grid.duckdb`. Copy `profiles.yml.example` to `profiles.yml` if you want to customize the dbt profile. For production, set `DBT_TARGET=prod` and provide the Supabase/Postgres variables from `.env.example`; no API keys or database credentials are committed.

## Tests and observability

The extract/load tests cover response-path extraction, date chunking, retry behavior, and numeric normalization. Runtime logging records request parameters and row counts without logging the API key or raw credentials. Prefect task retries are separate from HTTP retries, so transient upstream failures and orchestration failures remain visible as distinct events.

## Repository map

| Path | Responsibility |
| --- | --- |
| `src/aeso/client.py` | AESO HTTP client, auth header, throttling, retry policy |
| `src/pipeline/storage.py` | DuckDB raw tables and type-safe loading |
| `flows/backfill.py` | Runnable Prefect backfill and supply snapshot flow tasks |
| `dbt/` | Shared DuckDB/Postgres transformations and tests |
| `tests/` | Extract/load unit tests |
| `src/app/` | Next.js 15/Recharts operations dashboard |
