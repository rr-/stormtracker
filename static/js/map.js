class UIButtons {
  constructor(masterControl) {
    this.masterControl = masterControl;

    this.div = htmlToElement(`
      <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
        <button class="mapboxgl-ctrl-sound" title="Toggle sounds">
          <span class="mapboxgl-ctrl-icon" aria-hidden="true">
          </span>
        </button>

        <button class="mapboxgl-ctrl-strikes" title="Toggle lightning strikes">
          <span class="mapboxgl-ctrl-icon" aria-hidden="true">
          </span>
        </button>

        <button class="mapboxgl-ctrl-rain" title="Toggle rain">
          <span class="mapboxgl-ctrl-icon" aria-hidden="true">
          </span>
        </button>
      </div>
    `);

    this.soundButton = this.div.querySelector('button.mapboxgl-ctrl-sound');
    this.soundButton.addEventListener('click', () =>
      this.handleToggleSoundClick()
    );

    this.rainButton = this.div.querySelector('button.mapboxgl-ctrl-rain');
    this.rainButton.addEventListener('click', () =>
      this.handleToggleRainClick()
    );

    this.strikesButton = this.div.querySelector('button.mapboxgl-ctrl-strikes');
    this.strikesButton.addEventListener('click', () =>
      this.handleToggleStrikesClick()
    );

    this.handleConfigChange();
    config.addEventListener('save', () => this.handleConfigChange());
  }

  handleToggleSoundClick() {
    this.masterControl.toggleAudio();
  }

  handleToggleRainClick() {
    this.masterControl.toggleRain();
  }

  handleToggleStrikesClick() {
    this.masterControl.toggleStrikes();
  }

  handleConfigChange() {
    this.soundButton.classList.toggle('active', config.audioEnabled);
    this.rainButton.classList.toggle('active', config.rain.enabled);
    this.strikesButton.classList.toggle('active', config.strikeMarkers.enabled);
  }

  onAdd(map) {
    return this.div;
  }
}

class CycleMapStyleButtons {
  constructor(masterControl) {
    this.masterControl = masterControl;
    this.div = htmlToElement(`
      <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
      </div>
    `);
    for (let [styleIndex, style] of config.mapStyles.entries()) {
      const button = htmlToElement(`
        <button class="mapboxgl-ctrl-${style.icon}" title="Set map style to ${style.name}">
          <span class="mapboxgl-ctrl-icon" aria-hidden="true">
          </span>
        </button>
      `);
      button.addEventListener('click', () => this.handleClick(styleIndex));
      this.div.appendChild(button);
    }

    this.handleConfigChange();
    config.addEventListener('save', () => this.handleConfigChange());
  }

  handleClick(styleIndex) {
    this.masterControl.switchMapStyle(styleIndex);
  }

  handleConfigChange() {
    for (const [styleIndex, button] of [
      ...this.div.querySelectorAll('button'),
    ].entries()) {
      button.classList.toggle('active', config.mapStyle === styleIndex);
    }
  }

  onAdd(map) {
    return this.div;
  }
}

class StatsWidget {
  constructor() {
    this.rainReloadDiv = document.createElement('div');
    this.strikeReloadDiv = document.createElement('div');
    this.strikeDelayDiv = document.createElement('div');
  }

  setRainReloadTime(remain, refreshRate) {
    const width = percent(remain, refreshRate);
    const value = parseInt(remain / 1000);
    this.rainReloadDiv.innerHTML =
      `Rain reload in: ${value} s` +
      '<div class="bar-outer">' +
      `<div class="bar-inner reload" style="width: ${width}%"></div>` +
      '</div>';
  }

  setStrikeReloadTime(remain, refreshRate) {
    const width = percent(remain, refreshRate);
    const value = parseInt(remain / 1000);
    this.strikeReloadDiv.innerHTML =
      `Strikes reload in: ${value} s` +
      '<div class="bar-outer">' +
      `<div class="bar-inner reload" style="width: ${width}%"></div>` +
      '</div>';
  }

