"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
// Since MapComponent is exported as default
import type MapComponentProps from "./MapComponent.tsx"; // Wait, I need to export the type or define it here if I want strict typing

const MapComponent = dynamic(
    () => import("./MapComponent"),
    {
        ssr: false,
        loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center text-gray-400">Loading Map...</div>
    }
);

export default MapComponent;
