import { config } from "../config.js";
import { MapBaseControl } from "./map_base_control.js";
import { isDark } from "./utils.js";

export class MapLocationRadiusControl extends MapBaseControl {
  constructor(masterControl) {
    super();
    this.masterControl = masterControl;
    this.masterControl.ui.geolocate.addEventListener("geolocate", (event) =>
      this.handleGeolocate(event.detail)
    );
    this.map = masterControl.map;
    this.map.on("style.load", () => this.handleStyleLoad());

    this.circles = [
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
    ].map((props) => ({
      ...props,
      geojsonCircle: this.createGeoJSONCircle([0, -90], props.radius),
      geojsonLabel: this.createGeoJSONLabel([0, -90], props.radius),
    }));

    config.addEventListener("save", () => this.handleConfigChange());
  }

  get isEnabled() {
    return config.rangeCirclesEnabled;
  }

  get layerNames() {
    const ret = [];
    for (const [n, circle] of this.circles.entries()) {
      ret.push(this.layerNameCircle(n));
      ret.push(this.layerNameLabel(n));
    }
    return ret;
  }

  handleConfigChange() {
    for (const layerName of this.layerNames) {
      if (this.map.getLayer(layerName)) {
        this.map.setLayoutProperty(
          layerName,
          "visibility",
          this.isEnabled ? "visible" : "none"
        );
      }
    }
  }

  handleStyleLoad() {
    for (const [n, circle] of this.circles.entries()) {
      this.map.addSource(this.sourceNameCircle(n), {
        type: "geojson",
        data: circle.geojsonCircle,
      });

      this.map.addSource(this.sourceNameLabel(n), {
        type: "geojson",
        data: circle.geojsonLabel,
      });

      this.map.addLayer({
        id: this.layerNameCircle(n),
        type: "line",
        source: this.sourceNameCircle(n),
        paint: {
          "line-width": 1,
          "line-color": isDark() ? circle.colorDark : circle.colorLight,
          "line-opacity": circle.opacity,
        },
      });

      this.map.addLayer({
        id: this.layerNameLabel(n),
        type: "symbol",
        source: this.sourceNameLabel(n),
        paint: {
          "text-color": isDark() ? circle.colorDark : circle.colorLight,
        },
        layout: {
          "text-field": ["get", "t"],
          "text-size": 12,
          "text-anchor": "bottom",
          "text-rotation-alignment": "auto",
          "text-allow-overlap": true,
        },
      });
    }

    this.handleConfigChange();
  }

  handleGeolocate(position) {
    this.lastKnownPosition = position;
    for (let [n, circle] of this.circles.entries()) {
      circle.geojsonCircle = this.createGeoJSONCircle(position, circle.radius);
      const sourceCircle = this.map.getSource(this.sourceNameCircle(n));
      if (sourceCircle) {
        sourceCircle.setData(circle.geojsonCircle);
      }

      circle.geojsonLabel = this.createGeoJSONLabel(position, circle.radius);
      const sourceLabel = this.map.getSource(this.sourceNameLabel(n));
      if (sourceLabel) {
        sourceLabel.setData(circle.geojsonLabel);
      }
    }
  }

  sourceNameCircle(n) {
    return `location-radius-circle-${n}-source`;
  }

  sourceNameLabel(n) {
    return `location-radius-label-${n}-source`;
  }

  layerNameCircle(n) {
    return `location-radius-circle-${n}`;
  }

  layerNameLabel(n) {
    return `location-radius-label-${n}`;
  }

  createGeoJSONCircle(center, radiusInM, numPoints) {
    if (!numPoints) {
      numPoints = 64;
    }

    const points = [...new Array(numPoints)].map((_, i) =>
      this.shiftCircle(center, radiusInM, (i / numPoints) * (2 * Math.PI))
    );
    points.push(points[0]);

    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [points],
          },
        },
      ],
    };
  }

  createGeoJSONLabel(center, radiusInM) {
    const [x, y] = this.shiftCircle(center, radiusInM, Math.PI / 2);
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [x, y],
          },
          properties: {
            t: `${radiusInM / 1000} km`,
          },
        },
      ],
    };
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
