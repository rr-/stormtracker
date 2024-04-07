import { config } from "../config.js";

export class KeyboardInteraction {
  constructor(control) {
    this.control = control;
    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase();

    const keyMap = {
      s: () => this.control.cycleMapStyle(),
      g: () => {
        // toggle dark navigation / satellite
        if (config.mapStyle === 0) {
          this.control.switchMapStyle(2);
        } else {
          this.control.switchMapStyle(0);
        }
      },
      t: () => this.control.toggleTrack(),
      f: () => this.control.toggleFollow(),
      a: () => this.control.toggleAudio(),
      n: () => this.control.toggleNorthUp(),
      r: () => this.control.toggleRain(),
      l: () => this.control.toggleStrikes(),
      c: () => {
        if (event.shiftKey) {
          this.control.toggleRangePolygons();
        } else {
          this.control.toggleRangeCircles();
        }
      },
      1: () => this.control.map.zoomTo(8),
      2: () => this.control.map.zoomTo(10),
      3: () => this.control.map.zoomTo(11.5),
      4: () => this.control.map.zoomTo(13),
      5: () => this.control.map.zoomTo(15),
    };

    const func = keyMap[key];
    if (func) {
      func();
    }
  }
}
