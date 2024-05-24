import { htmlToElement } from "../common.js";
import { config } from "../config.js";

export class GPSMarker extends EventTarget {
  constructor(control) {
    super();
    this.control = control;
  }

  onAdd(map) {
    this.markerElement = htmlToElement(
      '<div class="mapboxgl-marker mapboxgl-marker-custom-location hidden">' +
        '<div class="dot"></div>' +
        '<div class="heading"></div>' +
        "</div>"
    );

    this.accuracyCircleElement = htmlToElement(
      '<div class="mapboxgl-user-location-accuracy-circle"></div>'
    );

    this.userLocationMarker = new mapboxgl.Marker({
      element: this.markerElement,
      rotationAlignment: "map",
    });
    this.accuracyCircleMarker = new mapboxgl.Marker({
      element: this.accuracyCircleElement,
      pitchAlignment: "map",
    });

    this.control.map.on("zoom", (event) => this.handleZoom(event));
    this.control.geolocation.addEventListener("update", (event) =>
      this.handleGeolocationUpdate(event)
    );
    this.control.geolocation.addEventListener("error", () =>
      this.handleGeolocationError()
    );

    return this.markerElement;
  }

  handleGeolocationUpdate(event) {
    this.updateMarker(event.detail);
    this.markerElement.classList.remove("hidden");
    this.markerElement.classList.remove("stale");
    this.accuracyCircleElement.style.visibility = config.accuracyCircleEnabled
      ? "visible"
      : "hidden";
  }

  handleGeolocationError() {
    this.markerElement.classList.add("stale");
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

  updateMarker() {
    const position = this.control.geolocation.currentPosition;
    if (position) {
      const center = {
        lng: position.lon,
        lat: position.lat,
      };
      this.userLocationMarker.setLngLat(center);
      if (position.bearing === null) {
        this.markerElement.classList.remove("heading");
      } else {
        this.markerElement.classList.add("heading");
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
