import pickle
from datetime import datetime, timedelta

from stormtracker.redis import get_all_keys, redis_client

type UserMark = dict[str, str]
PREFIX = "user-mark-"


def get_user_marks() -> list[UserMark]:
    return [
        get_user_mark(key.replace(PREFIX, ""))
        for key in get_all_keys(pattern=f"{PREFIX}*")
    ]


def update_user_mark(username: str, data: UserMark) -> None:
    redis_client.set(f"{PREFIX}{username}", pickle.dumps(data))
    redis_client.expire(f"{PREFIX}{username}", 24 * 3600)


def get_user_mark(username: str) -> UserMark | None:
    if data := redis_client.get(f"{PREFIX}{username}"):
        result = pickle.loads(data)

        time = result["time"]
        diff = datetime.now() - time
        if diff < timedelta(days=1):
            result["time_fmt"] = time.strftime("%H:%M")
        else:
            result["time_fmt"] = time.strftime("%A %H:%M")

        return result
    return None
