// MapSelector.js
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fixing the default icon issue
L.Marker.prototype.options.icon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow
});

function LocationMarker({ setSelectedLocation }) {
    const [position, setPosition] = useState(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            setSelectedLocation(e.latlng);
        }
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

const MapSelector = ({ setSelectedLocation }) => {
    return (
        <MapContainer center={[41.3775, 64.5855]} zoom={6} style={{ height: "400px", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker setSelectedLocation={setSelectedLocation} />
        </MapContainer>
    );
};

export default MapSelector;
