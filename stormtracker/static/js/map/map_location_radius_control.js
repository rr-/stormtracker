import { config } from "../config.js";
import { MapBaseControl } from "./map_base_control.js";
import { isDark } from "./utils.js";

export class MapLocationRadiusControl extends MapBaseControl {
  constructor(masterControl) {
    super();
    this.masterControl = masterControl;
    this.masterControl.geolocation.addEventListener("update", (event) =>
      this.handleGeolocationUpdate(event.detail)
    );
    this.map = masterControl.map;
    this.map.on("style.load", () => this.handleStyleLoad());

    this.steps = [
      {
        radius: 10000,
        colorDark: "#44dd00",
        colorLight: "#00aa00",
        opacity: 1.0,
      },
      {
        radius: 25000,
        colorDark: "#ffdd00",
        colorLight: "#ccaa00",
        opacity: 0.8,
      },
      {
        radius: 50000,
        colorDark: "#ff8800",
        colorLight: "#ff8800",
        opacity: 0.6,
      },
      {
        radius: 75000,
        colorDark: "#ff0000",
        colorLight: "#ff0000",
        opacity: 0.4,
      },
    ];
    this.geojson = { type: "FeatureCollection", features: [] };

    config.addEventListener("save", () => this.handleConfigChange());
  }

  get isEnabled() {
    return config.rangeCirclesEnabled;
  }

  get sourceName() {
    return "locationRadiusSource";
  }

  get layerNameCircles() {
    return "locationRadiusCirclesLayer";
  }

  get layerNameLabels() {
    return "locationRadiusLabelsLayer";
  }

  handleConfigChange() {
    for (const layer of [this.layerNameCircles, this.layerNameLabels]) {
      if (this.map.getLayer(layer)) {
        this.map.setLayoutProperty(
          layer,
          "visibility",
          this.isEnabled ? "visible" : "none"
        );
      }
    }
    this.sync();
  }

  handleStyleLoad() {
    this.map.addSource(this.sourceName, {
      type: "geojson",
      data: this.geojson,
    });

    this.map.addLayer({
      id: this.layerNameCircles,
      type: "line",
      source: this.sourceName,
      paint: {
        "line-width": 1,
        "line-color": [
          "get",
          isDark() ? "colorDark" : "colorLight",
          ["at", ["get", "index"], ["literal", this.steps]],
        ],
        "line-opacity": [
          "get",
          "opacity",
          ["at", ["get", "index"], ["literal", this.steps]],
        ],
      },
    });

    this.map.addLayer({
      id: this.layerNameLabels,
      type: "symbol",
      source: this.sourceName,
      paint: {
        "text-color": [
          "get",
          isDark() ? "colorDark" : "colorLight",
          ["at", ["get", "index"], ["literal", this.steps]],
        ],
      },
      layout: {
        "text-field": ["get", "text"],
        "text-size": 12,
        "text-anchor": "bottom",
        "text-rotation-alignment": "auto",
        "text-allow-overlap": true,
      },
    });

    this.handleConfigChange();
  }

  handleGeolocationUpdate(position) {
    this.sync();
  }

  sync() {
    if (!this.isEnabled) {
      return;
    }

    this.geojson = this.createGeoJSON(
      this.masterControl.geolocation.lastKnownPosition
    );

    const source = this.map.getSource(this.sourceName);
    if (source) {
      source.setData(this.geojson);
    }
  }

  createGeoJSON(center) {
    const features = [];

    if (center) {
      for (const [i, step] of this.steps.entries()) {
        const numPoints = 64;
        const points = [...new Array(numPoints)].map((_, i) =>
          this.shiftCircle(center, step.radius, (i / numPoints) * (2 * Math.PI))
        );
        points.push(points[0]);

        features.push({
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [points],
          },
          properties: { index: i },
        });

        const [labelX, labelY] = this.shiftCircle(
          center,
          step.radius,
          Math.PI / 2
        );
        features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [labelX, labelY],
          },
          properties: {
            index: i,
            text: `${step.radius / 1000} km`,
          },
        });
      }
    }

    return { type: "FeatureCollection", features: features };
  }

  shiftCircle(center, radius, theta) {
    const radiusInKm = radius / 1000;
    const distanceX =
      radiusInKm / (111.32 * Math.cos((center.lat * Math.PI) / 180));
    const distanceY = radiusInKm / 110.574;
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    return [center.lon + x, center.lat + y];
  }
}
