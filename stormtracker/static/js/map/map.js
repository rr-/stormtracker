import { MapAudioControl } from "./map_audio_control.js";
import { MapLocationRadiusControl } from "./map_location_radius_control.js";
import { MapLocationReachabilityControl } from "./map_location_reachability_control.js";
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
    this.rainControl = new MapRainControl(this.masterControl);
    this.strikeLiveControl = new MapStrikeLiveControl(this.masterControl);
    this.strikeHistoryControl = new MapStrikeHistoryControl(this.masterControl);
    this.locationRadiusControl = new MapLocationRadiusControl(
      this.masterControl
    );
    this.locationRadiusControl = new MapLocationReachabilityControl(
      this.masterControl
    );

    this.allControls = [
      this.masterControl,
      this.audioControl,
      this.rainControl,
      this.strikeLiveControl,
      this.strikeHistoryControl,
      this.locationRadiusControl,
    ];

    // TODO: move me to child widgets
    this.masterControl.rain.addEventListener("tick", (event) => {
      this.masterControl.ui.stats.setRainReloadTime(
        event.detail.remaining,
        event.detail.refreshRate
      );
    });
    this.masterControl.rain.addEventListener("tiles", (event) => {
      this.loadRainTiles(event.detail.url);
    });

    this.masterControl.strikesLive.addEventListener("strike", (event) => {
      this.masterControl.ui.stats.setStrikeDelay(event.detail.strike.delay);
      this.addLiveStrike(event.detail.strike);
    });

    this.masterControl.strikesHistoric.addEventListener("strikes", (event) => {
      this.loadHistoricStrikes(event.detail.chunk, event.detail.strikes);
    });
    this.masterControl.strikesHistoric.addEventListener("tick", (event) => {
      this.masterControl.ui.stats.setStrikeReloadTime(event.detail);
    });

    this.masterControl.strikesLive.connect();
    this.masterControl.strikesHistoric.connect();
    this.masterControl.rain.connect();
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
