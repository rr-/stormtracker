import { config } from "../config.js";
import { StrikesHistoricController } from "./controllers/strikes_historic.js";
import { MapBaseControl } from "./map_base_control.js";
import { PlusImage } from "./plus_image.js";

export class MapStrikeHistoryControl extends MapBaseControl {
  constructor(masterControl) {
    super();
    this.map = masterControl.map;
    this.map.on("style.load", () => this.handleStyleLoad());

    config.addEventListener("save", () => this.handleConfigChange());

    this.maxChunks = StrikesHistoricController.maxChunks;
    this.geojson = new Array(this.maxChunks)
      .fill()
      .map(() => ({ type: "FeatureCollection", features: [] }));
  }

  handleConfigChange() {
    for (let n = 0; n < this.maxChunks; n++) {
      if (this.map.getLayer(this.layerName(n))) {
        this.map.setLayoutProperty(
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
      this.map.addSource(this.sourceName(n), {
        type: "geojson",
        data: this.geojson[n],
      });

      const plusId = config.strikeMarkers.chunkMarkers[n];

      this.map.addLayer({
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

  handleStrikes(n, strikes) {
    this.geojson[n] = {
      type: "FeatureCollection",
      features: strikes.map(this.strikeToFeature),
    };
    this.updateSource(n);
  }

  updateSource(n) {
    const source = this.map.getSource(this.sourceName(n));
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
        this.map.addImage(
          `plus-${n}-${res.mapZoom}`,
          new PlusImage(color, res.size, res.thickness)
        );
      }
    }
  }
}
