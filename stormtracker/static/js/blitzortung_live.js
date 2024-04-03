export class BlitzortungLive extends EventTarget {
  constructor() {
    super();
    this.mode = "a";
    this.key = 111;
    this.hosts = ["ws1", "ws7", "ws8"];
  }

  connect() {
    const subdomain = this.hosts[Math.floor(Math.random() * this.hosts.length)];
    const url = `wss://${subdomain}.blitzortung.org/`;
    const ws = new WebSocket(url);
    ws.addEventListener("open", () => this.handleOpen());
    ws.addEventListener("close", () => this.handleClose());
    ws.addEventListener("message", (event) => this.handleEvent(event));
    ws.addEventListener("error", (event) => this.handleError(event));

    window.addEventListener("visibilitychange", () =>
      this.handleVisibilityChange(),
    );

    this.connected = false;
    this.ws = ws;
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.ws.close();
    }
  }

  decode(data) {
    const e = {};
    const d = data.split("");
    let c = d[0];
    let f = c;
    const g = [c];
    const h = 256;
    let o = h;
    for (let b = 1; b < d.length; b++) {
      let a = d[b].charCodeAt(0);
      if (h > a) {
        a = d[b];
      } else {
        a = e[a] || f + c;
      }
      g.push(a);
      c = a.charAt(0);
      e[o] = f + c;
      o++;
      f = a;
    }
    return g.join("");
  }

  handleOpen() {
    console.info(`Blitz WS: Connected to ${this.ws.url}`);
    this.ws.send(
      JSON.stringify({
        [this.mode]: this.key,
      }),
    );
  }

  handleClose() {
    console.info("Blitz WS: Disconnected, attempting to reconnect…");
    this.connected = false;
    this.connect();
  }

  handleError(event) {
    console.info("Blitz WS: Error", event);
  }

  handleEvent(event) {
    if (!this.connected) {
      this.connected = true;
    }
    let encoded = event.data;
    let decoded = this.decode(encoded);
    let data = JSON.parse(decoded);
    const strike = {
      lat: data.lat,
      lon: data.lon,
      time: data.time,
      delay: data.delay,
    };
    this.dispatchEvent(new CustomEvent("strike", { detail: { strike } }));
    console.debug("Blitz WS: Data", data);
  }
}
