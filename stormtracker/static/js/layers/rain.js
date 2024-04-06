import { config } from "../config.js";

export class RainLayer {
  constructor(control) {
    this.control = control;

    this.sourceName = "rain-source";
    this.layerName = "rain-layer";
    this.lastKnownUrl = null;

    control.map.on("style.load", () => this.handleStyleLoad());
    control.rain.addEventListener("tiles", (event) =>
      this.handleTiles(event.detail.url)
    );
    config.addEventListener("save", () => this.handleConfigChange());
  }

  handleStyleLoad() {
    if (this.lastKnownUrl) {
      this.handleTiles(this.lastKnownUrl);
      this.handleConfigChange();
    }
  }

  handleConfigChange() {
    const layer = this.control.map.getLayer(this.layerName);
    if (layer) {
      this.control.map.setLayoutProperty(
        this.layerName,
        "visibility",
        config.rain.enabled ? "visible" : "none"
      );
    }
  }

  handleTiles(url) {
    this.lastKnownUrl = url;

    let source = this.control.map.getSource(this.sourceName);
    if (source) {
      source.setTiles([url]);
      return;
    }

    this.control.map.addSource(this.sourceName, {
      type: "raster",
      tiles: [url],
    });

    this.control.map.addLayer({
      id: this.layerName,
      type: "raster",
      source: this.sourceName,
      paint: {
        "raster-opacity": config.rain.opacity,
      },
    });

    for (let referenceLayer of ["road-label", "road-label-navigation"]) {
      if (this.control.map.getLayer(referenceLayer)) {
        this.control.map.moveLayer(this.layerName, referenceLayer);
      }
    }
  }
}
