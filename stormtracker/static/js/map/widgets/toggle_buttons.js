import { htmlToElement } from "../../common.js";
import { config } from "../../config.js";

export class ToggleButtons {
  constructor(masterControl) {
    this.masterControl = masterControl;

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

    this.handleConfigChange();
    config.addEventListener("save", () => this.handleConfigChange());
  }

  handleToggleSoundClick() {
    this.masterControl.toggleAudio();
  }

  handleToggleRainClick() {
    this.masterControl.toggleRain();
  }

  handleToggleStrikesClick() {
    this.masterControl.toggleStrikes();
  }

  handleConfigChange() {
    this.soundButton.classList.toggle("active", config.audioEnabled);
    this.rainButton.classList.toggle("active", config.rain.enabled);
    this.strikesButton.classList.toggle("active", config.strikeMarkers.enabled);
  }

  onAdd(map) {
    return this.div;
  }
}
