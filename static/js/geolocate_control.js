class MyGeolocateControl {
  onAdd(map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = `mapboxgl-ctrl mapboxgl-ctrl-group`;

    this.trackButton = htmlToElement(`
      <button
        class='mapboxgl-ctrl-geolocate'
        type='button'
        title='Find my location'
        aria-label='Find my location'
      ><span class="mapboxgl-ctrl-icon" aria-hidden="true"></span></button>
    `);

    this.followButton = htmlToElement(`
      <button
        class='mapboxgl-ctrl-follow'
        type='button'
        title='Follow my location'
        aria-label='Follow my location'
      ><span class="mapboxgl-ctrl-icon" aria-hidden="true"></span></button>
    `);

    this.container.appendChild(this.trackButton);
    this.container.appendChild(this.followButton);

    this.dotElement = htmlToElement(
      '<div class="mapboxgl-user-location-dot"></div>'
    );

    this.lastKnownPosition = null;
    this.userLocationDotMarker = new mapboxgl.Marker(this.dotElement);

    this.circleElement = htmlToElement(
      '<div class="mapboxgl-user-location-accuracy-circle"></div>'
    );

    this.accuracyCircleMarker = new mapboxgl.Marker({
      element: this.circleElement,
      pitchAlignment: 'map',
    });

    this.map.on('zoom', (event) => this.handleZoom(event));

    this.trackButton.addEventListener('click', () =>
      this.handleTrackButtonClick()
    );
    this.followButton.addEventListener('click', () =>
      this.handleFollowButtonClick()
    );

    this.handleChange();
    return this.container;
  }

  handleSuccess(position) {
    this.lastKnownPosition = position;

    this.trackButton.classList.remove('waiting');
    this.trackButton.classList.remove('active-error');

    if (config.trackEnabled) {
      this.trackButton.classList.add('active');
      this.updateMarker(position);
    }

    if (config.followEnabled) {
      this.updateCamera(position);
    }

    this.dotElement.classList.remove('mapboxgl-user-location-dot-stale');
  }

  updateCamera(position) {
    this.map.setCenter([position.coords.longitude, position.coords.latitude]);
  }

  updateMarker(position) {
    if (position) {
      const center = {
        lng: position.coords.longitude,
        lat: position.coords.latitude,
      };
      this.accuracyCircleMarker.setLngLat(center).addTo(this.map);
      this.userLocationDotMarker.setLngLat(center).addTo(this.map);
      this.accuracy = position.coords.accuracy;
      this.updateCircleRadius();
    } else {
      this.userLocationDotMarker.remove();
      this.accuracyCircleMarker.remove();
    }
  }

  updateCircleRadius() {
    const y = this.map._container.clientHeight / 2;
    const a = this.map.unproject([0, y]);
    const b = this.map.unproject([1, y]);
    const metersPerPixel = a.distanceTo(b);
    const circleDiameter = Math.ceil((2.0 * this.accuracy) / metersPerPixel);
    this.circleElement.style.width = `${circleDiameter}px`;
    this.circleElement.style.height = `${circleDiameter}px`;
  }

  handleZoom(event) {
    this.updateCircleRadius();
    window.setTimeout(() => {
      if (this.lastKnownPosition && config.followEnabled) {
        this.updateCamera(this.lastKnownPosition);
      }
    }, 500);
  }

  handleError(error) {
    if (!this.map) {
      return;
    }

    if (error.code === 1) {
      // PERMISSION_DENIED
      config.trackEnabled = false;
      config.followEnabled = false;
      this.handleChange();
      this.trackButton.classList.remove('waiting');
      this.trackButton.classList.remove('active');
      this.trackButton.classList.remove('error');
      this.trackButton.disabled = true;
      this.trackButton.title = 'Location not available';
      this.followButton.disabled = true;
      this.followButton.title = 'Location not available';
    } else {
      this.trackButton.classList.add('active-error');
      this.trackButton.classList.add('waiting');
    }

    this.dotElement.classList.add('mapboxgl-user-location-dot-stale');
  }

  handleTrackButtonClick() {
    config.trackEnabled = !config.trackEnabled;
    if (!config.trackEnabled) {
      config.followEnabled = false;
    }
    config.save();
    this.handleChange();
  }

  handleFollowButtonClick() {
    config.followEnabled = !config.followEnabled;
    if (config.followEnabled) {
      config.trackEnabled = true;
    }
    config.save();
    this.handleChange();
  }

  handleChange() {
    this.circleElement.style.visibility = config.accuracyCircleEnabled ? 'visible' : 'hidden';
    this.trackButton.classList.toggle('active', config.trackEnabled);
    this.followButton.classList.toggle('active', config.followEnabled);
    if (config.trackEnabled && this.geolocationWatchID === undefined) {
      this.startWatch();
    } else if (!config.trackEnabled && this.geolocationWatchID !== undefined) {
      this.clearWatch();
    }

    if (config.followEnabled && this.map.dragPan.isEnabled()) {
      this.map.dragPan.disable();
      if (this.lastKnownPosition) {
        this.updateCamera(this.lastKnownPosition);
      }
    } else if (!config.followEnabled && !this.map.dragPan.isEnabled()) {
      this.map.dragPan.enable();
    }
  }

  startWatch() {
    this.trackButton.classList.add('waiting');
    this.geolocationWatchID = window.navigator.geolocation.watchPosition(
      (position) => this.handleSuccess(position),
      (error) => this.handleError(error),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 6000,
      }
    );
    console.info('GPS: adding watch', this.geolocationWatchID);
  }

  clearWatch() {
    console.info('GPS: clearing watch', this.geolocationWatchID);
    window.navigator.geolocation.clearWatch(this.geolocationWatchID);
    this.geolocationWatchID = undefined;
    this.trackButton.classList.remove('waiting');
    this.updateMarker(null);
  }
}
