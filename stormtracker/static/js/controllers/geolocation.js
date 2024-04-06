import { htmlToElement } from "../common.js";
import { config } from "../config.js";

export class GeolocationController extends EventTarget {
  constructor() {
    super();
    this.lastKnownPosition = null;

    config.addEventListener("save", () => this.handleConfigChange());
  }

  handleSuccess(position) {
    const appPosition = {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
      accuracy: position.coords.accuracy,
    };
    this.lastKnownPosition = appPosition;

    this.dispatchEvent(
      new CustomEvent("update", {
        detail: appPosition,
      })
    );
  }

  handleError(error) {
    if (error.code === 1) {
      // PERMISSION_DENIED
      config.trackEnabled = false;
      config.followEnabled = false;
      this.handleConfigChange();
    }

    this.dispatchEvent(new CustomEvent("error", { detail: { error } }));
  }

  handleConfigChange() {
    if (config.trackEnabled && this.geolocationWatchID === undefined) {
      this.startWatch();
    } else if (!config.trackEnabled && this.geolocationWatchID !== undefined) {
      this.clearWatch();
    }
  }

  startWatch() {
    this.geolocationWatchID = window.navigator.geolocation.watchPosition(
      (position) => this.handleSuccess(position),
      (error) => this.handleError(error),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 6000,
      }
    );
    console.info("GPS: adding watch", this.geolocationWatchID);
    this.dispatchEvent(new CustomEvent("start", { detail: null }));
  }

  clearWatch() {
    console.info("GPS: clearing watch", this.geolocationWatchID);
    window.navigator.geolocation.clearWatch(this.geolocationWatchID);
    this.geolocationWatchID = undefined;

    this.dispatchEvent(new CustomEvent("stop", { detail: null }));
    this.dispatchEvent(new CustomEvent("update", { detail: null }));
  }
}
