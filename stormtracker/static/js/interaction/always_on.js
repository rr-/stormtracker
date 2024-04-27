import { config } from "../config.js";

export class AlwaysOnInteraction {
  constructor(control) {
    this.control = control;
    this.lastState = false;
    config.addEventListener("save", () => this.handleConfigChange());

    this.video = this.createVideoElement();
    document.body.appendChild(this.video);
  }

  createVideoElement() {
    const video = document.createElement("video");
    video.loop = true;
    video.tabIndex = -1;
    video.muted = true;
    video.style.width = 0;
    video.style.height = 0;
    video.style.pointerEvents = "none";
    video.style.position = "absolute";

    const source = document.createElement("source");
    source.src =
      "data:video/webm;base64, GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA=";
    source.type = "video/webm";

    video.appendChild(source);
    return video;
  }

  handleConfigChange() {
    if (this.lastState !== config.alwaysOnEnabled) {
      this.lastState = config.alwaysOnEnabled;
      if (config.alwaysOnEnabled) {
        this.enable();
      } else {
        this.disable();
      }
    }
  }

  enable() {
    this.video.play();
  }

  disable() {
    this.video.pause();
  }
}
