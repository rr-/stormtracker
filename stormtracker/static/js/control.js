import { config } from "./config.js";
import { GeolocationController } from "./controllers/geolocation.js";
import { RainController } from "./controllers/rain.js";
import { StrikesHistoricController } from "./controllers/strikes_historic.js";
import { StrikesLiveController } from "./controllers/strikes_live.js";

export class MapControl {
  constructor(map) {
    this.map = map;

    this.geolocation = new GeolocationController();
    this.strikesLive = new StrikesLiveController();
    this.strikesHistoric = new StrikesHistoricController();
    this.rain = new RainController();

    this.bounds = {
      north: 90,
      south: -90,
      west: -180,
      east: 180,
    };
    this.isReady = false;
    this.positionChanged = true;

    map.on("load", () => this.handleLoad());
    map.on("style.load", () => this.handleStyleLoad());
    map.on("moveend", () => this.handleMapMove());
    map.on("zoomed", () => this.handleMapZoom());
    config.addEventListener("save", () => this.handleConfigChange());
  }

  handleStyleLoad() {
    this.updateMapBounds();
    this.isReady = true;
  }

  handleLoad() {
    this.updateMapBounds();
    window.setInterval(() => this.updateMapBounds(), 2000);
  }

  handleConfigChange() {
    if (config.followEnabled) {
      const position = this.geolocation.lastKnownPosition;
      if (position) {
        this.map.easeTo({ center: [position.lon, position.lat] });
      }
    } else if (!config.followEnabled) {
      this.map.dragPan.enable();
    }
  }

  handleMapMove() {
    this.positionChanged = true;
  }

  handleMapZoom() {
    this.positionChanged = true;
    window.setTimeout(() => {
      const position = this.geolocation.lastKnownPosition;
      if (position && config.followEnabled) {
        this.map.easeTo({ center: [position.lon, position.lat] });
      }
    }, 500);
  }

  updateMapBounds() {
    if (!this.positionChanged) {
      return;
    }

    this.positionChanged = false;

    const bounds = this.map.getBounds();
    this.bounds.west = bounds.getWest();
    this.bounds.north = bounds.getNorth();
    this.bounds.east = bounds.getEast();
    this.bounds.south = bounds.getSouth();

    config.startPos.lon = this.map.getCenter().lng;
    config.startPos.lat = this.map.getCenter().lat;
    config.startZoom = this.map.getZoom();
    config.save();
  }

  cycleMapStyle() {
    this.switchMapStyle((config.mapStyle + 1) % config.mapStyles.length);
  }

  toggleAudio(enable) {
    config.audioEnabled = enable !== undefined ? enable : !config.audioEnabled;
    config.save();
  }

  toggleRain(enable) {
    config.rain.enabled = enable !== undefined ? enable : !config.rain.enabled;
    config.save();
  }

  toggleRangeCircles(enable) {
    config.rangeCirclesEnabled =
      enable !== undefined ? enable : !config.rangeCirclesEnabled;
    config.save();
  }

  toggleStrikes(enable) {
    config.strikeMarkers.enabled =
      enable !== undefined ? enable : !config.strikeMarkers.enabled;
    config.liveMarkers.enabled = config.strikeMarkers.enabled;
    config.save();
  }

  toggleTrack(enable) {
    config.trackEnabled = enable !== undefined ? enable : !config.trackEnabled;
    if (!config.trackEnabled) {
      config.followEnabled = false;
    }
    config.save();
  }

  toggleFollow(enable) {
    config.followEnabled =
      enable !== undefined ? enable : !config.followEnabled;
    if (config.followEnabled) {
      config.trackEnabled = true;
    }
    config.save();
  }

  switchMapStyle(index) {
    this.map.setStyle(config.mapStyles[index].style);
    document.body.dataset.style = config.mapStyles[index].name;
    config.mapStyle = index;
    config.save();
  }

  isPointVisible(strike) {
    return (
      strike.lon > this.bounds.west &&
      strike.lon < this.bounds.east &&
      strike.lat < this.bounds.north &&
      strike.lat > this.bounds.south
    );
  }
}