  setStrikeDelay(delay) {
    const width = percent(delay, 24);
    const className =
      delay < 8 ? 'delay-small' : delay < 16 ? 'delay-medium' : 'delay-big';
    this.strikeDelayDiv.innerHTML =
      `Strikes delay: ${delay} s` +
      '<div class="bar-outer">' +
      `<div class="bar-inner ${className}" style="width: ${width}%"></div>` +
      '</div>';
  }

  onAdd(map) {
    const rainReloadWrapper = htmlToElement(
      '<div class="mapboxgl-ctrl mapboxgl-ctrl-attrib"></div>'
    );
    rainReloadWrapper.appendChild(this.rainReloadDiv);

    const strikeReloadWrapper = htmlToElement(
      '<div class="mapboxgl-ctrl mapboxgl-ctrl-attrib"></div>'
    );
    strikeReloadWrapper.appendChild(this.strikeReloadDiv);

    const strikeDelayWrapper = htmlToElement(
      '<div class="mapboxgl-ctrl mapboxgl-ctrl-attrib"></div>'
    );
    strikeDelayWrapper.appendChild(this.strikeDelayDiv);

    const div = document.createElement('div');
    div.appendChild(rainReloadWrapper);
    div.appendChild(strikeReloadWrapper);
    div.appendChild(strikeDelayWrapper);
    return div;
  }
}

class PlusImage {
  constructor(color, size, thickness) {
    this.color = color;
    this.size = size;
    this.thickness = thickness;
    this.width = this.size;
    this.height = this.size;
    this.data = new Uint8Array(this.width * this.height * 4);
  }

  onAdd(map) {
    this.map = map;

    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.thickness;
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(canvas.width, centerY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, canvas.height);
    ctx.stroke();

    this.data = ctx.getImageData(0, 0, this.width, this.height).data;
  }

  render() {
    return true;
  }
}

class MapBaseControl {
  handleStrikes(strikes) {}
  handleStrike(strikes) {}
}

class MapUI {
  constructor(masterControl) {
    this.geolocate = new MyGeolocateControl();
    this.stats = new StatsWidget();
    this.uiButtons = new UIButtons(masterControl);
    this.cycleMapButtons = new CycleMapStyleButtons(masterControl);
  }

  load(map) {
    map.touchZoomRotate.disableRotation();
    map.addControl(this.geolocate);
    map.addControl(this.stats, 'top-left');
    map.addControl(this.uiButtons, 'top-right');
    map.addControl(this.cycleMapButtons, 'top-right');
  }
}

class MapMasterControl extends MapBaseControl {
  constructor(map) {
    super();
    this.map = map;
    this.bounds = {
      north: 90,
      south: -90,
      west: -180,
      east: 180,
    };
    this.positionChanged = false;

    map.on('load', () => this.handleLoad());
    map.on('moveend', () => this.handleMapMove());
    map.on('zoomed', () => this.handleMapZoom());

    this.ui = new MapUI(this);
  }

  handleLoad() {
    this.ui.load(this.map);
    this.updateMapBounds();
    window.setInterval(() => this.updateMapBounds(), 2000);
  }

  handleMapMove() {
    this.positionChanged = true;
  }

  handleMapZoom() {
    this.positionChanged = true;
  }

  updateMapBounds() {
    if (!this.positionChanged) {
      return;
    }

    this.positionChanged = false;

    const MapBounds = this.map.getBounds();
    this.bounds.west = MapBounds.getWest();
    this.bounds.north = MapBounds.getNorth();
    this.bounds.east = MapBounds.getEast();
    this.bounds.south = MapBounds.getSouth();

    config.startPos.lon = this.map.getCenter().lng;
    config.startPos.lat = this.map.getCenter().lat;
    config.startZoom = this.map.getZoom();
    config.save();
  }

  cycleMapStyle() {
    this.switchMapStyle((config.mapStyle + 1) % config.mapStyles.length);
  }

