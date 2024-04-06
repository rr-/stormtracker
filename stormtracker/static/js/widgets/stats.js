import { htmlToElement } from "../common.js";
import { percent } from "../common.js";

export class StatsWidget {
  constructor(control) {
    this.control = control;

    this.container = htmlToElement(`
    <div class="stats">
      <div class="stat" title="Time to reload the rain layer">
        <span class="icon rain" aria-hidden="true"></span>

        <span class="rain-reload-value"></span>
        <div class="bar-outer">
          <div class="bar-inner reload rain-reload-bar"></div>
        </div>
      </div>

      <div class="stat" title="Time to reload the current strike markers">
        <span class="icon lightning" aria-hidden="true"></span>
        <span class="strikes-reload-value"></span>
        <div class="bar-outer">
          <div class="bar-inner reload strikes-reload-bar"></div>
        </div>
      </div>

      <div class="stat" title="Delay of the live strike markers">
        <span class="icon clock" aria-hidden="true"></span>
        <span class="strikes-delay-value"></span>
        <div class="bar-outer">
          <div class="bar-inner strikes-delay-bar"></div>
        </div>
      </div>
    </div>
    `);

    this.rainReloadTimeSpan = this.container.querySelector(
      ".rain-reload-value"
    );
    this.rainReloadTimeBar = this.container.querySelector(".rain-reload-bar");
    this.strikesReloadTimeSpan = this.container.querySelector(
      ".strikes-reload-value"
    );
    this.strikesReloadTimeBar = this.container.querySelector(
      ".strikes-reload-bar"
    );
    this.strikesDelaySpan = this.container.querySelector(
      ".strikes-delay-value"
    );
    this.strikesDelayBar = this.container.querySelector(".strikes-delay-bar");

    control.rain.addEventListener("tick", (event) =>
      this.handleRainTick(event)
    );
    control.strikesLive.addEventListener("strike", (event) =>
      this.handleStrike(event)
    );
    control.strikesHistoric.addEventListener("tick", (event) =>
      this.handleStrikesTick(event)
    );
  }

  onAdd(map) {
    return this.container;
  }

  handleStrikesTick(event) {
    this.setStrikeReloadTime(event.detail);
  }

  handleStrike(event) {
    this.setStrikeDelay(event.detail.strike.delay);
  }

  handleRainTick(event) {
    this.setRainReloadTime(event.detail.remaining, event.detail.refreshRate);
  }

  setRainReloadTime(remaining, refreshRate) {
    const width = percent(remaining, refreshRate);
    const value = parseInt(remaining / 1000);
    this.rainReloadTimeSpan.innerText = `${value} s`;
    this.rainReloadTimeBar.style.width = `${width}%`;
  }

  setStrikeReloadTime(chunks) {
    const value = parseInt(chunks[0].remaining / 1000);
    const width = percent(chunks[0].remaining, chunks[0].refreshRate);
    this.strikesReloadTimeSpan.innerText = `${value} s`;
    this.strikesReloadTimeBar.style.width = `${width}%`;
  }

  setStrikeDelay(delay) {
    const width = percent(delay, 24);
    const className =
      delay < 8 ? "delay-small" : delay < 16 ? "delay-medium" : "delay-big";
    this.strikesDelayBar.classList.toggle("delay-small", delay < 8);
    this.strikesDelayBar.classList.toggle(
      "delay-medium",
      delay >= 8 && delay < 16
    );
    this.strikesDelayBar.classList.toggle("delay-big", delay >= 16);
    this.strikesDelaySpan.innerText = `${delay} s`;
    this.strikesDelayBar.style.width = `${width}%`;
  }
}
