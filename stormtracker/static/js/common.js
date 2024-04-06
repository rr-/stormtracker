export const percent = (value, maxValue) => {
  return parseInt((Math.min(value, maxValue) * 10000) / maxValue) / 100;
};

export const htmlToElement = (html) => {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

export const throttle = (func, interval) => {
  let timerFlag = null;
  let lastResult = null;

  return (...args) => {
    if (timerFlag === null) {
      lastResult = func(...args);
      timerFlag = setTimeout(() => {
        timerFlag = null;
      }, interval);
    }
    return lastResult;
  };
};

export const throttleAsync = (func, interval) => {
  let timerFlag = null;
  let lastResult = null;

  return async (...args) => {
    if (timerFlag === null) {
      lastResult = await func(...args);
      timerFlag = setTimeout(() => {
        timerFlag = null;
      }, interval);
    }
    return lastResult;
  };
};

export const isDark = () => {
  const style = document.body.dataset.style;
  return style.indexOf("night") != -1 || style.indexOf("dark") != -1;
};

export const metersToPixels = (meters, zoomLevel, latitude) => {
  const mapPixels =
    meters /
    (78271.484 / 2 ** zoomLevel) /
    Math.cos((latitude * Math.PI) / 180);
  const screenPixel = mapPixels * Math.floor(devicePixelRatio);
  return screenPixel;
};
