import { htmlToElement } from "../common.js";
import { config } from "../config.js";

export class GPSMarker extends EventTarget {
  constructor(control) {
    super();
    this.control = control;
  }

  onAdd(map) {
    this.markerElement = htmlToElement(
      '<div class="mapboxgl-user-location mapboxgl-marker mapboxgl-marker-anchor-center mapboxgl-user-location-show-heading">' +
        '<div class="mapboxgl-user-location-dot"></div>' +
        '<div class="mapboxgl-user-location-heading"></div>' +
        "</div>"
    );

    this.dotElement = this.markerElement.querySelector(
      ".mapboxgl-user-location-dot"
    );
    this.angleElement = this.markerElement.querySelector(
      ".mapboxgl-user-location-heading"
    );

    this.accuracyCircleElement = htmlToElement(
      '<div class="mapboxgl-user-location-accuracy-circle"></div>'
    );

    this.userLocationMarker = new mapboxgl.Marker(this.markerElement);
    this.accuracyCircleMarker = new mapboxgl.Marker({
      element: this.accuracyCircleElement,
      pitchAlignment: "map",
    });

    config.addEventListener("save", () => this.handleConfigChange());
    this.control.map.on("zoom", (event) => this.handleZoom(event));
    this.control.geolocation.addEventListener("update", (event) =>
      this.handleGeolocationUpdate(event)
    );
    this.control.geolocation.addEventListener("error", () =>
      this.handleGeolocationError()
    );

    return this.markerElement;
  }

  handleConfigChange() {
    this.accuracyCircleElement.style.visibility = config.accuracyCircleEnabled
      ? "visible"
      : "hidden";
  }

  handleGeolocationUpdate(event) {
    this.updateMarker(event.detail);
    this.dotElement.classList.remove("mapboxgl-user-location-dot-stale");
  }

  handleGeolocationError() {
    this.dotElement.classList.add("mapboxgl-user-location-dot-stale");
  }

  handleZoom(event) {
    this.updateAccuracyCircle();
  }

  updateAccuracyCircle() {
    const y = this.control.map._container.clientHeight / 2;
    const a = this.control.map.unproject([0, y]);
    const b = this.control.map.unproject([1, y]);
    const metersPerPixel = a.distanceTo(b);
    const circleDiameter = Math.ceil((2.0 * this.accuracy) / metersPerPixel);
    this.accuracyCircleElement.style.width = `${circleDiameter}px`;
    this.accuracyCircleElement.style.height = `${circleDiameter}px`;
  }

  updateMarker(position) {
    if (position) {
      const center = {
        lng: position.lon,
        lat: position.lat,
      };
      this.userLocationMarker.setLngLat(center);
      if (position.bearing === null) {
        this.angleElement.classList.add("hidden");
      } else {
        this.angleElement.classList.remove("hidden");
        this.userLocationMarker.setRotation(position.bearing);
      }
      this.userLocationMarker.addTo(this.control.map);
      this.accuracy = position.accuracy;
      this.updateAccuracyCircle();
    } else {
      this.userLocationMarker.remove();
      this.accuracyCircleMarker.remove();
    }
  }
}
