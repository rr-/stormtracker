import { config } from "./config.js";
import { CameraFollowState } from "./config.js";
import { CameraController } from "./controllers/camera.js";
import { GeolocationController } from "./controllers/geolocation.js";
import { NavigationController } from "./controllers/navigation.js";
import { RainController } from "./controllers/rain.js";
import { StrikesHistoricController } from "./controllers/strikes_historic.js";
import { StrikesLiveController } from "./controllers/strikes_live.js";

export class MapControl {
  constructor(map) {
    this.map = map;

    this.geolocation = new GeolocationController();
    this.navigation = new NavigationController();
    this.strikesLive = new StrikesLiveController();
    this.strikesHistoric = new StrikesHistoricController();
    this.rain = new RainController();
    this.camera = new CameraController(map, this.geolocation);

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
  }

  handleStyleLoad() {
    this.updateMapBounds();
    this.isReady = true;
  }

  handleLoad() {
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

  toggleNorthUp(enable) {
    config.northUpEnabled =
      enable !== undefined ? enable : !config.northUpEnabled;
    config.save();
  }

  toggleRain(enable) {
    config.rain.enabled = enable !== undefined ? enable : !config.rain.enabled;
    config.save();
  }

  toggleAlwaysOn(enable) {
    config.alwaysOnEnabled =
      enable !== undefined ? enable : !config.alwaysOnEnabled;
    config.save();
  }

  toggleRangeCircles(enable) {
    config.rangeCirclesEnabled =
      enable !== undefined ? enable : !config.rangeCirclesEnabled;
    config.save();
  }

  toggleRangePolygons(enable) {
    config.rangePolygonsEnabled =
      enable !== undefined ? enable : !config.rangePolygonsEnabled;
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
      config.cameraFollowState = CameraFollowState.Disabled;
    }
    config.save();
  }

  toggleFollow(newState) {
    const oldState = config.cameraFollowState;
    if (newState === undefined) {
      newState = {
        [CameraFollowState.Disabled]: CameraFollowState.Enabled,
        [CameraFollowState.Enabled]: CameraFollowState.Disabled,
        [CameraFollowState.Paused]: CameraFollowState.Enabled,
      }[oldState];
    }

    config.cameraFollowState = newState;
    if (config.cameraFollowState !== CameraFollowState.Disabled) {
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
