import { htmlToElement } from "../common.js";
import { config } from "../config.js";
import { CameraFollowState } from "../config.js";

export class GPSButtons {
  constructor(control) {
    this.control = control;

    this.div = htmlToElement(`
      <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
      <button
        class='geolocate'
        type='button'
        title='Find my location'
        aria-label='Find my location'
      ><span class="icon geolocate" aria-hidden="true"></span></button>

      <button
        class='follow'
        type='button'
        title='Follow my location'
        aria-label='Follow my location'
      ><span class="icon follow" aria-hidden="true"></span></button>

      <button
        class='range-circles'
        type='button'
        title='Toggle range circles'
        aria-label='Toggle range circles'
      ><span class="icon range-circles" aria-hidden="true"></span></button>

      <button
        class='range-polygons'
        type='button'
        title='Toggle range polygons'
        aria-label='Toggle range polygons'
      ><span class="icon range-reachability" aria-hidden="true"></span></button>
    </div>
    `);

    this.trackButton = this.div.querySelector("button.geolocate");
    this.followButton = this.div.querySelector("button.follow");
    this.rangeCirclesButton = this.div.querySelector("button.range-circles");
    this.rangePolygonsButton = this.div.querySelector("button.range-polygons");

    this.trackButton.addEventListener("click", () =>
      this.handleTrackButtonClick()
    );
    this.followButton.addEventListener("click", () =>
      this.handleFollowButtonClick()
    );
    this.rangeCirclesButton.addEventListener("click", () =>
      this.handleRangeCirclesButtonClick()
    );
    this.rangePolygonsButton.addEventListener("click", () =>
      this.handleRangePolygonsButtonClick()
    );

    config.addEventListener("save", () => this.handleConfigChange());
    control.geolocation.addEventListener("update", (event) =>
      this.handleGeolocationUpdate(event.detail)
    );
    control.geolocation.addEventListener("error", (event) =>
      this.handleGeolocationError(event.detail)
    );

    this.handleConfigChange();
  }

  onAdd(map) {
    return this.div;
  }

  handleGeolocationUpdate(position) {
    this.trackButton.classList.remove("waiting");
    this.trackButton.classList.remove("active-error");
    if (config.trackEnabled) {
      this.trackButton.classList.add("active");
    }
  }

  handleGeolocationError(error) {
    if (error.code === 1) {
      // PERMISSION_DENIED
      this.handleConfigChange();
      this.trackButton.classList.remove("waiting");
      this.trackButton.classList.remove("active");
      this.trackButton.classList.remove("error");
      this.trackButton.disabled = true;
      this.trackButton.title = "Location not available";
      this.followButton.disabled = true;
      this.followButton.title = "Location not available";
    } else {
      this.trackButton.classList.add("active-error");
      this.trackButton.classList.add("waiting");
    }
  }

  handleTrackButtonClick() {
    this.control.toggleTrack();
  }

  handleFollowButtonClick() {
    this.control.toggleFollow();
  }

  handleRangeCirclesButtonClick() {
    config.rangeCirclesEnabled = !config.rangeCirclesEnabled;
    config.save();
  }

  handleRangePolygonsButtonClick() {
    config.rangePolygonsEnabled = !config.rangePolygonsEnabled;
    config.save();
  }

  handleConfigChange() {
    this.trackButton.classList.toggle("active", config.trackEnabled);
    this.followButton.classList.toggle(
      "active",
      config.cameraFollowState !== CameraFollowState.Disabled
    );
    this.rangeCirclesButton.classList.toggle(
      "active",
      config.rangeCirclesEnabled
    );
    this.rangePolygonsButton.classList.toggle(
      "active",
      config.rangePolygonsEnabled
    );
  }
}
