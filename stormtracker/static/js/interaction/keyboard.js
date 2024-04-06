import { config } from "../config.js";

export class KeyboardInteraction {
  constructor(control) {
    this.control = control;
    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
  }

  handleKeyDown(event) {
    if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (event.key === "s" || event.key === "S") {
      this.control.cycleMapStyle();
    }

    if (event.key === "g" || event.key === "G") {
      // toggle dark navigation / satellite
      if (config.mapStyle === 0) {
        this.control.switchMapStyle(2);
      } else {
        this.control.switchMapStyle(0);
      }
    }

    if (event.key === "t" || event.key === "T") {
      this.control.toggleTrack();
    }
    if (event.key === "f" || event.key === "F") {
      this.control.toggleFollow();
    }
    if (event.key === "a" || event.key === "A") {
      this.control.toggleAudio();
    }
    if (event.key === "r" || event.key === "R") {
      this.control.toggleRain();
    }
    if (event.key === "c" || event.key === "C") {
      this.control.toggleRangeCircles();
    }
    if (event.key === "1") {
      this.control.map.zoomTo(8);
    }
    if (event.key === "2") {
      this.control.map.zoomTo(10);
    }
    if (event.key === "3") {
      this.control.map.zoomTo(11.5);
    }
    if (event.key === "4") {
      this.control.map.zoomTo(13);
    }
    if (event.key === "5") {
      this.control.map.zoomTo(15);
    }
  }
}
