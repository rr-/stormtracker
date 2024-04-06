import { MapControl } from "./control.js";
import { MapUI } from "./ui.js";

export class Map {
  constructor(container, config) {
    mapboxgl.accessToken = config.mapboxAccessToken;

    this.map = new mapboxgl.Map({
      container: container,
      center: [config.startPos.lat, config.startPos.lon],
      zoom: config.startZoom,
      style: config.mapStyles[config.mapStyle].style,
      hash: true,
      attributionControl: false,
    });
    document.body.dataset.style = config.mapStyles[config.mapStyle].name;

    this.control = new MapControl(this.map);
    this.ui = new MapUI(this.control);

    this.control.strikesLive.connect();
    this.control.strikesHistoric.connect();
    this.control.rain.connect();
  }
}
