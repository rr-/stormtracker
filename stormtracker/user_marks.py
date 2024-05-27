import pickle

from stormtracker.redis import get_all_keys, redis_client

type UserMark = dict[str, str]


def get_user_marks() -> list[UserMark]:
    return [
        pickle.loads(redis_client.get(key))
        for key in get_all_keys(pattern="user-mark-*")
    ]


def update_user_mark(username: str, data: UserMark) -> None:
    redis_client.set(f"user-mark-{username}", pickle.dumps(data))
    redis_client.expire(f"user-mark-{username}", 24 * 3600)


def get_user_mark(username: str) -> UserMark | None:
    if data := redis_client.get(f"user-mark-{username}"):
        return pickle.loads(data)
    return None
