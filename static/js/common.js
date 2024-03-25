const percent = (value, maxValue) => {
  return parseInt((Math.min(value, maxValue) * 10000) / maxValue) / 100;
};

const htmlToElement = (html) => {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
};
