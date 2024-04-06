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
    this.geojson = new Array(this.maxChunks)
      .fill()
      .map(() => ({ type: "FeatureCollection", features: [] }));

    config.addEventListener("save", () => this.handleConfigChange());
    control.map.on("style.load", () => this.handleStyleLoad());
    control.strikesHistoric.addEventListener("strikes", (event) =>
      this.handleStrikes(event)
    );
  }

  handleConfigChange() {
    for (let n = 0; n < this.maxChunks; n++) {
      if (this.control.map.getLayer(this.layerName(n))) {
        this.control.map.setLayoutProperty(
          this.layerName(n),
          "visibility",
          config.strikeMarkers.enabled ? "visible" : "none"
        );
      }
    }
  }

  handleStyleLoad() {
    this.loadImages();

    for (let n = this.maxChunks - 1; n >= 0; n--) {
      this.control.map.addSource(this.sourceName(n), {
        type: "geojson",
        data: this.geojson[n],
      });

      const plusId = config.strikeMarkers.chunkMarkers[n];

      this.control.map.addLayer({
        id: this.layerName(n),
        type: "symbol",
        paint: {
          "icon-opacity": config.strikeMarkers.opacity,
        },
        layout: {
          "icon-image": {
            stops: config.strikeMarkers.plusResolutions.map((res) => [
              res.mapZoom,
              `plus-${plusId}-${res.mapZoom}`,
            ]),
          },
          "icon-size": 1,
          "icon-allow-overlap": true,
        },
        source: this.sourceName(n),
      });
    }

    this.handleConfigChange();
  }

  handleStrikes(event) {
    const n = event.detail.chunk;
    const strikes = event.detail.strikes;
    this.geojson[n] = {
      type: "FeatureCollection",
      features: strikes.map(this.strikeToFeature),
    };
    this.updateSource(n);
  }

  updateSource(n) {
    const source = this.control.map.getSource(this.sourceName(n));
    if (source) {
      source.setData(this.geojson[n]);
    }
  }

  sourceName(n) {
    return `history-${n}-source`;
  }

  layerName(n) {
    return `history-${n}-layer`;
  }

  strikeToFeature(strike) {
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [strike.lon, strike.lat],
      },
    };
  }

  loadImages() {
    for (let [n, color] of config.strikeMarkers.plusColors.entries()) {
      for (let res of config.strikeMarkers.plusResolutions) {
        this.control.map.addImage(
          `plus-${n}-${res.mapZoom}`,
          new PlusImage(color, res.size, res.thickness)
        );
      }
    }
  }
}