  toggleAudio(enable) {
    config.audioEnabled = enable !== undefined ? enable : !config.audioEnabled;
    config.save();
  }

  toggleRain(enable) {
    config.rain.enabled = enable !== undefined ? enable : !config.rain.enabled;
    config.save();
  }

  toggleStrikes(enable) {
    config.strikeMarkers.enabled =
      enable !== undefined ? enable : !config.strikeMarkers.enabled;
    config.save();
  }

  toggleTrack(enable) {
    config.trackEnabled = enable !== undefined ? enable : !config.trackEnabled;
    if (!config.trackEnabled) {
      config.followEnabled = false;
    }
    config.save();
    this.ui.geolocate.handleChange();
  }

  toggleFollow(enable) {
    config.followEnabled =
      enable !== undefined ? enable : !config.followEnabled;
    if (config.followEnabled) {
      config.trackEnabled = true;
    }
    config.save();
    this.ui.geolocate.handleChange();
  }

  switchMapStyle(index) {
    this.map.setStyle(config.mapStyles[index].style);
    config.mapStyle = index;
    config.save();
  }

  isStrikeVisible(strike) {
    return (
      strike.lon > this.bounds.west &&
      strike.lon < this.bounds.east &&
      strike.lat < this.bounds.north &&
      strike.lat > this.bounds.south
    );
  }
}

class MapAudioControl extends MapBaseControl {
  constructor(masterControl) {
    super();
    this.masterControl = masterControl;
    this.sounds = [
      new Audio('static/sfx/t1.wav'),
      new Audio('static/sfx/t2.wav'),
      new Audio('static/sfx/t3.wav'),
      new Audio('static/sfx/t4.wav'),
      new Audio('static/sfx/t5.wav'),
      new Audio('static/sfx/t6.wav'),
      new Audio('static/sfx/t7.wav'),
      new Audio('static/sfx/t8.wav'),
      new Audio('static/sfx/t9.wav'),
    ];
    this.audioCount = 0;
    window.setInterval(() => this.tick(), 80);
  }

  handleStrike(strike) {
    if (this.masterControl.isStrikeVisible(strike)) {
      this.audioCount++;
    }
  }

  tick() {
    if (this.audioCount > 0) {
      const count = Math.min(this.sounds.length, this.audioCount);
      this.audioCount -= count;
      if (config.audioEnabled && !document.hidden) {
        this.sounds[count - 1].play();
      }
    }
  }
}

class MapKeyboardControl extends MapBaseControl {
  constructor(masterControl) {
    super();
    this.masterControl = masterControl;
    window.addEventListener('keydown', (event) => this.handleKeyDown(event));
  }

  handleKeyDown(event) {
    if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (event.key === 's' || event.key === 'S') {
      this.masterControl.cycleMapStyle();
    }

    if (event.key === 'g' || event.key === 'G') {
      // toggle dark navigation / satellite
      if (config.mapStyle === 0) {
        this.masterControl.switchMapStyle(2);
      } else {
        this.masterControl.switchMapStyle(0);
      }
    }

    if (event.key === 't' || event.key === 'T') {
      this.masterControl.toggleTrack();
    }
    if (event.key === 'f' || event.key === 'F') {
      this.masterControl.toggleFollow();
    }
    if (event.key === 'a' || event.key === 'A') {
      this.masterControl.toggleAudio();
    }
    if (event.key === 'r' || event.key === 'R') {
      this.masterControl.toggleRain();
    }
    if (event.key === '1') {
      this.masterControl.map.zoomTo(8);
    }
    if (event.key === '2') {
      this.masterControl.map.zoomTo(10);
    }
    if (event.key === '3') {
      this.masterControl.map.zoomTo(11.5);
    }
    if (event.key === '4') {
      this.masterControl.map.zoomTo(13);
    }
  }
}

class MapRainControl extends MapBaseControl {
  constructor(masterControl) {
    super();
    this.map = masterControl.map;
    this.map.on('style.load', () => this.handleStyleLoad());
    config.addEventListener('save', () => this.handleConfigChange());

    this.sourceName = 'rain-source';
    this.layerName = 'rain-layer';
    this.lastKnownUrl = null;
  }

