class Config extends EventTarget {}

export const config = new Config();

export const CameraFollowState = {
  Disabled: "disabled",
  Enabled: "enabled",
  Paused: "paused",
};

Object.assign(config, {
  mapboxAccessToken: MAPBOX_ACCESS_TOKEN,
  startPos: { lat: 52.3462, lon: 16.8774 },
  targetPos: localStorage.getItem("TargetPos") ?? null,
  startZoom: localStorage.getItem("MapZoom") ?? 5,
  mapStyles: [
    {
      icon: "moon",
      name: "Navigation (dark)",
      style: "mapbox://styles/mapbox/navigation-guidance-night-v4",
    },
    {
      icon: "sun",
      name: "Navigation (day)",
      style: "mapbox://styles/mapbox/navigation-guidance-day-v4",
    },
    {
      icon: "map",
      name: "Satellite",
      style: "mapbox://styles/mapbox/satellite-streets-v12",
    },
  ],
  mapStyle: localStorage.getItem("MapStyle") ?? 0,
  audioEnabled: localStorage.getItem("Audio") === "1" ?? true,
  northUpEnabled: localStorage.getItem("NorthUp") === "1" ?? true,
  trackEnabled: false,
  cameraFollowState: CameraFollowState.Disabled,
  rangeCirclesEnabled: false,
  rangePolygonsEnabled: true,
  accuracyCircleEnabled: false,
  alwaysOnEnabled: false,
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
      0,
      1,
      1,
      1,
      2,
      2,
      2,
      2,
      3,
      3,
      3,
      3,
      4,
      4,
      4,
      4,
      5,
      5,
      5,
      5,
      6,
      6,
      6,
      6,
    ],
  },
});

config.load = () => {
  if (localStorage.getItem("MapLng") !== null) {
    config.startPos.lon = +localStorage.getItem("MapLng");
    config.startPos.lat = +localStorage.getItem("MapLat");
  }
  if (localStorage.getItem("TargetLng") !== null) {
    config.targetPos = {
      lon: +localStorage.getItem("TargetLng"),
      lat: +localStorage.getItem("TargetLat"),
    };
  } else {
    config.targetPos = null;
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
  if (localStorage.getItem("FollowState") !== null) {
    if (localStorage.getItem("FollowState") === "?") {
      config.cameraFollowState = CameraFollowState.Paused;
    } else if (localStorage.getItem("FollowState") === "1") {
      config.cameraFollowState = CameraFollowState.Enabled;
    } else {
      config.cameraFollowState = CameraFollowState.Disabled;
    }
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
  if (localStorage.getItem("RangePolygons") !== null) {
    config.rangePolygonsEnabled = localStorage.getItem("RangePolygons") === "1";
  }
  if (localStorage.getItem("AlwaysOn") !== null) {
    config.alwaysOnEnabled = localStorage.getItem("AlwaysOn") === "1";
  }
};

config.save = () => {
  localStorage.setItem("MapLng", config.startPos.lon);
  localStorage.setItem("MapLat", config.startPos.lat);
  if (config.targetPos !== null) {
    localStorage.setItem("TargetLng", config.targetPos.lon);
    localStorage.setItem("TargetLat", config.targetPos.lat);
  } else {
    localStorage.setItem("TargetLng", null);
    localStorage.setItem("TargetLat", null);
  }
  localStorage.setItem("MapZoom", config.startZoom);
  localStorage.setItem("MapStyle", config.mapStyle);
  localStorage.setItem("Audio", config.audioEnabled ? "1" : "0");
  localStorage.setItem("Track", config.trackEnabled ? "1" : "0");
  localStorage.setItem("NorthUp", config.northUpEnabled ? "1" : "0");
  localStorage.setItem(
    "FollowState",
    {
      [CameraFollowState.Paused]: "?",
      [CameraFollowState.Disabled]: "0",
      [CameraFollowState.Enabled]: "1",
    }[config.cameraFollowState]
  );
  localStorage.setItem("Strikes", config.strikeMarkers.enabled ? "1" : "0");
  localStorage.setItem("Rain", config.rain.enabled ? "1" : "0");
  localStorage.setItem("RangeCircles", config.rangeCirclesEnabled ? "1" : "0");
  localStorage.setItem(
    "RangePolygons",
    config.rangePolygonsEnabled ? "1" : "0"
  );
  localStorage.setItem("AlwaysOn", config.alwaysOnEnabled ? "1" : "0");
  config.dispatchEvent(new CustomEvent("save"));
};

config.load();
