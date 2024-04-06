import { AudioInteraction } from "./interaction/audio.js";
import { KeyboardInteraction } from "./interaction/keyboard.js";
import { LocationRadiusLayer } from "./layers/location_radius.js";
import { LocationReachabilityLayer } from "./layers/location_reachability.js";
import { RainLayer } from "./layers/rain.js";
import { StrikesHistoricLayer } from "./layers/strikes_historic.js";
import { StrikesLiveLayer } from "./layers/strikes_live.js";
import { CycleMapStyleButtons } from "./widgets/cycle_map_style_buttons.js";
import { GPSButtons } from "./widgets/gps_buttons.js";
import { GPSMarker } from "./widgets/gps_marker.js";
import { StatsWidget } from "./widgets/stats.js";
import { ToggleButtons } from "./widgets/toggle_buttons.js";

export class MapUI {
  constructor(control) {
    this.control = control;

    this.gpsMarker = new GPSMarker(control);
    this.stats = new StatsWidget(control);
    this.toggleButtons = new ToggleButtons(control);
    this.gpsButtons = new GPSButtons(control);
    this.cycleMapButtons = new CycleMapStyleButtons(control);

    (this.interactions = [
      new AudioInteraction(control),
      new KeyboardInteraction(control),
    ]),
      (this.layers = [
        new RainLayer(control),
        new StrikesLiveLayer(control),
        new StrikesHistoricLayer(control),
        new LocationRadiusLayer(control),
        new LocationReachabilityLayer(control),
      ]);

    control.map.on("load", () => this.handleLoad());
    control.map.on("style.load", () => this.handleStyleLoad());
  }

  handleLoad() {
    this.control.map.addControl(new mapboxgl.ScaleControl());
    this.control.map.touchZoomRotate.disableRotation();
    this.control.map.addControl(this.gpsMarker);
    this.control.map.addControl(this.gpsButtons, "top-right");
    this.control.map.addControl(this.stats, "top-left");
    this.control.map.addControl(this.toggleButtons, "top-right");
    this.control.map.addControl(this.cycleMapButtons, "top-right");
  }

  handleStyleLoad() {
    this.removeDistractingIcons();
  }

  removeDistractingIcons() {
    for (let layerName of ["airport-label", "poi-label"]) {
      this.map.setPaintProperty(layerName, "icon-opacity", 0);
    }
  }
}
