import os
from random import randint

ROOT_URL = os.environ.get("ROOT_URL", "")
MAPBOX_ACCESS_TOKEN = os.environ["MAPBOX_ACCESS_TOKEN"]
VERSION = randint(1, 100_000)
