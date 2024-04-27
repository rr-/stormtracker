import { htmlToElement } from "../common.js";
import { config } from "../config.js";

export class Navigator {
  constructor(control) {
    this.control = control;

    this.div = htmlToElement(`
      <div class="mapboxgl-ctrl mapboxgl-ctrl-custom">
        <button class='stop hidden' type='button'>
          Exit navigation
        </button>
      </div>
    `);

    this.stopButton = this.div.querySelector("button.stop");

    this.stopButton.addEventListener("click", () =>
      this.handleStopButtonClick()
    );
    control.navigation.addEventListener("start", () =>
      this.handleNavigationStart()
    );
    control.navigation.addEventListener("stop", () =>
      this.handleNavigationStop()
    );
    this.updateVisibility();
  }

  handleStopButtonClick() {
    this.control.navigation.stop();
  }

  handleNavigationStart() {
    this.updateVisibility();
  }

  handleNavigationStop() {
    this.updateVisibility();
  }

  updateVisibility() {
    this.stopButton.classList.toggle(
      "hidden",
      this.control.navigation.targetPos === null
    );
  }

  onAdd(map) {
    return this.div;
  }
}
