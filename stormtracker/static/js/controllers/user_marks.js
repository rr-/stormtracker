import { throttleAsync } from "../common.js";
import { config } from "../config.js";

export class UserMarksController extends EventTarget {
  constructor(geolocation) {
    super();

    this.marks = [];
    this.geolocation = geolocation;

    geolocation.addEventListener("update", () =>
      this.handleGeolocationUpdate()
    );

    window.setInterval(() => {
      this.updateUserMarks();
    }, 10000);
    this.updateUserMarks();
  }

  async handleGeolocationUpdate() {
    if (config.userMarks.username !== null) {
      const apiUrl = "/user-marks/";
      const apiResponse = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: config.userMarks.username,
          position: this.geolocation.currentPosition,
        }),
      });
    }
  }

  async updateUserMarks() {
    const apiUrl = "/user-marks/";
    const apiResponse = await fetch(apiUrl);
    this.marks = await apiResponse.json();
    this.dispatchEvent(
      new CustomEvent("update", { detail: { marks: this.marks } })
    );
  }
}
