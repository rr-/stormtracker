const metersToPixels = (meters, zoomLevel, latitude) => {
  const mapPixels =
    meters /
    (78271.484 / 2 ** zoomLevel) /
    Math.cos((latitude * Math.PI) / 180);
  const screenPixel = mapPixels * Math.floor(devicePixelRatio);
  return screenPixel;
};

class ToggleButtons {
  constructor(masterControl) {
    this.masterControl = masterControl;

    this.div = htmlToElement(`
      <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
        <button class="sound" title="Toggle sounds">
          <span class="icon sound" aria-hidden="true"></span>
        </button>

        <button class="strikes" title="Toggle lightning strikes">
          <span class="icon lightning" aria-hidden="true"></span>
        </button>

        <button class="rain" title="Toggle rain">
          <span class="icon rain" aria-hidden="true"></span>
        </button>
      </div>
    `);

    this.soundButton = this.div.querySelector('button.sound');
    this.soundButton.addEventListener('click', () =>
      this.handleToggleSoundClick()
    );

    this.rainButton = this.div.querySelector('button.rain');
    this.rainButton.addEventListener('click', () =>
      this.handleToggleRainClick()
    );

    this.strikesButton = this.div.querySelector('button.strikes');
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
    this.div = htmlToElement(
      `<div class="mapboxgl-ctrl mapboxgl-ctrl-group"></div>`
    );
    for (let [styleIndex, style] of config.mapStyles.entries()) {
      const button = htmlToElement(`
        <button title="Set map style to ${style.name}">
          <span class="icon ${style.icon}" aria-hidden="true">
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
    this.container = htmlToElement(`
    <div>
      <div class="stat" title="Time to reload the rain layer">
        <span class="icon rain" aria-hidden="true"></span>

        <span class="rain-reload-value"></span>
        <div class="bar-outer">
          <div class="bar-inner reload rain-reload-bar"></div>
        </div>
      </div>

      <div class="stat" title="Time to reload the current strike markers">
        <span class="icon lightning" aria-hidden="true"></span>
        <span class="strikes-reload-value"></span>
        <div class="bar-outer">
          <div class="bar-inner reload strikes-reload-bar"></div>
        </div>
      </div>

      <div class="stat" title="Delay of the live strike markers">
        <span class="icon clock" aria-hidden="true"></span>
        <span class="strikes-delay-value"></span>
        <div class="bar-outer">
          <div class="bar-inner strikes-delay-bar"></div>
        </div>
      </div>
    </div>
    `);

    this.rainReloadTimeSpan =
      this.container.querySelector('.rain-reload-value');
    this.rainReloadTimeBar = this.container.querySelector('.rain-reload-bar');
    this.strikesReloadTimeSpan = this.container.querySelector(
      '.strikes-reload-value'
    );
    this.strikesReloadTimeBar = this.container.querySelector(
      '.strikes-reload-bar'
    );
    this.strikesDelaySpan = this.container.querySelector(
      '.strikes-delay-value'
    );
    this.strikesDelayBar = this.container.querySelector('.strikes-delay-bar');
  }

  setRainReloadTime(remaining, refreshRate) {
    const width = percent(remaining, refreshRate);
    const value = parseInt(remaining / 1000);
    this.rainReloadTimeSpan.innerText = `${value} s`;
    this.rainReloadTimeBar.style.width = `${width}%`;
  }

  setStrikeReloadTime(chunks) {
    const value = parseInt(chunks[0].remaining / 1000);
    const width = percent(chunks[0].remaining, chunks[0].refreshRate);
    this.strikesReloadTimeSpan.innerText = `${value} s`;
    this.strikesReloadTimeBar.style.width = `${width}%`;
  }

  setStrikeDelay(delay) {
    const width = percent(delay, 24);
    const className =
      delay < 8 ? 'delay-small' : delay < 16 ? 'delay-medium' : 'delay-big';
    this.strikesDelayBar.classList.toggle('delay-small', delay < 8);
    this.strikesDelayBar.classList.toggle(
      'delay-medium',
      delay >= 8 && delay < 16
    );
    this.strikesDelayBar.classList.toggle('delay-big', delay >= 16);
    this.strikesDelaySpan.innerText = `${delay} s`;
    this.strikesDelayBar.style.width = `${width}%`;
  }

  onAdd(map) {
    return this.container;
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

class MapUI {
  constructor(masterControl) {
    this.geolocate = new MyGeolocateControl();
    this.stats = new StatsWidget();
    this.toggleButtons = new ToggleButtons(masterControl);
    this.cycleMapButtons = new CycleMapStyleButtons(masterControl);
  }

  load(map) {
    map.touchZoomRotate.disableRotation();
    map.addControl(this.geolocate);
    map.addControl(this.stats, 'top-left');
    map.addControl(this.toggleButtons, 'top-right');
    map.addControl(this.cycleMapButtons, 'top-right');
  }
}

class MapBaseControl {
  handleStrikes(strikes) {}
  handleStrike(strikes) {}
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
    this.isReady = false;
    this.positionChanged = true;

    map.on('load', () => this.handleLoad());
    map.on('style.load', () => this.handleStyleLoad());
    map.on('moveend', () => this.handleMapMove());
    map.on('zoomed', () => this.handleMapZoom());

    this.ui = new MapUI(this);
  }

  handleStyleLoad() {
    this.removeDistractingIcons();
    this.updateMapBounds();
    this.isReady = true;
  }

  removeDistractingIcons() {
    for (let layerName of ['airport-label', 'poi-label']) {
      this.map.setPaintProperty(layerName, 'icon-opacity', 0);
    }
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

  toggleRangeCircles(enable) {
    config.rangeCirclesEnabled =
      enable !== undefined ? enable : !config.rangeCirclesEnabled;
    config.save();
  }

  toggleStrikes(enable) {
    config.strikeMarkers.enabled =
      enable !== undefined ? enable : !config.strikeMarkers.enabled;
    config.liveMarkers.enabled = config.strikeMarkers.enabled;
    config.save();
  }

  toggleTrack(enable) {
    config.trackEnabled = enable !== undefined ? enable : !config.trackEnabled;
    if (!config.trackEnabled) {
      config.followEnabled = false;
    }
    config.save();
  }

  toggleFollow(enable) {
    config.followEnabled =
      enable !== undefined ? enable : !config.followEnabled;
    if (config.followEnabled) {
      config.trackEnabled = true;
    }
    config.save();
  }

  switchMapStyle(index) {
    this.map.setStyle(config.mapStyles[index].style);
    document.body.dataset.style = config.mapStyles[index].name;
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
    if (this.masterControl.isStrikeVisible(strike) && this.masterControl.isReady) {
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
    if (event.key === 'c' || event.key === 'C') {
      this.masterControl.toggleRangeCircles();
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

    this.minSize = config.liveMarkers.minSize;
    this.maxSize = config.liveMarkers.maxSize;
    this.maxCircles = config.liveMarkers.maxCount;
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
      circle.div.style.visibility = config.liveMarkers.enabled
        ? 'visible'
        : 'hidden';
      if (this.map.getLayer(this.layerName(n))) {
        this.map.setLayoutProperty(
          this.layerName(n),
          'visibility',
          config.liveMarkers.enabled ? 'visible' : 'none'
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
    if (!this.masterControl.isStrikeVisible(strike) || !this.masterControl.isReady) {
      return;
    }

    const circle = this.circles[this.lastCircle];
    circle.start = performance.now();
    circle.phase = 0;
    circle.marker.setLngLat([strike.lon, strike.lat]);

    this.lastCircle += 1;
    this.lastCircle %= this.maxCircles;
  }

  animate() {
    for (let circle of this.circles) {
      if (circle.phase !== -1) {
        this.animateCircle(circle);
      }
    }
  }

  animateCircle(circle) {
    if (!config.liveMarkers.enabled) {
      return;
    }

    const timeDelta = performance.now() - circle.start;
    if (circle.phase === 0 && timeDelta > config.liveMarkers.timeAlive) {
      circle.phase = config.liveMarkers.persist ? 1 : -1;
    }
    if (
      circle.phase === 1 &&
      timeDelta > config.liveMarkers.timeAlivePersisted
    ) {
      circle.phase = -1;
    }

    if (circle.phase === 0) {
      const progress = 1 - timeDelta / config.liveMarkers.timeAlive;
      const opacity = progress / 1.5;
      const radius =
        (this.minSize + progress * (this.maxSize - this.minSize)) / 2;
      const stroke = 1.5;
      const size = radius * 2 + stroke * 2;
      const center = size / 2;
      circle.div.innerHTML = `<svg style='width: ${size}px; height: ${size}px; transform: translate(0, 2.5px)'>
          <circle
            cx='${center}' cy='${center}'
            r='${radius}'
            stroke='white'
            stroke-width='${stroke}'
            fill='rgba(255, 255, 255, ${opacity})'
          />
        </svg>`;
    } else if (circle.phase === 1) {
      const radius = this.minSize / 2;
      const stroke = 2;
      const size = radius * 2 + stroke * 2;
      const center = size / 2;
      circle.div.innerHTML = `<svg style='width: ${size}px; height: ${size}px; transform: translate(0, 2.5px)'>
          <circle
            cx='${center}'
            cy='${center}'
            r='${radius}'
            stroke='white'
            stroke-width='${stroke}'
            fill='none'
          />
        </svg>`;
    } else if (circle.phase === -1) {
      circle.div.innerHTML = '';
    }
  }

  layerName(n) {
    return `live-${n}`;
  }
}

class LocationRadiusControl extends MapBaseControl {
  constructor(masterControl) {
    super();
    this.masterControl = masterControl;
    this.masterControl.ui.geolocate.addEventListener('geolocate', (event) =>
      this.handleGeolocate(event.detail)
    );
    this.map = masterControl.map;
    this.map.on('style.load', () => this.handleStyleLoad());
    this.map.on('zoom', () => this.handleZoom());

    this.circles = [
      { radius: 10000, color: '#00dd00bb' },
      { radius: 25000, color: '#ffee00aa' },
      { radius: 50000, color: '#ff550099' },
      { radius: 75000, color: '#ff000088' },
    ].map((props) => ({
      ...props,
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
  }

  get isEnabled() {
    return config.rangeCirclesEnabled;
  }

  handleConfigChange() {
    for (const [n, circle] of this.circles.entries()) {
      circle.div.style.visibility = this.isEnabled ? 'visible' : 'hidden';
      if (this.map.getLayer(this.layerName(n))) {
        this.map.setLayoutProperty(
          this.layerName(n),
          'visibility',
          this.isEnabled ? 'visible' : 'none'
        );
      }
    }
  }

  handleStyleLoad() {
    for (const [n, circle] of this.circles.entries()) {
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

  handleZoom() {
    this.draw();
  }

  handleGeolocate(position) {
    this.lastKnownPosition = position;
    for (let circle of this.circles) {
      if (circle.marker) {
        circle.marker.setLngLat([position.lon, position.lat]);
      }
    }
    this.draw();
  }

  draw() {
    for (let circle of this.circles) {
      this.drawCircle(circle);
    }
  }

  drawCircle(circle) {
    if (!this.isEnabled || !this.lastKnownPosition) {
      return;
    }

    const radius = metersToPixels(
      circle.radius,
      this.map.getZoom(),
      this.lastKnownPosition.lat
    );
    const size = radius * 2;
    const center = size / 2;
    circle.div.innerHTML =
      `<svg style='width: ${size}px; height: ${size}px; transform: translate(0, 2.5px)'>` +
      `<circle cx='${center}' cy='${center}' ` +
      `r='${radius}' stroke='${circle.color}' stroke-width='1.5' fill='none'/>` +
      '</svg>';
  }

  layerName(n) {
    return `location-radius-${n}`;
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
    this.locationRadiusControl = new LocationRadiusControl(this.masterControl);

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
