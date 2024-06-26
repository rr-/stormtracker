import { throttleAsync } from "../common.js";
import { isDark } from "../common.js";
import { config } from "../config.js";

export class LocationReachabilityLayer {
  constructor(control) {
    this.control = control;

    this.steps = [
      {
        minutes: 10,
        colorDark: "#44dd00",
        colorLight: "#00aa00",
        opacity: 1.0,
      },
      {
        minutes: 20,
        colorDark: "#ffdd00",
        colorLight: "#ccaa00",
        opacity: 0.8,
      },
      {
        minutes: 40,
        colorDark: "#ff8800",
        colorLight: "#ff8800",
        opacity: 0.6,
      },
      {
        minutes: 60,
        colorDark: "#ff0000",
        colorLight: "#ff0000",
        opacity: 0.4,
      },
    ];

    this.throttledFetchGeoJSON = throttleAsync(
      async (...args) => await this.fetchGeoJSON(...args),
      10000
    );

    control.map.on("style.load", () => this.handleStyleLoad());
    control.geolocation.addEventListener("update", () =>
      this.handleGeolocationUpdate()
    );
    config.addEventListener("save", () => this.handleConfigChange());
  }

  get isEnabled() {
    return config.rangePolygonsEnabled;
  }

  get sourceName() {
    return "reachabilitySource";
  }

  get layerName() {
    return "reachabilityLayer";
  }

  get stepsMap() {
    return Object.fromEntries(this.steps.map((step) => [step.minutes, step]));
  }

  handleConfigChange() {
    if (this.control.map.getLayer(this.layerName)) {
      this.control.map.setLayoutProperty(
        this.layerName,
        "visibility",
        this.isEnabled ? "visible" : "none"
      );
    }
    this.sync();
  }

  handleStyleLoad() {
    this.control.map.addSource(this.sourceName, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });

    this.control.map.addLayer({
      id: this.layerName,
      type: "line",
      source: this.sourceName,
      paint: {
        "line-color": [
          "get",
          isDark ? "colorDark" : "colorLight",
          [
            "get",
            ["to-string", ["get", "contour"]],
            ["literal", this.stepsMap],
          ],
        ],
        "line-opacity": [
          "get",
          "opacity",
          [
            "get",
            ["to-string", ["get", "contour"]],
            ["literal", this.stepsMap],
          ],
        ],
      },
    });

    this.handleConfigChange();
  }

  handleGeolocationUpdate() {
    this.sync();
  }

  async sync() {
    if (!this.isEnabled || !this.control.geolocation.currentPosition) {
      return;
    }

    const result = await this.throttledFetchGeoJSON(
      this.control.geolocation.currentPosition
    );
    if (result) {
      const source = this.control.map.getSource(this.sourceName);
      if (source) {
        source.setData(result);
      }
    }
  }

  async fetchGeoJSON(position) {
    console.log("Fetching isochrone data");
    const result = await fetch(
      `https://api.mapbox.com/isochrone/v1/mapbox/driving-traffic/${position.lon},${position.lat}` +
        `?contours_minutes=${this.steps
          .map((step) => step.minutes)
          .join(",")}` +
        `&contours_colors=${this.steps
          .map((step) =>
            (isDark ? step.colorDark : colorLight).replace("#", "")
          )
          .join(",")}` +
        `&access_token=${config.mapboxAccessToken}`
    );
    return await result.json();
  }
}
