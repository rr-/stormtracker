import { htmlToElement } from "../common.js";
import { config } from "../config.js";

export class CycleMapStyleButtons {
  constructor(control) {
    this.control = control;

    this.div = htmlToElement(
      `<div class="mapboxgl-ctrl mapboxgl-ctrl-group"></div>`
    );
    for (let [styleIndex, style] of config.mapStyles.entries()) {
      const button = htmlToElement(`
        <button title="Set map style to ${style.name}">
          <span class="icon ${style.icon}" aria-hidden="true">
          </span>
        </button>
      `);
      button.addEventListener("click", () => this.handleClick(styleIndex));
      this.div.appendChild(button);
    }

    this.handleConfigChange();
    config.addEventListener("save", () => this.handleConfigChange());
  }

  onAdd(map) {
    return this.div;
  }

  handleClick(styleIndex) {
    this.control.switchMapStyle(styleIndex);
  }

  handleConfigChange() {
    for (const [styleIndex, button] of [
      ...this.div.querySelectorAll("button"),
    ].entries()) {
      button.classList.toggle("active", config.mapStyle === styleIndex);
    }
  }
}
