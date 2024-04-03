export class RainViewer extends EventTarget {
  connect() {
    this.refreshRate = 120000;
    this.lastRead = null;
    this.tick();
    window.setInterval(() => this.tick(), 1000);
  }

  async tick() {
    const refreshRate = this.refreshRate;
    const remaining = Math.max(this.lastRead + refreshRate - Date.now(), 0);
    if (remaining <= 0) {
      this.refresh();
    }
    this.dispatchEvent(
      new CustomEvent("tick", { detail: { remaining, refreshRate } }),
    );
  }

  async refresh() {
    const apiUrl = "https://api.rainviewer.com/public/weather-maps.json";
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();

    const frames = data.radar.past;
    const host = data.host;
    const path = frames[frames.length - 1].path;
    const url = `${host}${path}/256/{z}/{x}/{y}/2/1_1.png`;

    console.info(`RainViewer: Got path ${url}`);
    this.lastRead = Date.now();
    this.dispatchEvent(new CustomEvent("tiles", { detail: { url } }));
  }
}
