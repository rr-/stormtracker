import { config } from "../config.js";

export class AudioInteraction {
  constructor(control) {
    this.control = control;

    this.audioCount = 0;
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

    window.setInterval(() => this.tick(), 80);
    control.strikesLive.addEventListener("strike", (event) =>
      this.handleStrike(event)
    );
  }

  handleStrike(event) {
    const strike = event.detail.strike;
    if (this.control.isStrikeVisible(strike) && this.control.isReady) {
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
