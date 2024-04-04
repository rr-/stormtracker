import { CycleMapStyleButtons } from "./widgets/cycle_map_style_buttons.js";
import { GPSButtons } from "./widgets/gps_buttons.js";
import { GPSMarker } from "./widgets/gps_marker.js";
import { StatsWidget } from "./widgets/stats.js";
import { ToggleButtons } from "./widgets/toggle_buttons.js";

export class MapUI {
  constructor(masterControl) {
    this.gpsMarker = new GPSMarker(masterControl);
    this.stats = new StatsWidget();
    this.toggleButtons = new ToggleButtons(masterControl);
    this.gpsButtons = new GPSButtons(masterControl);
    this.cycleMapButtons = new CycleMapStyleButtons(masterControl);
  }

  load(map) {
    map.touchZoomRotate.disableRotation();
    map.addControl(this.gpsMarker);
    map.addControl(this.gpsButtons, "top-right");
    map.addControl(this.stats, "top-left");
    map.addControl(this.toggleButtons, "top-right");
    map.addControl(this.cycleMapButtons, "top-right");
  }
}
