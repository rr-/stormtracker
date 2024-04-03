import { config } from "../config.js";
import { MapBaseControl } from "./map_base_control.js";

export class MapAudioControl extends MapBaseControl {
  constructor(masterControl) {
    super();
    this.masterControl = masterControl;
    this.sounds = [
      new Audio("static/sfx/t1.wav"),
      new Audio("static/sfx/t2.wav"),
      new Audio("static/sfx/t3.wav"),
      new Audio("static/sfx/t4.wav"),
      new Audio("static/sfx/t5.wav"),
      new Audio("static/sfx/t6.wav"),
      new Audio("static/sfx/t7.wav"),
      new Audio("static/sfx/t8.wav"),
      new Audio("static/sfx/t9.wav"),
    ];
    this.audioCount = 0;
    window.setInterval(() => this.tick(), 80);
  }

  handleStrike(strike) {
    if (
      this.masterControl.isStrikeVisible(strike) &&
      this.masterControl.isReady
    ) {
      this.audioCount++;
    }
  }

  tick() {
    if (this.audioCount > 0) {
      const count = Math.min(this.sounds.length, this.audioCount);
      this.audioCount -= count;
      if (config.audioEnabled && !document.hidden) {
        this.sounds[count - 1].play();
      }
    }
  }
}
