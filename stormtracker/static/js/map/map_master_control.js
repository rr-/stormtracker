import { config } from "../config.js";
import { MapBaseControl } from "./map_base_control.js";
import { MapUI } from "./map_ui.js";

export class MapMasterControl extends MapBaseControl {
  constructor(map) {
    super();
    this.map = map;
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

    this.ui = new MapUI(this);
  }

  handleStyleLoad() {
    this.removeDistractingIcons();
    this.updateMapBounds();
    this.isReady = true;
  }

  removeDistractingIcons() {
    for (let layerName of ["airport-label", "poi-label"]) {
      this.map.setPaintProperty(layerName, "icon-opacity", 0);
    }
  }

  handleLoad() {
    this.ui.load(this.map);
    this.updateMapBounds();
    window.setInterval(() => this.updateMapBounds(), 2000);
  }

  handleMapMove() {
    this.positionChanged = true;
  }

  handleMapZoom() {
    this.positionChanged = true;
  }

  updateMapBounds() {
    if (!this.positionChanged) {
      return;
    }

    this.positionChanged = false;

    const MapBounds = this.map.getBounds();
    this.bounds.west = MapBounds.getWest();
    this.bounds.north = MapBounds.getNorth();
    this.bounds.east = MapBounds.getEast();
    this.bounds.south = MapBounds.getSouth();

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

  isStrikeVisible(strike) {
    return (
      strike.lon > this.bounds.west &&
      strike.lon < this.bounds.east &&
      strike.lat < this.bounds.north &&
      strike.lat > this.bounds.south
    );
  }
}