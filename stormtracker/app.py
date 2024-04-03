import requests
from pathlib import Path
from flask import (
    Flask,
    current_app,
    jsonify,
    render_template,
    request,
    url_for,
)

from stormtracker.common import MAPBOX_ACCESS_TOKEN, ROOT_URL

app = Flask(__name__, static_url_path=f"{ROOT_URL}/static")


def dated_url_for(endpoint, **values):
    if endpoint == "static":
        if filename := values.get("filename"):
            static_folder = Path(current_app.static_folder)
            static_url = current_app.static_url_path
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
def override_url_for():
    return dict(url_for=dated_url_for)


@app.get("/")
def read_root():
    return render_template(
        "index.html",
        mapbox_access_token=MAPBOX_ACCESS_TOKEN,
        root_url=ROOT_URL,
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