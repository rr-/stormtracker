import { config } from "../config.js";

export class NavigationController extends EventTarget {
  constructor(map, geolocation) {
    super();
    this.map = map;
    if (config.targetPos !== null) {
      this.start(config.targetPos);
    }
  }

  get targetPos() {
    return config.targetPos;
  }

  start(position) {
    config.targetPos = {
      lon: position.lng,
      lat: position.lat,
    };
    config.save();
    console.log("started navigation");
    this.dispatchEvent(new CustomEvent("start", { detail: { position } }));
    this.target = position;
  }

  stop() {
    config.targetPos = null;
    config.save();
    console.log("stopped navigation");
    this.dispatchEvent(new CustomEvent("stop"));
  }
}
