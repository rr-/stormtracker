import { htmlToElement } from "../../common.js";
import { config } from "../../config.js";

export class GPSMarker extends EventTarget {
  constructor(masterControl) {
    super();
    this.masterControl = masterControl;
  }

  onAdd(map) {
    this.map = map;

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

    this.masterControl.geolocation.addEventListener("geolocate", (event) =>
      this.handleGeolocate(event.detail)
    );

    this.masterControl.geolocation.addEventListener("geolocateError", (event) =>
      this.handleGeolocateError(event.detail)
    );

    this.map.on("zoom", (event) => this.handleZoom(event));
    config.addEventListener("save", () => this.handleConfigChange());
    return this.div;
  }

  handleConfigChange() {
    this.accuracyCircleElement.style.visibility = config.accuracyCircleEnabled
      ? "visible"
      : "hidden";
  }

  handleGeolocate(position) {
    this.updateMarker(position);
    this.dotElement.classList.remove("mapboxgl-user-location-dot-stale");
  }

  handleGeolocateError(error) {
    this.dotElement.classList.add("mapboxgl-user-location-dot-stale");
  }

  handleZoom(event) {
    this.updateAccuracyCircle();
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

  updateMarker(position) {
    if (position) {
      const center = {
        lng: position.lon,
        lat: position.lat,
      };
      this.accuracyCircleMarker.setLngLat(center).addTo(this.map);
      this.userLocationDotMarker.setLngLat(center).addTo(this.map);
      this.accuracy = position.accuracy;
      this.updateAccuracyCircle();
    } else {
      this.userLocationDotMarker.remove();
      this.accuracyCircleMarker.remove();
    }
  }
}
