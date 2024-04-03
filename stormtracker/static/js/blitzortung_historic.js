export class BlitzortungHistoric extends EventTarget {
  static maxChunks = 24;

  constructor() {
    super();
    this.dataSources = [
      { refreshRate: 60000, lastRead: null, data: [] },
      { refreshRate: 300000, lastRead: null, data: [] },
      { refreshRate: 305000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
      { refreshRate: 310000, lastRead: null, data: [] },
    ];
  }

  connect() {
    this.refresh();
    window.setInterval(() => this.refresh(), 1100);
  }

  refresh() {
    if (document.hidden) {
      return;
    }

    if (this.chunkNeedsRefresh(1)) {
      this.rollOverChunks();
    }

    for (let n = 0; n < 24; n++) {
      if (this.chunkNeedsRefresh(n)) {
        this.refreshChunk(n);
      }
    }

    this.dispatchEvent(
      new CustomEvent("tick", {
        detail: this.dataSources.map((dataSource) => ({
          remaining: dataSource.lastRead + dataSource.refreshRate - Date.now(),
          refreshRate: dataSource.refreshRate,
        })),
      }),
    );
  }

  chunkNeedsRefresh(n) {
    const dataSource = this.dataSources[n];
    return (
      !dataSource.lastRead ||
      Date.now() > dataSource.lastRead + dataSource.refreshRate
    );
  }

  rollOverChunks() {
    // every 5 minutes, rotate historic 5-minute chunk
    // first two chunks are exceptions.
    for (let n = 23; n >= 2; n--) {
      const dataSource = this.dataSources[n];
      const prevDataSource = this.dataSources[n - 1];
      dataSource.data = prevDataSource.data;
      dataSource.lastRead = prevDataSource.lastRead + 305000;
      this.dispatchEvent(
        new CustomEvent("strikes", {
          detail: { chunk: n, strikes: dataSource.data },
        }),
      );
    }
  }

  async refreshChunk(n) {
    console.info(`Blitz JSON: Refreshing chunk ${n}`);
    const dataSource = this.dataSources[n];
    dataSource.lastRead = Date.now();
    dataSource.data = await this.getChunkData(n);

    this.dispatchEvent(
      new CustomEvent("strikes", {
        detail: { chunk: n, strikes: dataSource.data },
      }),
    );
  }

  async getChunkData(n) {
    const apiUrl = `${ROOT_URL}/blitzortung-geojson/?n=${n}`;
    const apiResponse = await fetch(apiUrl);
    const data = await apiResponse.json();
    return data.map((strike) => ({
      lat: strike[1],
      lon: strike[0],
      time: strike[2],
    }));
  }
}
