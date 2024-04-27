import { AlwaysOnInteraction } from "./interaction/always_on.js";
import { AudioInteraction } from "./interaction/audio.js";
import { KeyboardInteraction } from "./interaction/keyboard.js";
import { LocationRadiusLayer } from "./layers/location_radius.js";
import { LocationReachabilityLayer } from "./layers/location_reachability.js";
import { RainLayer } from "./layers/rain.js";
import { StrikesHistoricLayer } from "./layers/strikes_historic.js";
import { StrikesLiveLayer } from "./layers/strikes_live.js";
import { CycleMapStyleButtons } from "./widgets/cycle_map_style_buttons.js";
import { Geocoder } from "./widgets/geocoder.js";
import { GPSMarker } from "./widgets/gps_marker.js";
import { Navigator } from "./widgets/navigator.js";
import { RecenterButton } from "./widgets/recenter_button.js";
import { SideButtons } from "./widgets/side_buttons.js";
import { StatsWidget } from "./widgets/stats.js";

export class MapUI {
  constructor(control) {
    this.control = control;

    this.gpsMarker = new GPSMarker(control);
    this.stats = new StatsWidget(control);
    this.sideButtons = new SideButtons(control);
    this.recenterButton = new RecenterButton(control);
    this.geocoder = new Geocoder(control);
    this.navigator = new Navigator(control);
    this.cycleMapButtons = new CycleMapStyleButtons(control);

    (this.interactions = [
      new AudioInteraction(control),
      new KeyboardInteraction(control),
      new AlwaysOnInteraction(control),
    ]),
      (this.layers = [
        new RainLayer(control),
        new StrikesLiveLayer(control),
        new StrikesHistoricLayer(control),
        new LocationRadiusLayer(control),
        new LocationReachabilityLayer(control),
      ]);

    this.registerControlPosition(this.control.map, "bottom-center");
    control.map.on("load", () => this.handleLoad());
    control.map.on("style.load", () => this.handleStyleLoad());
  }

  handleLoad() {
    // disable rotations
    this.control.map.dragRotate.disable();
    this.control.map.touchZoomRotate.disableRotation();
    this.control.map.keyboard.disableRotation();

    // disable pitch
    this.control.map.touchPitch.disable();
    this.control.map.setMinPitch(0);
    this.control.map.setMaxPitch(0);

    this.control.map.addControl(new mapboxgl.ScaleControl());
    this.control.map.touchZoomRotate.disableRotation();
    this.control.map.addControl(this.gpsMarker);
    this.control.map.addControl(this.sideButtons, "top-right");
    this.control.map.addControl(this.recenterButton, "bottom-center");
    this.control.map.addControl(this.geocoder, "top-left");
    this.control.map.addControl(this.stats, "top-left");
    this.control.map.addControl(this.navigator, "bottom-left");
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

  registerControlPosition(map, positionName) {
    if (map._controlPositions[positionName]) {
      return;
    }
    var positionContainer = document.createElement("div");
    positionContainer.className = `mapboxgl-ctrl-${positionName}`;
    map._controlContainer.appendChild(positionContainer);
    map._controlPositions[positionName] = positionContainer;
  }
}