  handleStyleLoad() {
    if (this.lastKnownUrl) {
      this.handleTiles(this.lastKnownUrl);
      this.handleConfigChange();
    }
  }

  handleConfigChange() {
    const layer = this.map.getLayer(this.layerName);
    if (layer) {
      this.map.setLayoutProperty(
        this.layerName,
        'visibility',
        config.rain.enabled ? 'visible' : 'none'
      );
    }
  }

  handleTiles(url) {
    this.lastKnownUrl = url;

    let source = this.map.getSource(this.sourceName);
    if (source) {
      source.setTiles([url]);
      return;
    }

    this.map.addSource(this.sourceName, {
      type: 'raster',
      tiles: [url],
    });

    this.map.addLayer({
      id: this.layerName,
      type: 'raster',
      source: this.sourceName,
      paint: {
        'raster-opacity': config.rain.opacity,
      },
    });

    for (let referenceLayer of ['road-label', 'road-label-navigation']) {
      if (this.map.getLayer(referenceLayer)) {
        this.map.moveLayer(this.layerName, referenceLayer);
      }
    }
  }
}

class MapStrikeHistoryControl extends MapBaseControl {
  constructor(masterControl) {
    super();
    this.map = masterControl.map;
    this.map.on('style.load', () => this.handleStyleLoad());

    config.addEventListener('save', () => this.handleConfigChange());

    this.maxChunks = BlitzortungHistoric.maxChunks;
    this.geojson = new Array(this.maxChunks)
      .fill()
      .map(() => ({ type: 'FeatureCollection', features: [] }));
  }

  handleConfigChange() {
    for (let n = 0; n < this.maxChunks; n++) {
      if (this.map.getLayer(this.layerName(n))) {
        this.map.setLayoutProperty(
          this.layerName(n),
          'visibility',
          config.strikeMarkers.enabled ? 'visible' : 'none'
        );
      }
    }
  }

  handleStyleLoad() {
    this.loadImages();

    for (let n = this.maxChunks - 1; n >= 0; n--) {
      this.map.addSource(this.sourceName(n), {
        type: 'geojson',
        data: this.geojson[n],
      });

      const plusId = config.strikeMarkers.chunkMarkers[n];

      this.map.addLayer({
        id: this.layerName(n),
        type: 'symbol',
        paint: {
          'icon-opacity': config.strikeMarkers.opacity,
        },
        layout: {
          'icon-image': {
            stops: config.strikeMarkers.plusResolutions.map((res) => [
              res.mapZoom,
              `plus-${plusId}-${res.mapZoom}`,
            ]),
          },
          'icon-size': 1,
          'icon-allow-overlap': true,
        },
        source: this.sourceName(n),
      });
    }

    this.handleConfigChange();
  }

  handleStrikes(n, strikes) {
    this.geojson[n] = {
      type: 'FeatureCollection',
      features: strikes.map(this.strikeToFeature),
    };
    this.updateSource(n);
  }

  handleStrike(strike) {
    if (config.strikeMarkers.persistLiveStrikes) {
      this.geojson[0].features.push(this.strikeToFeature(strike));
      this.updateSource(0);
    }
  }

  updateSource(n) {
    const source = this.map.getSource(this.sourceName(n));
    if (source) {
      source.setData(this.geojson[n]);
    }
  }

  sourceName(n) {
    return `history-${n}-source`;
  }

  layerName(n) {
    return `history-${n}-layer`;
  }

  strikeToFeature(strike) {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [strike.lon, strike.lat],
      },
    };
  }

  loadImages() {
    for (let [n, color] of config.strikeMarkers.plusColors.entries()) {
      for (let res of config.strikeMarkers.plusResolutions) {
        this.map.addImage(
          `plus-${n}-${res.mapZoom}`,
          new PlusImage(color, res.size, res.thickness)
        );
      }
    }
  }
}

