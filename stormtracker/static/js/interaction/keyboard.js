import { config } from "../config.js";

export class KeyboardInteraction {
  constructor(control) {
    this.control = control;
    window.addEventListener("keydown", (event) => this.handleKeyDown(event));
  }

  handleKeyDown(event) {
    if (event.ctrlKey) {
      return;
    }

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
      p: () => this.control.togglePitch(),
      r: () => {
        if (event.shiftKey) {
          this.control.toggleRainOpacity();
        } else {
          this.control.toggleRain();
        }
      },
      l: () => this.control.toggleStrikes(),
      z: () => this.control.toggleAlwaysOn(),
      c: () => {
        if (event.shiftKey) {
          this.control.toggleRangePolygons();
        } else {
          this.control.toggleRangeCircles();
        }
      },
      1: () => this.control.camera.zoomTo(8),
      2: () => this.control.camera.zoomTo(10),
      3: () => this.control.camera.zoomTo(11.5),
      4: () => this.control.camera.zoomTo(13),
      5: () => this.control.camera.zoomTo(15),
      6: () => this.control.camera.zoomTo(17),
    };

    const func = keyMap[key];
    if (func) {
      func();
    }
  }
}
