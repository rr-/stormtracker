An app to help me chase storms that shows live strike data on a map.

Data source: Blitzortung  
Map provider: Mapbox GL

Usage:
```
python3 -m pip install --user requires.txt
export MAPBOX_ACCESS_TOKEN=…
python3 -m flask --app tracker:app run
