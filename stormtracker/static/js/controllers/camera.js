import { config } from "../config.js";
import { CameraFollowState } from "../config.js";

export class CameraController extends EventTarget {
  constructor(map, geolocation) {
    super();
    this.map = map;
    this.geolocation = geolocation;
    this.lastCameraFollowState = null;
    this.lastNorthUpEnabled = null;
    this.lastPitchEnabled = null;
    this.targetZoom = null;
    this.updateCameraInterval = null;

    config.addEventListener("save", () => this.handleConfigChange());
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
    const xRatio =
      (position.lon - bounds.getEast()) / (bounds.getWest() - bounds.getEast());
    const yRatio =
      (position.lat - bounds.getNorth()) /
      (bounds.getSouth() - bounds.getNorth());
    return xRatio < 0.4 || xRatio > 0.6 || yRatio < 0.4 || yRatio > 0.6;
  }

  handleConfigChange() {
    if (this.lastCameraFollowState !== config.cameraFollowState) {
      this.lastCameraFollowState = config.cameraFollowState;
      if (config.cameraFollowState === CameraFollowState.Enabled) {
        this.startTracking();
      } else if (config.cameraFollowState === CameraFollowState.Paused) {
        this.pauseTracking();
      } else if (!config.cameraFollowState === CameraFollowState.Disabled) {
        this.stopTracking();
      }
    }

    if (
      this.lastPitchEnabled !== config.pitchEnabled ||
      this.lastNorthUpEnabled !== config.northUpEnabled
    ) {
      this.lastNorthUpEnabled = config.northUpEnabled;
      this.lastPitchEnabled = config.pitchEnabled;
      this.updateCamera(true);
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
    this.updateCameraInterval = window.setInterval(() => {
      this.updateCamera(false);
    }, 1000);
  }

  stopTracking() {
    config.cameraFollowState = CameraFollowState.Disabled;
    config.save();
    this.dispatchEvent(new CustomEvent("stop-tracking"));
    window.clearInterval(this.updateCameraInterval);
    this.updateCameraInterval = null;
  }

  pauseTracking() {
    config.cameraFollowState = CameraFollowState.Paused;
    config.save();
    this.dispatchEvent(new CustomEvent("pause-tracking"));
    window.clearInterval(this.updateCameraInterval);
    this.updateCameraInterval = null;
  }

  resumeTracking() {
    config.cameraFollowState = CameraFollowState.Enabled;
    config.save();
    this.dispatchEvent(new CustomEvent("resume-tracking"));
    this.updateCamera(true);
    this.updateCameraInterval = window.setInterval(() => {
      this.updateCamera(false);
    }, 1000);
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
    this.resetInterval();
  }

  resetInterval() {
    if (this.updateCameraInterval !== null) {
      window.clearInterval(this.updateCameraInterval);
      this.updateCameraInterval = window.setInterval(() => {
        this.updateCamera(false);
      }, 1000);
    }
  }

  zoomTo(zoom) {
    this.targetZoom = zoom;
    this.resetInterval();
    this.updateCamera(true);
  }

  updateCamera(reset) {
    const position = this.geolocation.lastKnownPosition;

    const params = {};
    if (config.cameraFollowState === CameraFollowState.Enabled && position) {
      params.center = [position.lon, position.lat];
    }

    if (config.pitchEnabled) {
      params.pitch = 45;
      params.padding = { top: document.body.scrollHeight / 3 };
    } else {
      params.pitch = 0;
      params.padding = { top: 0 };
    }

    if (config.northUpEnabled) {
      params.bearing = 0;
    } else if (
      position &&
      position.bearing !== null &&
      (reset || position.speed >= 0.5)
    ) {
      params.bearing = position.bearing;
    }

    if (this.targetZoom !== null) {
      params.zoom = this.targetZoom;
      this.targetZoom = null;
    }

    if (Object.keys(params).length > 0) {
      this.map.easeTo(params, { isCustom: true });
    }
  }

  updateRotation() {
    const position = this.geolocation.lastKnownPosition;
    if (config.northUpEnabled) {
      this.map.easeTo({ bearing: 0 }, { isCustom: true });
    } else if (position && position.bearing !== null && position.speed >= 0.5) {
      this.map.easeTo({ bearing: position.bearing }, { isCustom: true });
    }
  }
}
