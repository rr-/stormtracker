import { config } from "../config.js";
import { CameraFollowState } from "../config.js";

export class CameraTrackerController extends EventTarget {
  constructor(map, geolocation) {
    super();
    this.map = map;
    this.geolocation = geolocation;
    this.lastCameraFollowState = null;

    console.log("constructor");
    config.addEventListener("save", () => this.handleConfigChange());
    map.on("move", (event) => this.handleMapMove(event));
    map.on("zoom", (event) => this.handleMapZoom(event));
    geolocation.addEventListener("update", (event) =>
      this.handleGeolocationUpdate(event)
    );
  }

  get isSignificantlyOff() {
    const position = this.geolocation.lastKnownPosition;
    if (!position) {
      return true;
    }

    const bounds = this.map.getBounds();
    const center = this.map.getCenter();
    const xRatio =
      (position.lon - bounds.getEast()) / (bounds.getWest() - bounds.getEast());
    const yRatio =
      (position.lat - bounds.getNorth()) /
      (bounds.getSouth() - bounds.getNorth());
    return xRatio < 0.4 || xRatio > 0.6 || yRatio < 0.4 || yRatio > 0.6;
  }

  handleConfigChange() {
    if (this.lastCameraFollowState === config.cameraFollowState) {
      return;
    }
    this.lastCameraFollowState = config.cameraFollowState;
    if (config.cameraFollowState === CameraFollowState.Enabled) {
      this.startTracking();
    } else if (config.cameraFollowState === CameraFollowState.Paused) {
      this.pauseTracking();
    } else if (!config.cameraFollowState === CameraFollowState.Disabled) {
      this.stopTracking();
    }
  }

  handleMapMove(event) {
    if (!event.isCustom && this.isSignificantlyOff) {
      this.pauseTracking();
    }
  }

  handleMapZoom(event) {
    if (!event.isCustom && this.isSignificantlyOff) {
      this.pauseTracking();
    }
  }

  handleGeolocationUpdate() {
    if (config.cameraFollowState === CameraFollowState.Enabled) {
      this.updatePosition();
    }
  }

  startTracking() {
    config.cameraFollowState = CameraFollowState.Enabled;
    config.save();
    console.log("start tracking");
    this.dispatchEvent(new CustomEvent("start"));
    this.updatePosition();
  }

  stopTracking() {
    config.cameraFollowState = CameraFollowState.Disabled;
    config.save();
    console.log("stop tracking");
    this.dispatchEvent(new CustomEvent("stop"));
  }

  pauseTracking() {
    config.cameraFollowState = CameraFollowState.Paused;
    config.save();
    console.log("pause tracking");
    this.dispatchEvent(new CustomEvent("pause"));
  }

  resumeTracking() {
    config.cameraFollowState = CameraFollowState.Enabled;
    config.save();
    console.log("resume tracking");
    this.dispatchEvent(new CustomEvent("resume"));
    this.updatePosition();
  }

  updatePosition() {
    console.log("update position");
    const position = this.geolocation.lastKnownPosition;
    if (position) {
      this.map.easeTo(
        { center: [position.lon, position.lat] },
        { isCustom: true }
      );
    }
  }
}
