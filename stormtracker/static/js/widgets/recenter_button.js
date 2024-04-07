import { htmlToElement } from "../common.js";
import { config } from "../config.js";

export class RecenterButton {
  constructor(control) {
    this.control = control;

    this.div = htmlToElement(`
      <div class="mapboxgl-ctrl mapboxgl-ctrl-custom">
        <button
          class='geolocate'
          type='button'
          title='Recenter'
          aria-label='Recenter'
        >Recenter</button>
      </div>
    `);

    this.button = this.div.querySelector("button.geolocate");

    this.button.addEventListener("click", () => this.handleButtonClick());

    control.cameraTracker.addEventListener("start", () =>
      this.handleCameraTrackerStart()
    );
    control.cameraTracker.addEventListener("pause", () =>
      this.handleCameraTrackerPause()
    );
    control.cameraTracker.addEventListener("resume", () =>
      this.handleCameraTrackerResume()
    );
    control.cameraTracker.addEventListener("stop", () =>
      this.handleCameraTrackerStop()
    );
  }

  onAdd(map) {
    return this.div;
  }

  handleButtonClick() {
    this.control.cameraTracker.resumeTracking();
  }

  handleCameraTrackerStart() {
    this.hide();
  }

  handleCameraTrackerPause() {
    this.show();
  }

  handleCameraTrackerResume() {
    this.hide();
  }

  handleCameraTrackerStop() {
    this.show();
  }

  hide() {
    this.button.classList.toggle("hidden", true);
  }

  show() {
    this.button.classList.toggle("hidden", false);
  }
}
