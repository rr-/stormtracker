import { htmlToElement } from "../../common.js";
import { config } from "../../config.js";

export class GPSButtons {
  constructor(masterControl) {
    this.masterControl = masterControl;

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

    this.masterControl.geolocation.addEventListener("geolocate", (event) =>
      this.handleGeolocate(event.detail)
    );
    this.masterControl.geolocation.addEventListener("geolocateError", (event) =>
      this.handleGeolocateError(event.detail)
    );

    this.handleConfigChange();
  }

  handleGeolocate(position) {
    this.trackButton.classList.remove("waiting");
    this.trackButton.classList.remove("active-error");
    if (config.trackEnabled) {
      this.trackButton.classList.add("active");
    }
  }

  handleGeolocateError(error) {
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
    config.trackEnabled = !config.trackEnabled;
    if (!config.trackEnabled) {
      config.followEnabled = false;
    }
    config.save();
  }

  handleFollowButtonClick() {
    config.followEnabled = !config.followEnabled;
    if (config.followEnabled) {
      config.trackEnabled = true;
    }
    config.save();
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
    this.followButton.classList.toggle("active", config.followEnabled);
    this.rangeCirclesButton.classList.toggle(
      "active",
      config.rangeCirclesEnabled
    );
    this.rangePolygonsButton.classList.toggle(
      "active",
      config.rangePolygonsEnabled
    );
  }

  onAdd(map) {
    return this.div;
  }
}
