"use client";

import { MapContainer, TileLayer, Polygon, Popup, Marker, useMapEvents, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Define simpler Zone type to avoid prisma dependency in client component if possible, or use any
type Zone = any;

// Fix Leaflet icons
const iconRetinaUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png";
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

// Only run on client
if (typeof window !== "undefined") {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
    });
}

function MapEvents({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e);
        },
    });
    return null;
}

interface MapComponentProps {
    zones: Zone[];
    sidebarOpen: boolean;
    onZoneClick: (zone: Zone) => void;
    isDrawing: boolean;
    drawingPoints: [number, number][];
    onMapClick: (lat: number, lng: number) => void;
}

export default function MapComponent({
    zones,
    sidebarOpen,
    onZoneClick,
    isDrawing,
    drawingPoints,
    onMapClick
}: MapComponentProps) {
    // Default center (Toulouse)
    const [center, setCenter] = useState<[number, number]>([43.6047, 1.4442]);

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Light theme
            />

            <MapEvents onMapClick={(e) => onMapClick(e.latlng.lat, e.latlng.lng)} />

            {/* Existing Zones */}
            {zones.map((zone) => {
                const positions = zone.coordinates as [number, number][]; // ensure correct type
                if (!positions || positions.length < 3) return null;

                return (
                    <Polygon
                        key={zone.id}
                        positions={positions}
                        pathOptions={{
                            color: zone.color,
                            fillColor: zone.color,
                            fillOpacity: 0.3,
                            weight: 2
                        }}
                        eventHandlers={{
                            click: () => onZoneClick(zone)
                        }}
                    >
                        <Tooltip permanent direction="center" className="bg-transparent border-0 shadow-none text-xs font-bold text-white drop-shadow-md">
                            {zone.name}
                        </Tooltip>
                        <Popup>
                            <div className="p-2">
                                <h3 className="font-bold text-base">{zone.name}</h3>
                                <div className="text-xs text-gray-500 mb-2">
                                    {zone.status === 'TODO' && 'À faire'}
                                    {zone.status === 'IN_PROGRESS' && 'En cours'}
                                    {zone.status === 'DONE' && 'Fait'}
                                </div>
                                <p className="text-sm">Prospection : {new Date(zone.prospectionDate).toLocaleDateString()}</p>
                                <p className="text-sm mt-1">
                                    {zone.prospects?.length || 0} prospects
                                </p>
                            </div>
                        </Popup>
                    </Polygon>
                );
            })}

            {/* Prospects Markers */}
            {zones.flatMap(zone => zone.prospects || []).map((prospect: any) => {
                if (!prospect.latitude || !prospect.longitude) return null;
                return (
                    <Marker
                        key={prospect.id}
                        position={[prospect.latitude, prospect.longitude]}
                        icon={L.divIcon({
                            className: "custom-prospect-marker",
                            html: `<div style="
                                width: 14px;
                                height: 14px;
                                background-color: ${prospect.color || '#3b82f6'};
                                border-radius: 50%;
                                border: 2px solid white;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                            "></div>`,
                            iconSize: [14, 14],
                            iconAnchor: [7, 7]
                        })}
                    >
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <h3 className="font-bold text-sm mb-1">{prospect.name}</h3>
                                {prospect.company && <div className="text-xs font-semibold text-gray-500 mb-2">{prospect.company}</div>}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800">
                                        {prospect.status}
                                    </span>
                                </div>
                                <div className="space-y-1 text-xs text-gray-500">
                                    {prospect.phone && <div>{prospect.phone}</div>}
                                    {prospect.email && <div>{prospect.email}</div>}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Drawing in Progress */}
            {isDrawing && drawingPoints.length > 0 && (
                <>
                    {/* Points */}
                    {drawingPoints.map((point, i) => (
                        <Marker key={i} position={point} />
                    ))}
                    {/* Line/Polygon preview */}
                    {drawingPoints.length > 1 && (
                        <Polygon
                            positions={drawingPoints}
                            pathOptions={{ color: "black", dashArray: "5, 5", weight: 2 }}
                        />
                    )}
                </>
            )}
        </MapContainer>
    );
}
