import { config } from "../../config.js";

export class KeyboardController {
  constructor(masterControl) {
    this.masterControl = masterControl;
    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
  }

  handleKeyDown(event) {
    if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (event.key === "s" || event.key === "S") {
      this.masterControl.cycleMapStyle();
    }

    if (event.key === "g" || event.key === "G") {
      // toggle dark navigation / satellite
      if (config.mapStyle === 0) {
        this.masterControl.switchMapStyle(2);
      } else {
        this.masterControl.switchMapStyle(0);
      }
    }

    if (event.key === "t" || event.key === "T") {
      this.masterControl.toggleTrack();
    }
    if (event.key === "f" || event.key === "F") {
      this.masterControl.toggleFollow();
    }
    if (event.key === "a" || event.key === "A") {
      this.masterControl.toggleAudio();
    }
    if (event.key === "r" || event.key === "R") {
      this.masterControl.toggleRain();
    }
    if (event.key === "c" || event.key === "C") {
      this.masterControl.toggleRangeCircles();
    }
    if (event.key === "1") {
      this.masterControl.map.zoomTo(8);
    }
    if (event.key === "2") {
      this.masterControl.map.zoomTo(10);
    }
    if (event.key === "3") {
      this.masterControl.map.zoomTo(11.5);
    }
    if (event.key === "4") {
      this.masterControl.map.zoomTo(13);
    }
  }
}
