import { config } from "../config.js";
import { CameraFollowState } from "../config.js";
import { fromMapboxPoint, getDistance } from "../math.js";

export class CameraController extends EventTarget {
  constructor(map, geolocation) {
    super();
    this.map = map;
    this.geolocation = geolocation;
    this.lastCameraFollowState = null;
    this.updateCameraInterval = null;

    this.targetZoom = null;
    this.targetPitch = null;
    this.targetPadding = null;
    this.targetBearing = null;

    config.addEventListener("save", (event) => this.handleConfigChange(event));
    map.on("movestart", (event) => this.handleMapZoom(event));
    map.on("move", (event) => this.handleMapMove(event));
    map.on("zoomstart", (event) => this.handleMapZoom(event));
    map.on("zoom", (event) => this.handleMapZoom(event));
  }

  get isSignificantlyOff() {
    const position = this.geolocation.lastKnownPosition;
    if (!position) {
      return true;
    }

    const bounds = this.map.getBounds();
    const topLeft = fromMapboxPoint(bounds.getNorthWest());
    const bottomRight = fromMapboxPoint(bounds.getSouthEast());
    const center = fromMapboxPoint(this.map.getCenter());
    const distance = getDistance(position, center);
    const diagonal = getDistance(topLeft, bottomRight);
    const ratio = distance / diagonal;
    return ratio > 0.05;
  }

  handleConfigChange() {
    if (config.hasChanged(event, (cfg) => cfg.cameraFollowState)) {
      if (config.cameraFollowState === CameraFollowState.Enabled) {
        this.startTracking();
      } else if (config.cameraFollowState === CameraFollowState.Paused) {
        this.pauseTracking();
      } else if (!config.cameraFollowState === CameraFollowState.Disabled) {
        this.stopTracking();
      }
    }

    let reset = false;
    if (config.hasChanged(event, (cfg) => cfg.pitchEnabled)) {
      reset = true;
      if (config.pitchEnabled) {
        this.targetPitch = 45;
        this.targetPadding = { top: document.body.scrollHeight / 3 };
      } else {
        this.targetPitch = 0;
        this.targetPadding = { top: 0 };
      }
    }

    if (config.hasChanged(event, (cfg) => cfg.northUpEnabled)) {
      reset = true;
      if (config.northUpEnabled) {
        this.targetBearing = 0;
      } else if (this.geolocation.lastKnownPosition?.bearing) {
        this.targetBearing = this.geolocation.lastKnownPosition?.bearing;
      }
    }

    if (reset) {
      this.updateCamera(true);
      this.restartInterval();
    }
  }

  handleMapMove(event) {
    if (!event.isCustom) {
      this.handleUserInteraction();
    }
  }

  handleMapZoom(event) {
    if (!event.isCustom) {
      this.handleUserInteraction();
    }
  }

  startTracking() {
    config.cameraFollowState = CameraFollowState.Enabled;
    config.save();
    this.dispatchEvent(new CustomEvent("start-tracking"));
    this.updateCamera(true);
    this.restartInterval();
  }

  stopTracking() {
    config.cameraFollowState = CameraFollowState.Disabled;
    config.save();
    this.dispatchEvent(new CustomEvent("stop-tracking"));
    this.stopInterval();
  }

  pauseTracking() {
    config.cameraFollowState = CameraFollowState.Paused;
    config.save();
    this.dispatchEvent(new CustomEvent("pause-tracking"));
    this.stopInterval();
  }

  resumeTracking() {
    config.cameraFollowState = CameraFollowState.Enabled;
    config.save();
    this.dispatchEvent(new CustomEvent("resume-tracking"));
    this.updateCamera(true);
    this.restartInterval();
  }

  handleUserInteraction() {
    if (
      this.isSignificantlyOff &&
      config.cameraFollowState === CameraFollowState.Enabled
    ) {
      this.pauseTracking();
    } else if (
      !this.isSignificantlyOff &&
      config.cameraFollowState == CameraFollowState.Paused
    ) {
      this.resumeTracking();
    }
    this.restartInterval();
  }

  stopInterval() {
    if (this.updateCameraInterval !== null) {
      window.clearInterval(this.updateCameraInterval);
      this.updateCameraInterval = null;
    }
  }

  restartInterval() {
    this.stopInterval();
    this.updateCameraInterval = window.setInterval(() => {
      this.updateCamera(false);
    }, 1000);
  }

  zoomTo(zoom) {
    this.targetZoom = zoom;
    this.updateCamera(true);
    this.restartInterval();
  }

  updateCamera(reset) {
    const position = this.geolocation.lastKnownPosition;

    let ease = false;
    const params = {};
    if (config.cameraFollowState === CameraFollowState.Enabled && position) {
      params.center = [position.lon, position.lat];
    }

    if (this.targetBearing !== null) {
      params.bearing = this.targetBearing;
      this.targetBearing = null;
      ease = true;
    } else if (
      !config.northUpEnabled &&
      position &&
      position.bearing !== null &&
      (reset || position.speed >= 0.5)
    ) {
      params.bearing = position.bearing;
    }

    if (this.targetPitch !== null) {
      params.pitch = this.targetPitch;
      this.targetPitch = null;
      ease = true;
    }

    if (this.targetPadding !== null) {
      params.padding = this.targetPadding;
      this.targetPadding = null;
      ease = true;
    }

    if (this.targetZoom !== null) {
      params.zoom = this.targetZoom;
      this.targetZoom = null;
      ease = true;
    }

    if (Object.keys(params).length > 0) {
      if (ease) {
        this.map.easeTo(params, { isCustom: true });
      } else {
        this.map.flyTo({ ...params, duration: 0 }, { isCustom: true });
      }
    }
  }
}
