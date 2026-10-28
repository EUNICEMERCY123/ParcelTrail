// Reusable Google Maps iframe container with Map and Satellite mode toggle (Module 1 iframe)
import React, { useState } from 'react';
import { getMapUrl } from '../utils/locations';

function MapFrame({ lat, lon, togglePosition = 'top-right', title = 'Location Map', children }) {
  const [mapMode, setMapMode] = useState('m');

  const mapSrc = getMapUrl(lat, lon, mapMode);
  const toggleClass = togglePosition === 'top-left' ? 'map-toggle-top-left' : 'map-toggle-top-right';

  return (
    <div className="map-frame-container">
      <div className="map-live-indicator">
        <span className="live-pulse-dot" />
        <span className="live-text">Live (simulated)</span>
      </div>

      <div className={`map-mode-toggle ${toggleClass}`}>
        <button
          type="button"
          className={`toggle-btn ${mapMode === 'm' ? 'active' : ''}`}
          onClick={() => setMapMode('m')}
        >
          Map
        </button>
        <button
          type="button"
          className={`toggle-btn ${mapMode === 'k' ? 'active' : ''}`}
          onClick={() => setMapMode('k')}
        >
          Satellite
        </button>
      </div>

      <iframe
        title={title}
        src={mapSrc}
        className="map-frame map-iframe"
        loading="lazy"
      />
    </div>
  );
}

export default MapFrame;
