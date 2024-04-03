import { MapAudioControl } from "./map_audio_control.js";
import { MapKeyboardControl } from "./map_keyboard_control.js";
import { MapLocationRadiusControl } from "./map_location_radius_control.js";
import { MapMasterControl } from "./map_master_control.js";
import { MapRainControl } from "./map_rain_control.js";
import { MapStrikeHistoryControl } from "./map_strike_history_control.js";
import { MapStrikeLiveControl } from "./map_strike_live_control.js";

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

    this.map.addControl(new mapboxgl.ScaleControl());

    this.masterControl = new MapMasterControl(this.map);
    this.audioControl = new MapAudioControl(this.masterControl);
    this.keyboardControl = new MapKeyboardControl(this.masterControl);
    this.rainControl = new MapRainControl(this.masterControl);
    this.strikeLiveControl = new MapStrikeLiveControl(this.masterControl);
    this.strikeHistoryControl = new MapStrikeHistoryControl(this.masterControl);
    this.locationRadiusControl = new MapLocationRadiusControl(
      this.masterControl
    );

    this.allControls = [
      this.masterControl,
      this.audioControl,
      this.keyboardControl,
      this.rainControl,
      this.strikeLiveControl,
      this.strikeHistoryControl,
      this.locationRadiusControl,
    ];
  }

  loadRainTiles(tiles) {
    this.rainControl.handleTiles(tiles);
  }

  loadHistoricStrikes(n, strikes) {
    for (let control of this.allControls) {
      control.handleStrikes(n, strikes);
    }
  }

  addLiveStrike(strike) {
    for (let control of this.allControls) {
      control.handleStrike(strike);
    }
  }
}
