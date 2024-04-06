import { htmlToElement } from "../common.js";
import { config } from "../config.js";

export class GPSMarker extends EventTarget {
  constructor(control) {
    super();
    this.control = control;
  }

  onAdd(map) {
    this.div = htmlToElement("<div></div>");

    this.dotElement = htmlToElement(
      '<div class="mapboxgl-user-location-dot"></div>'
    );

    this.accuracyCircleElement = htmlToElement(
      '<div class="mapboxgl-user-location-accuracy-circle"></div>'
    );

    this.userLocationDotMarker = new mapboxgl.Marker(this.dotElement);
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

    return this.div;
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
      this.accuracyCircleMarker.setLngLat(center).addTo(this.control.map);
      this.userLocationDotMarker.setLngLat(center).addTo(this.control.map);
      this.accuracy = position.accuracy;
      this.updateAccuracyCircle();
    } else {
      this.userLocationDotMarker.remove();
      this.accuracyCircleMarker.remove();
    }
  }
}
