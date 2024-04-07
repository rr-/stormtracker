import { htmlToElement } from "../common.js";
import { config } from "../config.js";
import { CameraFollowState } from "../config.js";

export class SideButtons {
  constructor(control) {
    this.control = control;

    this.div = htmlToElement(`
      <div>
      <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
        <button class='geolocate' title='Find my location'>
          <span class="icon geolocate"></span>
        </button>

        <button class='range-circles' title='Toggle range circles'>
          <span class="icon range-circles"></span>
        </button>

        <button class='range-polygons' title='Toggle range polygons'>
          <span class="icon range-reachability"></span>
        </button>
      </div>

      <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
        <button class='follow' title='Follow my location'>
          <span class="icon follow"></span>
        </button>

        <button class='north-up' title='Toggle North/bearing rotation'>
          <span class="icon north-up"></span>
          <span class="icon user-up"></span>
        </button>
      </div>

      <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
        <button class="sound" title="Toggle sounds">
          <span class="icon sound-on"></span>
          <span class="icon sound-off"></span>
        </button>

        <button class="strikes" title="Toggle lightning strikes">
          <span class="icon lightning"></span>
        </button>

        <button class="rain" title="Toggle rain">
          <span class="icon rain"></span>
        </button>
      </div>
      </div>
    `);

    this.trackButton = this.div.querySelector("button.geolocate");
    this.rangeCirclesButton = this.div.querySelector("button.range-circles");
    this.rangePolygonsButton = this.div.querySelector("button.range-polygons");

    this.followButton = this.div.querySelector("button.follow");
    this.northUpButton = this.div.querySelector("button.north-up");

    this.soundButton = this.div.querySelector("button.sound");
    this.rainButton = this.div.querySelector("button.rain");
    this.strikesButton = this.div.querySelector("button.strikes");

    this.trackButton.addEventListener("click", () =>
      this.handleToggleTrackButtonClick()
    );
    this.rangeCirclesButton.addEventListener("click", () =>
      this.handleToggleRangeCirclesButtonClick()
    );
    this.rangePolygonsButton.addEventListener("click", () =>
      this.handleToggleRangePolygonsButtonClick()
    );

    this.followButton.addEventListener("click", () =>
      this.handleToggleFollowButtonClick()
    );
    this.northUpButton.addEventListener("click", () =>
      this.handleToggleNorthUpClick()
    );

    this.soundButton.addEventListener("click", () =>
      this.handleToggleSoundClick()
    );
    this.rainButton.addEventListener("click", () =>
      this.handleToggleRainClick()
    );
    this.strikesButton.addEventListener("click", () =>
      this.handleToggleStrikesClick()
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

  handleToggleTrackButtonClick() {
    this.control.toggleTrack();
  }

  handleToggleRangeCirclesButtonClick() {
    config.rangeCirclesEnabled = !config.rangeCirclesEnabled;
    config.save();
  }

  handleToggleRangePolygonsButtonClick() {
    config.rangePolygonsEnabled = !config.rangePolygonsEnabled;
    config.save();
  }

  handleToggleFollowButtonClick() {
    this.control.toggleFollow();
  }

  handleToggleNorthUpClick() {
    this.control.toggleNorthUp();
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
    this.trackButton.classList.toggle("active", config.trackEnabled);
    this.rangeCirclesButton.classList.toggle(
      "active",
      config.rangeCirclesEnabled
    );
    this.rangePolygonsButton.classList.toggle(
      "active",
      config.rangePolygonsEnabled
    );

    this.followButton.classList.toggle(
      "active",
      config.cameraFollowState !== CameraFollowState.Disabled
    );
    this.northUpButton.classList.toggle("active", config.northUpEnabled);

    this.soundButton.classList.toggle("active", config.audioEnabled);
    this.rainButton.classList.toggle("active", config.rain.enabled);
    this.strikesButton.classList.toggle("active", config.strikeMarkers.enabled);
  }
}
