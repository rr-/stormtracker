import { htmlToElement } from "../common.js";
import { isDark } from "../common.js";
import { config } from "../config.js";
import { getDistance } from "../math.js";

const ALL_ICONS = ["boar"];

class PlusImage {
  constructor(color, size, thickness) {
    this.color = color;
    this.size = size;
    this.thickness = thickness;
    this.width = this.size;
    this.height = this.size;
    this.data = new Uint8Array(this.width * this.height * 4);
  }

  onAdd(map) {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");

    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.thickness;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    this.data = ctx.getImageData(0, 0, this.width, this.height).data;
  }

  render() {
    return true;
  }
}

class UserMarkImage {
  constructor(icon, size) {
    this.icon = icon;
    this.size = size;
    this.width = this.size;
    this.height = this.size;
    this.data = new Uint8Array(this.width * this.height * 4);
  }

  onAdd(map) {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, this.width, this.height);
      this.data = ctx.getImageData(0, 0, this.width, this.height).data;
    };
    img.src = `/static/img/${this.icon}.svg`;
  }

  render() {
    return true;
  }
}

export class UserMarksLayer {
  constructor(control) {
    this.control = control;

    this.lastId = 0;
    this.geojson = { type: "FeatureCollection", features: [] };

    config.addEventListener("save", (event) => this.handleConfigChange(event));
    control.map.on("style.load", () => this.handleStyleLoad());
    control.userMarks.addEventListener("update", (event) =>
      this.handleUserMarks(event)
    );
  }

  handleConfigChange(event) {
    if (!config.hasChanged(event, (cfg) => cfg.userMarks.enabled)) {
      return;
    }

    if (this.control.map.getLayer(this.layerName)) {
      this.control.map.setLayoutProperty(
        this.layerName,
        "visibility",
        config.userMarks.enabled ? "visible" : "none"
      );
    }
  }

  handleStyleLoad() {
    this.loadImages();

    this.control.map.addSource(this.sourceName, {
      type: "geojson",
      data: this.geojson,
    });

    this.control.map.addLayer({
      id: this.layerName,
      type: "symbol",
      layout: {
        "icon-size": 1,
        "icon-allow-overlap": true,
        "icon-image": ["get", "icon"],
        "text-field": ["get", "username"],
        "text-anchor": "left",
        "text-size": config.userMarks.textSize,
        visibility: config.userMarks.enabled ? "visible" : "none",
      },
      paint: {
        "text-color": isDark() ? "white" : "black",
        "text-translate": [config.userMarks.size * 1.25, 0],
        "text-translate-anchor": "viewport",
      },
      source: this.sourceName,
    });
  }

  handleUserMarks(event) {
    const marks = event.detail.marks;
    this.geojson.features = marks
      .filter((mark) => mark.username !== config.userMarks.username)
      .map((mark) => this.markToFeature(mark));
    this.updateSource();
  }

  updateSource() {
    const source = this.control.map.getSource(this.sourceName);
    if (source) {
      source.setData(this.geojson);
    }
  }

  markToFeature(mark) {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [mark.lon, mark.lat],
      },
      properties: {
        icon: mark.icon ?? "boar",
        username: mark.username,
      },
    };
  }

  loadImages() {
    for (const icon of ALL_ICONS) {
      this.control.map.addImage(icon, new UserMarkImage(icon, 24));
    }
  }

  get sourceName() {
    return `user-marks-source`;
  }

  get layerName() {
    return `user-marks-circles-layer`;
  }
}
