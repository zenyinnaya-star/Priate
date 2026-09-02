select
    begin_datetime_utc,
    begin_datetime_mpt,
    pool_price,
    forecast_pool_price,
    rolling_30day_avg,
    pool_price - forecast_pool_price as forecast_variance,
    date_trunc('day', begin_datetime_utc) as operating_day_utc,
    extract(hour from begin_datetime_utc) as hour_utc
from {{ ref('stg_pool_prices') }}
