import { config } from "../config.js";
import { StrikesHistoricController } from "../controllers/strikes_historic.js";

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

export class StrikesHistoricLayer {
  constructor(control) {
    this.control = control;

    this.maxChunks = StrikesHistoricController.maxChunks;
    this.geojson = { type: "FeatureCollection", features: [] };

    config.addEventListener("save", () => this.handleConfigChange());
    control.map.on("style.load", () => this.handleStyleLoad());
    control.strikesHistoric.addEventListener("strikes", (event) =>
      this.handleStrikes(event)
    );
  }

  handleConfigChange() {
    if (this.control.map.getLayer(this.layerName)) {
      this.control.map.setLayoutProperty(
        this.layerName,
        "visibility",
        config.strikeMarkers.enabled ? "visible" : "none"
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
      paint: {
        "icon-opacity": config.strikeMarkers.opacity,
      },
      layout: {
        "icon-image": {
          stops: config.strikeMarkers.plusResolutions.map((res) => [
            res.mapZoom,
            `plus-{chunk}-${res.mapZoom}`,
          ]),
        },
        "icon-size": 1,
        "icon-allow-overlap": true,
        "symbol-sort-key": ["-", ["get", "n"]],
      },
      source: this.sourceName,
    });

    this.handleConfigChange();
  }

  handleStrikes(event) {
    const n = event.detail.n;
    const strikes = event.detail.strikes;
    this.geojson.features = [
      ...this.geojson.features.filter((feature) => feature.properties.n !== n),
      ...strikes.map((strike) => this.strikeToFeature(strike, n)),
    ];
    this.updateSource();
  }

  updateSource() {
    const source = this.control.map.getSource(this.sourceName);
    if (source) {
      source.setData(this.geojson);
    }
  }

  get sourceName() {
    return `strike-history-source`;
  }

  get layerName() {
    return `strike-history-layer`;
  }

  strikeToFeature(strike, n) {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [strike.lon, strike.lat],
      },
      properties: { n, chunk: config.strikeMarkers.chunkMarkers[n] },
    };
  }

  loadImages() {
    for (let [chunk, color] of config.strikeMarkers.plusColors.entries()) {
      for (let res of config.strikeMarkers.plusResolutions) {
        this.control.map.addImage(
          `plus-${chunk}-${res.mapZoom}`,
          new PlusImage(color, res.size, res.thickness)
        );
      }
    }
  }
}
