import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Reliable custom icon using an emoji instead of external images which can fail
const customIcon = L.divIcon({
  html: '<div style="font-size: 32px; text-align: center; margin-top: -32px; margin-left: -16px; text-shadow: 2px 2px 4px rgba(0,0,0,0.4);">📍</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
}

// Fixes Leaflet tile loading issues by invalidating size after mount
function MapFixer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
}

function MapFlyTo({ position }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (position) {
      map.flyTo(position, 16);
    }
  }, [position, map]);
  return null;
}

export default function AddressMap({ lat, lng, onChange }) {
  const [position, setPosition] = React.useState(lat && lng ? { lat, lng } : null);

  useEffect(() => {
    if (lat && lng) {
      setPosition({ lat, lng });
    }
  }, [lat, lng]);

  const handleSetPosition = (newPos) => {
    setPosition(newPos);
    onChange(newPos.lat, newPos.lng);
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          handleSetPosition({ lat: latitude, lng: longitude });
        },
        (err) => {
          alert("Could not fetch location. Please ensure location services are enabled.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
      <button 
        onClick={handleGetCurrentLocation}
        type="button"
        style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        📍 Get Current Location automatically
      </button>
      
      <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>Or click on the map to manually set your exact location:</p>
      
      <div style={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
        <MapContainer 
          center={position || [20.5937, 78.9629]} 
          zoom={position ? 15 : 5} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapFixer />
          <LocationMarker position={position} setPosition={handleSetPosition} />
          {position && <MapFlyTo position={position} />}
        </MapContainer>
      </div>
    </div>
  );
}
