import { htmlToElement } from "../common.js";
import { config } from "../config.js";

export class ToggleButtons {
  constructor(control) {
    this.control = control;

    this.div = htmlToElement(`
      <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
        <button class="sound" title="Toggle sounds">
          <span class="icon sound" aria-hidden="true"></span>
        </button>

        <button class="strikes" title="Toggle lightning strikes">
          <span class="icon lightning" aria-hidden="true"></span>
        </button>

        <button class="rain" title="Toggle rain">
          <span class="icon rain" aria-hidden="true"></span>
        </button>
      </div>
    `);

    this.soundButton = this.div.querySelector("button.sound");
    this.soundButton.addEventListener("click", () =>
      this.handleToggleSoundClick()
    );

    this.rainButton = this.div.querySelector("button.rain");
    this.rainButton.addEventListener("click", () =>
      this.handleToggleRainClick()
    );

    this.strikesButton = this.div.querySelector("button.strikes");
    this.strikesButton.addEventListener("click", () =>
      this.handleToggleStrikesClick()
    );

    config.addEventListener("save", () => this.handleConfigChange());

    this.handleConfigChange();
  }

  onAdd(map) {
    return this.div;
  }

  handleToggleSoundClick() {
    this.control.toggleAudio();
  }

  handleToggleRainClick() {
    this.control.toggleRain();
  }

  handleToggleStrikesClick() {
    this.control.toggleStrikes();
  }

  handleConfigChange() {
    this.soundButton.classList.toggle("active", config.audioEnabled);
    this.rainButton.classList.toggle("active", config.rain.enabled);
    this.strikesButton.classList.toggle("active", config.strikeMarkers.enabled);
  }
}
