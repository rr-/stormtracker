export const CameraFollowState = {
  Disabled: "disabled",
  Enabled: "enabled",
  Paused: "paused",
};

const defaultConfig = {
  mapboxAccessToken: MAPBOX_ACCESS_TOKEN,
  startPos: { lat: 52.3462, lon: 16.8774 },
  startZoom: localStorage.getItem("MapZoom") ?? 5,
  mapStyles: [
    {
      icon: "moon",
      name: "Navigation (dark, lite)",
      style: "mapbox://styles/mapbox/navigation-guidance-night-v4",
    },
    {
      icon: "moon",
      name: "Navigation (dark)",
      style: "mapbox://styles/mapbox/navigation-night-v1",
    },
    {
      icon: "sun",
      name: "Navigation (day, lite)",
      style: "mapbox://styles/mapbox/navigation-guidance-day-v4",
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
  northUpEnabled: localStorage.getItem("NorthUp") === "1" ?? true,
  pitchEnabled: localStorage.getItem("Pitch") === "1" ?? true,
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
    minSize: 12,
    maxSize: 120,
    minBorder: 3,
    maxBorder: 10,
    timeAnimate: 500, // 1 s
    timePersist: 60000, // 60 s
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
    plusColors: {
      light: [
        "#fff989",
        "#fff31e",
        "#ffd942",
        "#ffa742",
        "#ff8421",
        "#ff1e1e",
        "#d60000",
      ],
      dark: [
        "#ffffff",
        "#ffff80",
        "#ffff00",
        "#ffaa00",
        "#ff5500",
        "#ff0000",
        "#800000",
      ],
    },
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
  userMarks: {
    size: 15,
    textSize: 15,
    username: null,
    icon: null,
    enabled: false,
  },
};

export const buildFromLocalStorage = () => {
  const result = JSON.parse(JSON.stringify(defaultConfig));
  if (localStorage.getItem("MapLng") !== null) {
    result.startPos.lon = +localStorage.getItem("MapLng");
    result.startPos.lat = +localStorage.getItem("MapLat");
  }
  if (localStorage.getItem("MapZoom") !== null) {
    result.startZoom = +localStorage.getItem("MapZoom");
  }
  if (localStorage.getItem("MapStyle") !== null) {
    result.mapStyle = +localStorage.getItem("MapStyle");
  }
  if (localStorage.getItem("Audio") !== null) {
    result.audioEnabled = localStorage.getItem("Audio") === "1";
  }
  if (localStorage.getItem("Track") !== null) {
    result.trackEnabled = localStorage.getItem("Track") === "1";
  }
  if (localStorage.getItem("FollowState") !== null) {
    if (localStorage.getItem("FollowState") === "?") {
      result.cameraFollowState = CameraFollowState.Paused;
    } else if (localStorage.getItem("FollowState") === "1") {
      result.cameraFollowState = CameraFollowState.Enabled;
    } else {
      result.cameraFollowState = CameraFollowState.Disabled;
    }
  }
  if (localStorage.getItem("Strikes") !== null) {
    result.strikeMarkers.enabled = localStorage.getItem("Strikes") === "1";
  }
  if (localStorage.getItem("StrikesOpacity") !== null) {
    result.strikeMarkers.opacity = +localStorage.getItem("StrikesOpacity");
  }
  if (localStorage.getItem("Rain") !== null) {
    result.rain.enabled = localStorage.getItem("Rain") === "1";
  }
  if (localStorage.getItem("RainOpacity") !== null) {
    result.rain.opacity = +localStorage.getItem("RainOpacity");
  }
  if (localStorage.getItem("RangeCircles") !== null) {
    result.rangeCirclesEnabled = localStorage.getItem("RangeCircles") === "1";
  }
  if (localStorage.getItem("RangePolygons") !== null) {
    result.rangePolygonsEnabled = localStorage.getItem("RangePolygons") === "1";
  }
  if (localStorage.getItem("AlwaysOn") !== null) {
    result.alwaysOnEnabled = localStorage.getItem("AlwaysOn") === "1";
  }
  if (localStorage.getItem("UserMark") !== null) {
    result.userMarks.username = localStorage.getItem("UserMark") || null;
  }
  if (localStorage.getItem("UserMarkIcon") !== null) {
    result.userMarks.icon = localStorage.getItem("UserMarkIcon") || null;
  }
  if (localStorage.getItem("UserMarks") !== null) {
    result.userMarks.enabled = localStorage.getItem("UserMarks") === "1";
  }
  return result;
};

const dumpToLocalStorage = (source) => {
  localStorage.setItem("MapLng", source.startPos.lon);
  localStorage.setItem("MapLat", source.startPos.lat);
  localStorage.setItem("MapZoom", source.startZoom);
  localStorage.setItem("MapStyle", source.mapStyle);
  localStorage.setItem("Audio", source.audioEnabled ? "1" : "0");
  localStorage.setItem("Track", source.trackEnabled ? "1" : "0");
  localStorage.setItem("NorthUp", source.northUpEnabled ? "1" : "0");
  localStorage.setItem("Pitch", source.pitchEnabled ? "1" : "0");
  localStorage.setItem(
    "FollowState",
    {
      [CameraFollowState.Paused]: "?",
      [CameraFollowState.Disabled]: "0",
      [CameraFollowState.Enabled]: "1",
    }[source.cameraFollowState]
  );
  localStorage.setItem("Strikes", source.strikeMarkers.enabled ? "1" : "0");
  localStorage.setItem(
    "StrikesOpacity",
    source.strikeMarkers.opacity.toString()
  );
  localStorage.setItem("Rain", source.rain.enabled ? "1" : "0");
  localStorage.setItem("RainOpacity", source.rain.opacity.toString());
  localStorage.setItem("RangeCircles", source.rangeCirclesEnabled ? "1" : "0");
  localStorage.setItem(
    "RangePolygons",
    source.rangePolygonsEnabled ? "1" : "0"
  );
  localStorage.setItem("AlwaysOn", source.alwaysOnEnabled ? "1" : "0");
  localStorage.setItem("UserMark", source.userMarks.username ?? "");
  localStorage.setItem("UserMarkIcon", source.userMarks.icon ?? "");
  localStorage.setItem("UserMarks", source.userMarks.enabled ? "1" : "0");
};

class Config extends EventTarget {}

export const config = new Config();
let prevConfig = null;
Object.assign(config, defaultConfig);
config.load = () => {
  Object.assign(config, buildFromLocalStorage());
  prevConfig = JSON.parse(JSON.stringify(config));
};

config.save = () => {
  if (JSON.stringify(prevConfig) === JSON.stringify(config)) {
    return;
  }

  dumpToLocalStorage(config);
  const event = new CustomEvent("save", {
    detail: { previous: prevConfig, current: config },
  });
  prevConfig = JSON.parse(JSON.stringify(config));
  config.dispatchEvent(event);
};

config.hasChanged = (event, getter) => {
  let oldValue = undefined;
  try {
    oldValue = getter(event.detail.previous);
  } catch (error) {
    oldValue = undefined;
  }
  const newValue = getter(config);
  return oldValue !== newValue;
};

config.load();
