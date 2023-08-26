#!/usr/bin/env python3
import os

import requests
from flask import Flask, jsonify, render_template, request

BASE_DIR = os.environ.get("STORMTRACKER_BASE_DIR", "")
MAPBOX_ACCESS_TOKEN=os.environ["STORMTRACKER_MAPBOX_ACCESS_TOKEN"]
app = Flask(__name__, static_url_path=f"{BASE_DIR}/static")


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
