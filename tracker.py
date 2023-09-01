#!/usr/bin/env python3
import os

import requests
from flask import (
    Flask,
    current_app,
    jsonify,
    render_template,
    request,
    url_for,
)

BASE_DIR = os.environ.get("STORMTRACKER_BASE_DIR", "")
MAPBOX_ACCESS_TOKEN = os.environ["STORMTRACKER_MAPBOX_ACCESS_TOKEN"]
app = Flask(__name__, static_url_path=f"{BASE_DIR}/static")


def dated_url_for(endpoint, **values):
    if endpoint == "static":
        if filename := values.get("filename"):
            static_folder = current_app.static_folder
            static_url = current_app.static_url_path
            fingerprint = get_file_fingerprint(static_folder, filename)
            return url_for(endpoint, **values) + "?q=" + fingerprint
    return url_for(endpoint, **values)


def get_file_fingerprint(static_folder, filename):
    filepath = os.path.join(static_folder, filename)
    if os.path.exists(filepath):
        modified_time = int(os.path.getmtime(filepath))
        return str(modified_time)
    return None


@app.context_processor
def override_url_for():
    return dict(url_for=dated_url_for)


@app.get("/")
def read_root():
    return render_template(
        "index.html",
        mapbox_access_token=MAPBOX_ACCESS_TOKEN,
        base_dir=BASE_DIR,
    )


@app.get("/blitzortung-geojson/")
def read_blitzortung_geojson():
    try:
        n = int(request.args.get("n"))
    except (TypeError, ValueError):
        return jsonify([]), 400
    response = requests.get(
        f"https://map.blitzortung.org/GEOjson/getjson.php?f=s&n={n:02d}",
        headers={"Referer": "https://map.blitzortung.org/"},
    )
    return response.json()