class MapStrikeLiveControl extends MapBaseControl {
  constructor(masterControl) {
    super();
    this.masterControl = masterControl;
    this.map = masterControl.map;
    this.map.on('style.load', () => this.handleStyleLoad());

    this.maxCounter = 30;
    this.maxCircles = config.strikeMarkers.maxCircles;
    this.lastCircle = 0;
    this.circles = new Array(this.maxCircles).fill().map(() => ({
      div: document.createElement('div'),
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [] },
          },
        ],
      },
    }));

    config.addEventListener('save', () => this.handleConfigChange());

    setInterval(() => this.animate(), 59);
  }

  handleConfigChange() {
    for (let n = 0; n < this.maxCircles; n++) {
      const circle = this.circles[n];
      circle.div.style.visibility = config.strikeMarkers.enabled
        ? 'visible'
        : 'hidden';
      if (this.map.getLayer(this.layerName(n))) {
        this.map.setLayoutProperty(
          this.layerName(n),
          'visibility',
          config.strikeMarkers.enabled ? 'visible' : 'none'
        );
      }
    }
  }

  handleStyleLoad() {
    for (let n = 0; n < this.maxCircles; n++) {
      const circle = this.circles[n];
      circle.marker = new mapboxgl.Marker(circle.div)
        .setLngLat([0, -90])
        .addTo(this.map);
      this.map.addLayer({
        id: this.layerName(n),
        type: 'line',
        source: { type: 'geojson', data: circle.geojson },
      });
    }
    this.handleConfigChange();
  }

  handleStrike(strike) {
    if (!this.masterControl.isStrikeVisible(strike)) {
      return;
    }

    const circle = this.circles[this.lastCircle];
    circle.active = true;
    circle.counter = 0;
    circle.marker.setLngLat([strike.lon, strike.lat]);

    this.lastCircle += 1;
    this.lastCircle %= this.maxCircles;
  }

  animate() {
    for (let n = 0; n < this.maxCircles; n++) {
      if (this.circles[n].active) {
        this.animateCircle(this.circles[n]);
      }
    }
  }

  animateCircle(circle) {
    if (!config.strikeMarkers.enabled) {
      return;
    }

    if (circle.counter > this.maxCounter) {
      circle.active = false;
      return;
    }

    const opacity =
      1 - Math.pow(1 - (this.maxCounter - circle.counter) / this.maxCounter, 2);
    const radius =
      ((this.maxCounter - circle.counter) * config.strikeMarkers.circleSize) /
      2 /
      this.maxCounter;
    const size = config.strikeMarkers.circleSize;
    const center = size / 2;
    circle.div.innerHTML =
      `<svg style='width: ${size}px; height: ${size}px; opacity: ${opacity}; transform: translate(0, 2.5px)'>` +
      `<circle cx='${center}' cy='${center}' ` +
      `r='${radius}' stroke='red' stroke-width='1.5' fill='#ffffff55'/>` +
      '</svg>';
    circle.counter++;
  }

  layerName(n) {
    return `live-${n}`;
  }
}

class Map {
  constructor(container, config) {
    mapboxgl.accessToken = config.mapboxAccessToken;

    this.map = new mapboxgl.Map({
      container: container,
      center: [config.startPos.lat, config.startPos.lon],
      zoom: config.startZoom,
      style: config.mapStyles[config.mapStyle].style,
      hash: true,
    });

    this.masterControl = new MapMasterControl(this.map);
    this.audioControl = new MapAudioControl(this.masterControl);
    this.keyboardControl = new MapKeyboardControl(this.masterControl);
    this.rainControl = new MapRainControl(this.masterControl);
    this.strikeLiveControl = new MapStrikeLiveControl(this.masterControl);
    this.strikeHistoryControl = new MapStrikeHistoryControl(this.masterControl);

    this.allControls = [
      this.masterControl,
      this.audioControl,
      this.keyboardControl,
      this.rainControl,
      this.strikeLiveControl,
      this.strikeHistoryControl,
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
