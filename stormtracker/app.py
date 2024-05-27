from datetime import datetime
from functools import wraps
from pathlib import Path
from time import time

import requests
from flask import (
    Flask,
    current_app,
    jsonify,
    render_template,
    request,
    send_from_directory,
    url_for,
)

from stormtracker.common import MAPBOX_ACCESS_TOKEN, ROOT_URL, VERSION
from stormtracker.user_marks import (
    get_user_mark,
    get_user_marks,
    update_user_mark,
)

app = Flask(__name__, static_url_path=f"{ROOT_URL}/static")


def ttl_cache(seconds):
    def decorator(func):
        cache = {}

        @wraps(func)
        def wrapper(*args, **kwargs):
            key = (args, tuple(kwargs.items()))
            if key in cache and time() - cache[key][1] <= seconds:
                return cache[key][0]
            result = func(*args, **kwargs)
            cache[key] = (result, time())
            return result

        return wrapper

    return decorator


def dated_url_for(endpoint, **values):
    if endpoint == "static":
        if filename := values.get("filename"):
            static_folder = Path(current_app.static_folder)
            fingerprint = get_file_fingerprint(static_folder, filename)
            return url_for(endpoint, **values) + "?q=" + fingerprint
    return url_for(endpoint, **values)


def get_file_fingerprint(static_folder: Path, filename: str) -> str | None:
    path = static_folder / filename
    if path.exists():
        modified_time = int(path.stat().st_mtime)
        return str(modified_time)
    return None


@app.context_processor
def override_context():
    return dict(
        url_for=dated_url_for,
        mapbox_access_token=MAPBOX_ACCESS_TOKEN,
        root_url=ROOT_URL,
        version=VERSION,
    )


@app.route("/js/<string:version>/<path:filename>")
def route_js(version: str, filename: str):
    return send_from_directory(app.static_folder, f"js/{filename}")


@app.get("/")
def route_root():
    return render_template(
        "index.html",
    )


@ttl_cache(seconds=15)
def proxy_blitzortung(n: int):
    response = requests.get(
        f"https://map.blitzortung.org/GEOjson/getjson.php?f=s&n={n:02d}",
        headers={"Referer": "https://map.blitzortung.org/"},
    )
    return response.json()


@app.get("/blitzortung-geojson/")
def route_blitzortung_geojson():
    try:
        n = int(request.args.get("n"))
    except (TypeError, ValueError):
        return jsonify([]), 400
    return proxy_blitzortung(n)


@app.get("/user-marks/")
def route_user_marks():
    return jsonify(get_user_marks()), 200


@app.put("/user-marks/")
def route_user_marks_update():
    username = request.json.get("username")
    position = request.json.get("position")
    if not username:
        return jsonify({}), 400
    if not position:
        return jsonify({}), 400
    data = {
        **position,
        "username": username,
        "time": datetime.now(),
    }
    update_user_mark(username, data)
    return jsonify(get_user_mark(username)), 200
