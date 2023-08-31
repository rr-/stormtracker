const test = false;

// TODO: add ability to control lightning ranges
// TODO: improve stats appearance

(() => {
  const $map = document.getElementById('map');
  const map = new Map($map, config);

  const rainViewer = new RainViewer();
  rainViewer.addEventListener('tick', (event) => {
    map.masterControl.ui.stats.setRainReloadTime(
      event.detail.remaining,
      event.detail.refreshRate
    );
  });
  rainViewer.addEventListener('tiles', (event) => {
    map.loadRainTiles(event.detail.url);
  });

  const blitzLive = new BlitzortungLive();
  blitzLive.addEventListener('strike', (event) => {
    map.masterControl.ui.stats.setStrikeDelay(event.detail.strike.delay);
    map.addLiveStrike(event.detail.strike);
  });

  const blitzHistoric = new BlitzortungHistoric();
  blitzHistoric.addEventListener('strikes', (event) => {
    map.loadHistoricStrikes(event.detail.chunk, event.detail.strikes);
  });
  blitzHistoric.addEventListener('tick', (event) => {
    map.masterControl.ui.stats.setStrikeReloadTime(
      event.detail.remaining,
      event.detail.refreshRate
    );
  });

  if (!test) {
    blitzLive.connect();
    blitzHistoric.connect();
    rainViewer.connect();
  }

  if (test) {
    for (let n = 0; n < 24; n++) {
      map.loadHistoricStrikes(
        n,
        new Array(10).fill().map(() => ({
          lat: config.startPos.lat + (Math.random() - 0.5),
          lon: config.startPos.lon + (Math.random() - 0.5),
        }))
      );
    }

    const addTestStrike = () => {
      map.addLiveStrike({
        lat: config.startPos.lat + (Math.random() - 0.5),
        lon: config.startPos.lon + (Math.random() - 0.5),
      });
      window.setTimeout(() => addTestStrike(), 100 + Math.random() * 200);
    };

    window.setTimeout(() => addTestStrike(), 500);
  }
})();
