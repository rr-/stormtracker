import redis

redis_client = redis.StrictRedis(host="redis", port=6379)


def get_all_keys(pattern: str) -> list[str]:
    cursor = 0
    keys: list[str] = []
    while True:
        cursor, partial_keys = redis_client.scan(
            cursor, match=pattern, count=1000
        )
        keys.extend(partial_keys)
        if cursor == 0:
            break
    return keys
