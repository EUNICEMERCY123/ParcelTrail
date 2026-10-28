// Pickup spots page with single-pin map and parcel redirection form (Module 1 iframe & Module 4 React)
import React, { useState, useEffect } from 'react';
import MapFrame from '../components/MapFrame';
import JourneyStrip from '../components/JourneyStrip';
import { fetchParcels, fetchPickupPoints, redirectParcel } from '../utils/api';
import { MAILBOX_LOCATION } from '../utils/locations';
import { STATUS_META } from '../utils/labels';

function PickupPointsPage() {
  const [pickupPoints, setPickupPoints] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [selectedPointId, setSelectedPointId] = useState('PT-01');
  const [selectedParcelId, setSelectedParcelId] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    Promise.all([fetchPickupPoints(), fetchParcels()]).then(([pts, prcls]) => {
      setPickupPoints(pts || []); setParcels(prcls || []);
      const el = (prcls || []).find((p) => !['Collected', 'Redirected'].includes(p.status));
      if (el) setSelectedParcelId(el.parcelId || el.id);
    }).catch(console.error);
  }, []);

  const activePoint = pickupPoints.find((p) => (p.pointId || p.id) === selectedPointId) || pickupPoints[0];
  const eligibleParcels = parcels.filter((p) => !['Collected', 'Redirected'].includes(p.status));

  const handleRedirect = async (e) => {
    e.preventDefault();
    if (!selectedParcelId || !activePoint) return;
    setFeedback(''); setErrorMsg('');
    try {
      await redirectParcel(selectedParcelId, activePoint.name, activePoint.address);
      setParcels(await fetchParcels());
      setFeedback(`Success: Parcel sent to ${activePoint.name} for pickup.`);
    } catch (err) { setErrorMsg(err.message); }
  };

  const spotLat = activePoint?.lat || MAILBOX_LOCATION.lat;
  const spotLon = activePoint?.lon || MAILBOX_LOCATION.lon;
  const spotName = activePoint?.name || 'spot';

  return (
    <div className="parcels-desktop-container page-fade-in">
      <aside className="parcels-sidebar-list">
        <div className="sidebar-fixed-header">
          <span className="eyebrow-badge">Directory</span>
          <h2 className="sidebar-section-title">Pickup <em>spots.</em></h2>
          <span className="sidebar-section-sub">Sample locations near Karunya</span>
        </div>
        <div className="parcels-scroll-area mt-2">
          {pickupPoints.map((pt) => {
            const ptId = pt.pointId || pt.id;
            const isSelected = ptId === selectedPointId;
            return (
              <div
                key={ptId}
                className={`point-card spot-card-item ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedPointId(ptId)}
                role="button"
              >
                <div className="spot-name">{pt.name}</div>
                <div className="spot-address">{pt.address}</div>
                <div className="spot-distance">{pt.distance}</div>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="map-detail-pane">
        <div className="map-sticky-wrapper pickup-map-wrapper">
          <MapFrame
            lat={spotLat}
            lon={spotLon}
            togglePosition="top-right"
            title="Pickup Spot Map"
          />
        </div>

        <JourneyStrip parcel={{ status: 'Redirected' }} />

        <div className="redirect-bottom-card">
            <div className="redirect-header">
              <span className="eyebrow-badge">Reroute delivery</span>
              <h4 className="redirect-title">Redirect a <em>parcel.</em></h4>
              <span className="redirect-sub">Sample locations, not live tracking.</span>
            </div>

            {feedback && <div className="panel-success-line mb-2">{feedback}</div>}
            {errorMsg && <div className="panel-error-line mb-2">{errorMsg}</div>}

            {eligibleParcels.length > 0 ? (
              <form onSubmit={handleRedirect} className="redirect-form-col">
                <select
                  className="panel-select w-100 mb-2"
                  value={selectedParcelId}
                  onChange={(e) => setSelectedParcelId(e.target.value)}
                >
                  {eligibleParcels.map((p) => (
                    <option key={p.parcelId || p.id} value={p.parcelId || p.id}>
                      {p.itemDescription} ({STATUS_META[p.status]?.label || p.status})
                    </option>
                  ))}
                </select>
                <button type="submit" className="btn btn-primary w-100" style={{ whiteSpace: 'normal', lineHeight: 1.4 }}>Send it to {spotName}</button>
              </form>
            ) : (
              <p className="activity-empty text-start py-1">No parcels eligible for redirect.</p>
            )}
          </div>
        </main>
      </div>
  );
}

export default PickupPointsPage;
