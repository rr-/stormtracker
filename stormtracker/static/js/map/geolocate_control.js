import { config } from "../config.js";
import { htmlToElement } from "../common.js";

export class MyGeolocateControl extends EventTarget {
  constructor(masterControl) {
    super();
    this.masterControl = masterControl;
  }

  onAdd(map) {
    this.map = map;
    this.container = htmlToElement(`
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
    </div>
    `);

    this.trackButton = this.container.querySelector("button.geolocate");
    this.followButton = this.container.querySelector("button.follow");
    this.rangeCirclesButton = this.container.querySelector(
      "button.range-circles",
    );

    this.dotElement = htmlToElement(
      '<div class="mapboxgl-user-location-dot"></div>',
    );

    this.accuracyCircleElement = htmlToElement(
      '<div class="mapboxgl-user-location-accuracy-circle"></div>',
    );

    this.lastKnownPosition = null;
    this.userLocationDotMarker = new mapboxgl.Marker(this.dotElement);
    this.accuracyCircleMarker = new mapboxgl.Marker({
      element: this.accuracyCircleElement,
      pitchAlignment: "map",
    });

    this.map.on("zoom", (event) => this.handleZoom(event));
    this.trackButton.addEventListener("click", () =>
      this.handleTrackButtonClick(),
    );
    this.followButton.addEventListener("click", () =>
      this.handleFollowButtonClick(),
    );
    this.rangeCirclesButton.addEventListener("click", () =>
      this.handleRangeCirclesButtonClick(),
    );
    config.addEventListener("save", () => this.handleConfigChange());

    this.handleConfigChange();
    return this.container;
  }

  handleSuccess(position) {
    this.lastKnownPosition = position;

    this.trackButton.classList.remove("waiting");
    this.trackButton.classList.remove("active-error");

    if (config.trackEnabled) {
      this.trackButton.classList.add("active");
      this.updateMarker(position);
    }

    if (config.followEnabled) {
      window.setTimeout(() => {
        this.updateCamera(position);
      }, 500);
    }

    this.dispatchEvent(
      new CustomEvent("geolocate", {
        detail: {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        },
      }),
    );
    this.dotElement.classList.remove("mapboxgl-user-location-dot-stale");
  }

  updateCamera(position) {
    this.map.setCenter([position.coords.longitude, position.coords.latitude]);
  }

  updateMarker(position) {
    if (position) {
      const center = {
        lng: position.coords.longitude,
        lat: position.coords.latitude,
      };
      this.accuracyCircleMarker.setLngLat(center).addTo(this.map);
      this.userLocationDotMarker.setLngLat(center).addTo(this.map);
      this.accuracy = position.coords.accuracy;
      this.updateAccuracyCircle();
    } else {
      this.userLocationDotMarker.remove();
      this.accuracyCircleMarker.remove();
    }
  }

  updateAccuracyCircle() {
    const y = this.map._container.clientHeight / 2;
    const a = this.map.unproject([0, y]);
    const b = this.map.unproject([1, y]);
    const metersPerPixel = a.distanceTo(b);
    const circleDiameter = Math.ceil((2.0 * this.accuracy) / metersPerPixel);
    this.accuracyCircleElement.style.width = `${circleDiameter}px`;
    this.accuracyCircleElement.style.height = `${circleDiameter}px`;
  }

  handleZoom(event) {
    this.updateAccuracyCircle();
    window.setTimeout(() => {
      if (this.lastKnownPosition && config.followEnabled) {
        this.updateCamera(this.lastKnownPosition);
      }
    }, 500);
  }

  handleError(error) {
    if (!this.map) {
      return;
    }

    if (error.code === 1) {
      // PERMISSION_DENIED
      config.trackEnabled = false;
      config.followEnabled = false;
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

    this.dotElement.classList.add("mapboxgl-user-location-dot-stale");
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

  handleConfigChange() {
    this.accuracyCircleElement.style.visibility = config.accuracyCircleEnabled
      ? "visible"
      : "hidden";
    this.trackButton.classList.toggle("active", config.trackEnabled);
    this.followButton.classList.toggle("active", config.followEnabled);
    this.rangeCirclesButton.classList.toggle(
      "active",
      config.rangeCirclesEnabled,
    );
    if (config.trackEnabled && this.geolocationWatchID === undefined) {
      this.startWatch();
    } else if (!config.trackEnabled && this.geolocationWatchID !== undefined) {
      this.clearWatch();
    }

    if (config.followEnabled && this.map.dragPan.isEnabled()) {
      this.map.dragPan.disable();
      if (this.lastKnownPosition) {
        this.updateCamera(this.lastKnownPosition);
      }
    } else if (!config.followEnabled && !this.map.dragPan.isEnabled()) {
      this.map.dragPan.enable();
    }
  }

  startWatch() {
    this.trackButton.classList.add("waiting");
    this.geolocationWatchID = window.navigator.geolocation.watchPosition(
      (position) => this.handleSuccess(position),
      (error) => this.handleError(error),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 6000,
      },
    );
    console.info("GPS: adding watch", this.geolocationWatchID);
  }

  clearWatch() {
    console.info("GPS: clearing watch", this.geolocationWatchID);
    window.navigator.geolocation.clearWatch(this.geolocationWatchID);
    this.geolocationWatchID = undefined;
    this.trackButton.classList.remove("waiting");
    this.updateMarker(null);
  }
}
