import { MyGeolocateControl } from "./geolocate_control.js";
import { CycleMapStyleButtons } from "./widgets/cycle_map_style_buttons.js";
import { StatsWidget } from "./widgets/stats.js";
import { ToggleButtons } from "./widgets/toggle_buttons.js";

export class MapUI {
  constructor(masterControl) {
    this.geolocate = new MyGeolocateControl();
    this.stats = new StatsWidget();
    this.toggleButtons = new ToggleButtons(masterControl);
    this.cycleMapButtons = new CycleMapStyleButtons(masterControl);
  }

  load(map) {
    map.touchZoomRotate.disableRotation();
    map.addControl(this.geolocate);
    map.addControl(this.stats, "top-left");
    map.addControl(this.toggleButtons, "top-right");
    map.addControl(this.cycleMapButtons, "top-right");
  }
}
