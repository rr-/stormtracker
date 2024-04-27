export class Geocoder {
  constructor(control) {
    this.control = control;

    this.origWidget = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      flyTo: false,
      marker: true,
    });

    this.origWidget.on("result", (event) => this.handleResult(event));
  }

  handleResult(event) {
    debugger;
    this.control.navigation.start({
      lat: event.result.center[1],
      lon: event.result.center[0],
    });
  }

  onAdd(map) {
    return this.origWidget.onAdd(map);
  }
}
