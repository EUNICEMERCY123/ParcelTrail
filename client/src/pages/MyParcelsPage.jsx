// My Parcels dashboard with 3-part layout, live map, and bottom mailbox status widget (Module 4 & 6)
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ParcelsSidebar from '../components/ParcelsSidebar';
import MapFrame from '../components/MapFrame';
import ParcelSummaryCard from '../components/ParcelSummaryCard';
import OptionsPanel from '../components/OptionsPanel';
import HistoryPanel from '../components/HistoryPanel';
import PickupPanel from '../components/PickupPanel';
import JourneyStrip from '../components/JourneyStrip';
import { fetchParcels, fetchParcelById, createParcel, deleteParcel, resetParcels, simulateSensorEvent, getFlashStatus, toggleFlashStatus, fetchPickupPoints } from '../utils/api';
import { getLocationCoordinates } from '../utils/locations';

// Maps filter dropdown choice to backend status query string
const getStatusQuery = (opt) => opt === 'waiting' ? 'Expected,Deposited,Locked,Tamper Alert,Redirected' : (opt === 'picked' ? 'Collected' : '');

// Renders main 3-part parcel custody tracking dashboard
export default function MyParcelsPage() {
  const [searchParams] = useSearchParams();
  const selectParam = searchParams.get('select');
  const [parcels, setParcels] = useState([]);
  const [selectedId, setSelectedId] = useState(selectParam || '');
  const [activeParcel, setActiveParcel] = useState(null);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [panel, setPanel] = useState(null);
  const [flashOn, setFlashOn] = useState(false);
  const [actionError, setActionError] = useState('');

  // Loads parcel list according to current search and status filter
  const loadList = async (q = searchQuery, opt = filterOption) => {
    try {
      const data = await fetchParcels(q, getStatusQuery(opt));
      const list = data || [];
      setParcels(list);
      if (list.length > 0) {
        if (selectParam && list.some((p) => (p.parcelId || p.id) === selectParam)) {
          setSelectedId(selectParam);
        } else if (!selectedId) {
          setSelectedId(list[0].parcelId || list[0].id);
        }
      }
    } catch (err) { console.error(err.message); }
  };

  useEffect(() => {
    loadList();
    fetchPickupPoints().then(setPickupPoints).catch(() => {});
    getFlashStatus().then((f) => setFlashOn(f.flashOn)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectParam) setSelectedId(selectParam);
    if (!selectedId) { setActiveParcel(null); return; }
    fetchParcelById(selectedId).then(setActiveParcel).catch(console.error);
  }, [selectedId, selectParam]);

  // Updates parcel state after sensor or pickup events
  const handleUpdate = (updated) => {
    setActiveParcel(updated);
    const uid = updated.parcelId || updated.id;
    setParcels((list) => list.map((p) => ((p.parcelId || p.id) === uid ? { ...p, status: updated.status } : p)));
  };

  // Deletes active parcel and switches selection to next available
  const handleDelete = async () => {
    const pid = activeParcel ? (activeParcel.parcelId || activeParcel.id) : '';
    if (!pid || !window.confirm(`Delete record "${activeParcel.itemDescription}"?`)) return;
    try {
      await deleteParcel(pid);
      const remaining = parcels.filter((p) => (p.parcelId || p.id) !== pid);
      setParcels(remaining);
      setSelectedId(remaining.length > 0 ? (remaining[0].parcelId || remaining[0].id) : '');
      setPanel(null);
    } catch (err) { alert(err.message); }
  };

  const coords = useMemo(() => getLocationCoordinates(activeParcel ? activeParcel.currentLocation : '', pickupPoints), [activeParcel, pickupPoints]);

  return (
    <div className="parcels-desktop-container">
      <ParcelsSidebar
        parcels={parcels}
        selectedId={selectedId}
        onSelect={setSelectedId}
        searchQuery={searchQuery}
        onSearchChange={(q) => { setSearchQuery(q); loadList(q, filterOption); }}
        filterOption={filterOption}
        onFilterChange={(opt) => { setFilterOption(opt); loadList(searchQuery, opt); }}
        showAddForm={showAddForm}
        onToggleAddForm={setShowAddForm}
        onAddParcel={async (d) => { const c = await createParcel(d); setParcels([c, ...parcels]); setSelectedId(c.parcelId || c.id); setShowAddForm(false); }}
        activeStatus={activeParcel ? activeParcel.status : 'Expected'}
        onReset={async () => { const r = await resetParcels(); const list = r.parcels || []; setParcels(list); if (list.length > 0) setSelectedId(list[0].parcelId || list[0].id); }}
      />

      <main className="map-detail-pane">
        <div className="map-sticky-wrapper">
          <MapFrame lat={coords.lat} lon={coords.lon} togglePosition="top-right" title="Parcel Map" />
        </div>
        <JourneyStrip parcel={activeParcel} />
        <ParcelSummaryCard parcel={activeParcel} onPrimaryAction={async (t) => { setActionError(''); try { handleUpdate(await simulateSensorEvent(activeParcel.parcelId || activeParcel.id, t)); } catch (e) { setActionError(e.message); } }} onOpenPanel={setPanel} errorMsg={actionError} />
      </main>
      {panel && (
        <aside className="slide-panel-container">
          {panel === 'options' && <OptionsPanel parcel={activeParcel} onClose={() => setPanel(null)} onSimulate={async (t) => handleUpdate(await simulateSensorEvent(activeParcel.parcelId || activeParcel.id, t))} flashOn={flashOn} onToggleFlash={async () => { const f = await toggleFlashStatus(); setFlashOn(f.flashOn); }} onDelete={handleDelete} />}
          {panel === 'history' && <HistoryPanel parcel={activeParcel} onClose={() => setPanel(null)} />}
          {panel === 'pickup' && <PickupPanel parcel={activeParcel} onClose={() => setPanel(null)} onUpdateParcel={handleUpdate} />}
        </aside>
      )}
    </div>
  );
}
