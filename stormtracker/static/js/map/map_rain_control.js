import { config } from "../config.js";
import { MapBaseControl } from "./map_base_control.js";

export class MapRainControl extends MapBaseControl {
  constructor(masterControl) {
    super();
    this.map = masterControl.map;
    this.map.on("style.load", () => this.handleStyleLoad());
    config.addEventListener("save", () => this.handleConfigChange());

    this.sourceName = "rain-source";
    this.layerName = "rain-layer";
    this.lastKnownUrl = null;
  }

  handleStyleLoad() {
    if (this.lastKnownUrl) {
      this.handleTiles(this.lastKnownUrl);
      this.handleConfigChange();
    }
  }

  handleConfigChange() {
    const layer = this.map.getLayer(this.layerName);
    if (layer) {
      this.map.setLayoutProperty(
        this.layerName,
        "visibility",
        config.rain.enabled ? "visible" : "none",
      );
    }
  }

  handleTiles(url) {
    this.lastKnownUrl = url;

    let source = this.map.getSource(this.sourceName);
    if (source) {
      source.setTiles([url]);
      return;
    }

    this.map.addSource(this.sourceName, {
      type: "raster",
      tiles: [url],
    });

    this.map.addLayer({
      id: this.layerName,
      type: "raster",
      source: this.sourceName,
      paint: {
        "raster-opacity": config.rain.opacity,
      },
    });

    for (let referenceLayer of ["road-label", "road-label-navigation"]) {
      if (this.map.getLayer(referenceLayer)) {
        this.map.moveLayer(this.layerName, referenceLayer);
      }
    }
  }
}
