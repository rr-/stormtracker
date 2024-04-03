class Config extends EventTarget {}

const config = new Config();

Object.assign(config, {
  mapboxAccessToken: MAPBOX_ACCESS_TOKEN,
  startPos: { lat: 16.8774, lon: 52.3462 },
  startZoom: localStorage.getItem("MapZoom") ?? 5,
  mapStyles: [
    {
      icon: "moon",
      name: "Navigation (dark)",
      style: "mapbox://styles/mapbox/navigation-night-v1",
    },
    {
      icon: "sun",
      name: "Navigation (day)",
      style: "mapbox://styles/mapbox/navigation-day-v1",
    },
    {
      icon: "map",
      name: "Satellite",
      style: "mapbox://styles/mapbox/satellite-streets-v12",
    },
  ],
  mapStyle: localStorage.getItem("MapStyle") ?? 0,
  audioEnabled: localStorage.getItem("Audio") === "1" ?? true,
  trackEnabled: false,
  followEnabled: false,
  rangeCirclesEnabled: true,
  accuracyCircleEnabled: false,
  rain: {
    enabled: true,
    opacity: 0.5,
  },
  liveMarkers: {
    enabled: true,
    persist: true,
    minSize: 16,
    maxSize: 120,
    timeAlive: 500, // 1 s
    timeAlivePersisted: 60000, // 60 s
    maxCount: 30,
  },
  strikeMarkers: {
    enabled: true,
    opacity: 0.8,
    plusResolutions: [
      { mapZoom: 0, size: 3, thickness: 1 },
      { mapZoom: 2, size: 5, thickness: 1 },
      { mapZoom: 4, size: 6, thickness: 2 },
      { mapZoom: 6, size: 8, thickness: 2 },
      { mapZoom: 8, size: 9, thickness: 3 },
      { mapZoom: 10, size: 11, thickness: 3 },
      { mapZoom: 12, size: 13, thickness: 5 },
      { mapZoom: 14, size: 15, thickness: 5 },
      { mapZoom: 16, size: 20, thickness: 6 },
      { mapZoom: 18, size: 30, thickness: 10 },
    ],
    plusColors: [
      "#ffffff",
      "#ffff80",
      "#ffff00",
      "#ffaa00",
      "#ff5500",
      "#ff0000",
      "#800000",
    ],
    chunkMarkers: [
      0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6,
    ],
  },
});

config.load = () => {
  if (localStorage.getItem("MapLng") !== null) {
    config.startPos.lon = +localStorage.getItem("MapLng");
    config.startPos.lat = +localStorage.getItem("MapLat");
  }
  if (localStorage.getItem("MapZoom") !== null) {
    config.startZoom = +localStorage.getItem("MapZoom");
  }
  if (localStorage.getItem("MapStyle") !== null) {
    config.mapStyle = +localStorage.getItem("MapStyle");
  }
  if (localStorage.getItem("Audio") !== null) {
    config.audioEnabled = localStorage.getItem("Audio") === "1";
  }
  if (localStorage.getItem("Track") !== null) {
    config.trackEnabled = localStorage.getItem("Track") === "1";
  }
  if (localStorage.getItem("Follow") !== null) {
    config.followEnabled = localStorage.getItem("Follow") === "1";
  }
  if (localStorage.getItem("Strikes") !== null) {
    config.strikeMarkers.enabled = localStorage.getItem("Strikes") === "1";
  }
  if (localStorage.getItem("Rain") !== null) {
    config.rain.enabled = localStorage.getItem("Rain") === "1";
  }
  if (localStorage.getItem("RangeCircles") !== null) {
    config.rangeCirclesEnabled = localStorage.getItem("RangeCircles") === "1";
  }
};

config.save = () => {
  localStorage.setItem("MapLng", config.startPos.lon);
  localStorage.setItem("MapLat", config.startPos.lat);
  localStorage.setItem("MapZoom", config.startZoom);
  localStorage.setItem("MapStyle", config.mapStyle);
  localStorage.setItem("Audio", config.audioEnabled ? "1" : "0");
  localStorage.setItem("Track", config.trackEnabled ? "1" : "0");
  localStorage.setItem("Follow", config.followEnabled ? "1" : "0");
  localStorage.setItem("Strikes", config.strikeMarkers.enabled ? "1" : "0");
  localStorage.setItem("Rain", config.rain.enabled ? "1" : "0");
  localStorage.setItem("RangeCircles", config.rangeCirclesEnabled ? "1" : "0");
  config.dispatchEvent(new CustomEvent("save"));
};

config.load();
