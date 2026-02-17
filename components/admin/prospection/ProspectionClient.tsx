"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Map as MapIcon, Users, ArrowLeft, ArrowRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import MapWrapper from "./MapWrapper";
import ZoneDetailDrawer from "./ZoneDetailDrawer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Types
type Zone = {
    id: string;
    name: string;
    color: string;
    status: string; // TODO, IN_PROGRESS, DONE
    prospectionDate: string | null;
    assignedTo: string[]; // IDs
    coordinates: any;
    prospects: Prospect[];
};

type Prospect = {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    company?: string;
    status: string;
    notes?: string;
    zoneId?: string;
    latitude?: number;
    longitude?: number;
    color?: string;
};

export default function ProspectionClient() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // New Zone Form
    const [isCreatingZone, setIsCreatingZone] = useState(false);
    const [newZoneData, setNewZoneData] = useState({
        name: "",
        color: "#3b82f6",
        status: "TODO",
        prospectionDate: "",
        assignedTo: [] as string[]
    });

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        try {
            const res = await fetch("/api/prospection/zones");
            if (res.ok) {
                const data = await res.json();
                setZones(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleMapClick = (lat: number, lng: number) => {
        if (!isDrawing) return;
        setDrawingPoints([...drawingPoints, [lat, lng]]);
    };

    const handleStartDrawing = () => {
        setIsDrawing(true);
        setDrawingPoints([]);
        setIsCreatingZone(true);
        setSelectedZone(null);
    };

    const handleCancelDrawing = () => {
        setIsDrawing(false);
        setDrawingPoints([]);
        setIsCreatingZone(false);
    };

    const handleSaveZone = async () => {
        if (drawingPoints.length < 3) {
            alert("Veuillez placer au moins 3 points sur la carte pour définir la zone.");
            return;
        }
        if (!newZoneData.name) {
            alert("Le nom de la zone est requis.");
            return;
        }

        try {
            const res = await fetch("/api/prospection/zones", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newZoneData,
                    coordinates: drawingPoints
                })
            });

            if (res.ok) {
                await fetchZones();
                handleCancelDrawing();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteZone = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette zone ?")) return;
        try {
            const res = await fetch(`/api/prospection/zones/${id}`, { method: "DELETE" });
            if (res.ok) {
                setZones(zones.filter(z => z.id !== id));
                if (selectedZone?.id === id) setSelectedZone(null);
            }
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className="flex h-[calc(100vh-theme(spacing.24))] overflow-hidden bg-white dark:bg-black rounded-3xl border border-gray-100 dark:border-[#333] relative">
            {/* Sidebar */}
            <div className={cn(
                "flex flex-col border-r border-gray-100 dark:border-[#333] transition-all duration-300 relative bg-white dark:bg-[#111]",
                isSidebarOpen ? "w-80 md:w-96" : "w-0"
            )}>
                <div className="p-6 border-b border-gray-100 dark:border-[#333] flex items-center justify-between min-w-[320px]">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MapIcon className="w-5 h-5" />
                        Zones de prospection
                    </h2>
                    <button
                        onClick={handleStartDrawing}
                        disabled={isDrawing || isCreatingZone}
                        className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-black"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-w-[320px]">
                    {isCreatingZone && (
                        <div className="p-4 rounded-xl border-2 border-dashed border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-700 animate-in fade-in slide-in-from-top-4">
                            <h3 className="font-bold mb-3 text-blue-900 dark:text-blue-100">Nouvelle Zone</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs font-semibold uppercase text-gray-500">Nom</label>
                                    <input
                                        type="text"
                                        value={newZoneData.name}
                                        onChange={e => setNewZoneData({ ...newZoneData, name: e.target.value })}
                                        className="w-full mt-1 p-2 rounded-lg border text-sm dark:bg-[#222] dark:border-[#444]"
                                        placeholder="Ex: Centre Ville"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-gray-500">Couleur</label>
                                    <div className="flex gap-2 mt-1">
                                        {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map(c => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setNewZoneData({ ...newZoneData, color: c })}
                                                className={cn(
                                                    "w-6 h-6 rounded-full border-2",
                                                    newZoneData.color === c ? "border-black dark:border-white scale-110" : "border-transparent"
                                                )}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-gray-500">Date prévue</label>
                                    <input
                                        type="date"
                                        value={newZoneData.prospectionDate}
                                        onChange={e => setNewZoneData({ ...newZoneData, prospectionDate: e.target.value })}
                                        className="w-full mt-1 p-2 rounded-lg border text-sm dark:bg-[#222] dark:border-[#444]"
                                    />
                                </div>
                                <div className="text-xs text-gray-500 italic">
                                    {drawingPoints.length < 3
                                        ? "Cliquez sur la carte pour dessiner la zone (min 3 points)"
                                        : `${drawingPoints.length} points placés`
                                    }
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleSaveZone}
                                        className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-bold disabled:opacity-50 dark:bg-white dark:text-black"
                                    >
                                        Enregistrer
                                    </button>
                                    <button
                                        onClick={handleCancelDrawing}
                                        className="px-3 py-2 text-gray-500 hover:text-black text-sm font-medium"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {zones.map(zone => (
                        <div
                            key={zone.id}
                            onClick={() => setSelectedZone(zone)}
                            className={cn(
                                "p-4 rounded-xl border transition-all cursor-pointer group hover:shadow-md",
                                selectedZone?.id === zone.id
                                    ? "border-black bg-gray-50 dark:border-white dark:bg-[#222]"
                                    : "border-gray-100 bg-white dark:border-[#333] dark:bg-[#1a1a1a]"
                            )}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: zone.color }}
                                    />
                                    <div>
                                        <h3 className="font-bold text-sm text-[#1f1f1f] dark:text-white">{zone.name}</h3>
                                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                                zone.status === 'TODO' && "bg-gray-100 text-gray-600",
                                                zone.status === 'IN_PROGRESS' && "bg-blue-100 text-blue-600",
                                                zone.status === 'DONE' && "bg-green-100 text-green-600",
                                            )}>
                                                {zone.status === 'TODO' ? 'À faire' : zone.status === 'IN_PROGRESS' ? 'En cours' : 'Fait'}
                                            </span>
                                            {/* Count prospects */}
                                            <span>• {zone.prospects?.length || 0} prospects</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone.id); }}
                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Toggle Button - Adjusted position logic */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={cn(
                    "absolute top-4 z-10 p-2 bg-white dark:bg-[#222] rounded-lg shadow-md border border-gray-100 dark:border-[#333] transition-all duration-300",
                    isSidebarOpen ? "left-80 md:left-96 ml-4" : "left-4"
                )}
            >
                {isSidebarOpen ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>

            {/* Map Area */}
            <div className="flex-1 relative h-full">
                <MapWrapper
                    zones={zones}
                    sidebarOpen={isSidebarOpen}
                    onZoneClick={setSelectedZone}
                    isDrawing={isDrawing}
                    drawingPoints={drawingPoints}
                    onMapClick={handleMapClick}
                />
            </div>

            {/* Prospect Drawer / Details Panel */}
            {selectedZone && (
                <div className="absolute inset-0 z-50 pointer-events-none flex justify-end">
                    <div className="pointer-events-auto h-full">
                        <ZoneDetailDrawer
                            zone={selectedZone}
                            onClose={() => setSelectedZone(null)}
                            onUpdate={fetchZones}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
