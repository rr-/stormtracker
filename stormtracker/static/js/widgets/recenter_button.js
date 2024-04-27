import { htmlToElement } from "../common.js";
import { config } from "../config.js";

export class RecenterButton {
  constructor(control) {
    this.control = control;

    this.div = htmlToElement(`
      <div class="mapboxgl-ctrl mapboxgl-ctrl-custom">
        <button class='recenter' type='button'>
          Recenter
        </button>
      </div>
    `);

    this.button = this.div.querySelector("button.recenter");

    this.button.addEventListener("click", () => this.handleButtonClick());

    control.camera.addEventListener("start-tracking", () =>
      this.handleCameraStartTracking()
    );
    control.camera.addEventListener("pause-tracking", () =>
      this.handleCameraPauseTracking()
    );
    control.camera.addEventListener("resume-tracking", () =>
      this.handleCameraResumeTracking()
    );
    control.camera.addEventListener("stop-tracking", () =>
      this.handleCameraStopTracking()
    );
  }

  onAdd(map) {
    return this.div;
  }

  handleButtonClick() {
    this.control.camera.resumeTracking();
  }

  handleCameraStartTracking() {
    this.hide();
  }

  handleCameraPauseTracking() {
    this.show();
  }

  handleCameraResumeTracking() {
    this.hide();
  }

  handleCameraStopTracking() {
    this.show();
  }

  hide() {
    this.button.classList.toggle("hidden", true);
  }

  show() {
    this.button.classList.toggle("hidden", false);
  }
}
