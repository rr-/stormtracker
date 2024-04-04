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
