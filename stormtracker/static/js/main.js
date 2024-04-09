import { config } from "./config.js";
import { Map } from "./map.js";

// TODO: add ability to control lightning ranges
// TODO: add ability to control rain opacity
// TODO: add navigation

(() => {
  const $map = document.getElementById("map");
  const map = new Map($map, config);
})();
