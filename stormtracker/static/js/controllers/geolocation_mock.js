import { htmlToElement } from "../common.js";
import { config } from "../config.js";
import { getDistance, getBearing } from "../math.js";

export class GeolocationController extends EventTarget {
  constructor() {
    super();
    this.currentPosition = null;

    this.intervalId = null;
    this.refPoints = [];
    this.curPoints = [];

    config.addEventListener("save", () => this.handleConfigChange());

    this.fetch();
  }

  async fetch() {
    const response = await fetch("/static/activity_14189365177.gpx");
    const xmlString = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "text/xml");
    this.refPoints = [...doc.querySelectorAll("trkpt")].map((point) => ({
      lat: point.getAttribute("lat"),
      lon: point.getAttribute("lon"),
      time: new Date(point.querySelector("time").textContent),
    }));
    this.curPoints = [...this.refPoints];
  }

  tick() {
    if (!this.curPoints.length) {
      this.curPoints = [...this.refPoints];
      return;
    }

    const point = this.curPoints.shift();
    const result = {
      lat: point.lat,
      lon: point.lon,
      time: point.time,
      accuracy: 0,
      speed: this.currentPosition
        ? getDistance(this.currentPosition, point) *
          ((point.time - this.currentPosition.time) * 1000.0)
        : 0.0,
      bearing: this.currentPosition
        ? getBearing(this.currentPosition, point)
        : 0,
    };

    this.currentPosition = result;

    this.dispatchEvent(
      new CustomEvent("update", {
        detail: result,
      })
    );
  }

  handleConfigChange() {
    if (config.trackEnabled && this.intervalId === null) {
      this.startWatch();
    } else if (!config.trackEnabled && this.intervalId !== null) {
      this.clearWatch();
    }
  }

  startWatch() {
    this.intervalId = window.setInterval(() => {
      this.tick();
    }, 100);
    console.info("GPS: adding watch", this.intervalId);
    this.dispatchEvent(new CustomEvent("start", { detail: null }));
  }

  clearWatch() {
    console.info("GPS: clearing watch", this.intervalId);
    window.clearInterval(this.intervalId);
    this.intervalId = null;

    this.dispatchEvent(new CustomEvent("stop", { detail: null }));
    this.dispatchEvent(new CustomEvent("update", { detail: null }));
  }
}
