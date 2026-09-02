select
    begin_datetime_utc,
    cast(begin_datetime_mpt as varchar) as begin_datetime_mpt,
    cast(pool_price as double) as pool_price,
    cast(forecast_pool_price as double) as forecast_pool_price,
    cast(rolling_30day_avg as double) as rolling_30day_avg,
    ingested_at
from raw_pool_prices
