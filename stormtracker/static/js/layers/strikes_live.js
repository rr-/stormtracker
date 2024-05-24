import { htmlToElement } from "../common.js";
import { isDark } from "../common.js";
import { config } from "../config.js";
import { getDistance } from "../math.js";
import { formatDistance } from "../math.js";

export class StrikesLiveLayer {
  constructor(control) {
    this.control = control;

    this.lastId = 0;
    this.geojson = { type: "FeatureCollection", features: [] };

    config.addEventListener("save", (event) => this.handleConfigChange(event));
    control.map.on("style.load", () => this.handleStyleLoad());
    control.strikesLive.addEventListener("strike", (event) =>
      this.handleStrike(event)
    );

    window.requestAnimationFrame(() => this.animate());
  }

  animate() {
    try {
      for (const feature of this.geojson.features) {
        const time =
          Math.min(
            config.liveMarkers.timeAnimate,
            performance.now() - feature.properties.start
          ) / config.liveMarkers.timeAnimate;
        this.control.map.setFeatureState(
          { source: this.sourceName, id: feature.id },
          { time }
        );
      }
    } catch (err) {}
    window.requestAnimationFrame(() => this.animate());
  }

  handleConfigChange(event) {
    if (!config.hasChanged(event, (cfg) => cfg.liveMarkers.enabled)) {
      return;
    }

    for (const layerName of [this.layerNameCircles, this.layerNameText]) {
      if (this.control.map.getLayer(layerName)) {
        this.control.map.setLayoutProperty(
          layerName,
          "visibility",
          config.liveMarkers.enabled ? "visible" : "none"
        );
      }
    }
  }

  handleStyleLoad() {
    this.control.map.addSource(this.sourceName, {
      type: "geojson",
      data: this.geojson,
    });

    this.control.map.addLayer({
      id: this.layerNameCircles,
      type: "circle",
      paint: {
        "circle-radius": [
          "+",
          config.liveMarkers.minSize,
          [
            "*",
            config.liveMarkers.maxSize - config.liveMarkers.minSize,
            ["-", 1, ["feature-state", "time"]],
          ],
        ],
        "circle-opacity": ["-", 1, ["feature-state", "time"]],
        "circle-stroke-width": [
          "-",
          config.liveMarkers.maxBorder,
          [
            "*",
            config.liveMarkers.maxBorder - config.liveMarkers.minBorder,
            ["feature-state", "time"],
          ],
        ],
        "circle-stroke-color": isDark() ? "white" : "black",
        "circle-color": isDark()
          ? "rgba(255, 255, 255, 0.5)"
          : "rgba(0, 0, 0, 0.5)",
      },
      layout: {
        visibility: config.liveMarkers.enabled ? "visible" : "none",
      },
      source: this.sourceName,
    });

    this.control.map.addLayer({
      id: this.layerNameText,
      type: "symbol",
      layout: {
        "text-field": ["get", "distance"],
        "text-anchor": "left",
        "text-size": 12,
        visibility: config.liveMarkers.enabled ? "visible" : "none",
      },
      paint: {
        "text-color": isDark() ? "white" : "black",
        "text-translate": [config.liveMarkers.minSize * 1.5, 0],
        "text-translate-anchor": "viewport",
      },
      source: this.sourceName,
    });
  }

  handleStrike(event) {
    const strike = event.detail.strike;
    if (!this.control.isPointVisible(strike) || !this.control.isReady) {
      return;
    }

    this.geojson.features = [
      ...this.geojson.features.slice(-config.liveMarkers.maxCount),
      this.strikeToFeature(strike),
    ];
    this.updateSource();
  }

  updateSource() {
    const source = this.control.map.getSource(this.sourceName);
    if (source) {
      source.setData(this.geojson);
    }
  }

  strikeToFeature(strike) {
    return {
      id: this.lastId++,
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [strike.lon, strike.lat],
      },
      properties: {
        start: performance.now(),
        distance: this.control.geolocation.currentPosition
          ? formatDistance(
              getDistance(this.control.geolocation.currentPosition, strike)
            )
          : null,
      },
    };
  }

  get sourceName() {
    return `strike-live-source`;
  }

  get layerNameText() {
    return `strike-live-text-layer`;
  }

  get layerNameCircles() {
    return `strike-live-circles-layer`;
  }
}
