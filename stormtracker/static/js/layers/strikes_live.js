import { htmlToElement } from "../common.js";
import { config } from "../config.js";

export class StrikesLiveLayer {
  constructor(control) {
    this.control = control;

    this.minSize = config.liveMarkers.minSize;
    this.maxSize = config.liveMarkers.maxSize;
    this.maxCircles = config.liveMarkers.maxCount;
    this.lastCircle = 0;
    this.circles = new Array(this.maxCircles).fill().map(() => ({
      div: htmlToElement("<div></div>"),
      geojson: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "LineString", coordinates: [] },
          },
        ],
      },
    }));

    setInterval(() => this.animate(), 59);
    config.addEventListener("save", () => this.handleConfigChange());
    control.map.on("style.load", () => this.handleStyleLoad());
    control.strikesLive.addEventListener("strike", (event) =>
      this.handleStrike(event)
    );
  }

  handleConfigChange() {
    for (let n = 0; n < this.maxCircles; n++) {
      const circle = this.circles[n];
      circle.div.style.visibility = config.liveMarkers.enabled
        ? "visible"
        : "hidden";
      if (this.control.map.getLayer(this.layerName(n))) {
        this.control.map.setLayoutProperty(
          this.layerName(n),
          "visibility",
          config.liveMarkers.enabled ? "visible" : "none"
        );
      }
    }
  }

  handleStyleLoad() {
    for (let n = 0; n < this.maxCircles; n++) {
      const circle = this.circles[n];
      circle.marker = new mapboxgl.Marker(circle.div)
        .setLngLat([0, -90])
        .addTo(this.control.map);
      this.control.map.addLayer({
        id: this.layerName(n),
        type: "line",
        source: { type: "geojson", data: circle.geojson },
      });
    }
    this.handleConfigChange();
  }

  handleStrike(event) {
    const strike = event.detail.strike;
    if (!this.control.isStrikeVisible(strike) || !this.control.isReady) {
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
      circle.div.innerHTML = "";
    }
  }

  layerName(n) {
    return `live-${n}`;
  }
}
