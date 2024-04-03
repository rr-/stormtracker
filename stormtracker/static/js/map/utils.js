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
