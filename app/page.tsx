"use client";

import { useEffect, useRef , useState } from "react";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";

import { supabase } from "@/lib/supabase";

type BusLocation = {
  id: number;
  bus_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  updated_at: string;
};

export default function Home() {
  const [bus, setBus] = useState<BusLocation | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState("Connecting to Supabase...");

  useEffect(() => {
  async function loadBusLocation() {
    const { data, error } = await supabase
      .from("bus_locations")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      setConnectionStatus(`Supabase Error: ${error.message}`);
      return;
    }

    setBus(data);
    setConnectionStatus("Supabase Connected Successfully! ✅");
  }

  // Load immediately
  loadBusLocation();

  // Check for a new location every 5 seconds
  const interval = setInterval(loadBusLocation, 5000);

  // Stop the timer when leaving the page
  return () => clearInterval(interval);
}, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold">
          🚌 College Bus Tracker
        </h1>

        <p className="mb-2 text-gray-600">
          Live college bus location
        </p>

        <p className="mb-6 text-sm text-blue-600">
          {connectionStatus}
        </p>

        <div className="h-[600px] overflow-hidden rounded-2xl border bg-white shadow">
          <Map
            center={[
              bus?.longitude ?? 80.2707,
              bus?.latitude ?? 13.0827,
            ]}
            zoom={12}
          >
            <MapControls
              showZoom
              showCompass
              showFullscreen
            />

            {bus && (
              <MapMarker
                longitude={bus.longitude}
                latitude={bus.latitude}
              >
                <MarkerContent>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl shadow-lg">
                    🚌
                  </div>
                </MarkerContent>

                <MarkerPopup>
                  <div>
                    <p className="font-semibold">
                      College Bus
                    </p>

                    <p className="text-sm text-gray-500">
                      Bus: {bus.bus_id}
                    </p>

                    <p className="text-sm text-gray-500">
                      Latitude: {bus.latitude}
                    </p>

                    <p className="text-sm text-gray-500">
                      Longitude: {bus.longitude}
                    </p>
                  </div>
                </MarkerPopup>
              </MapMarker>
            )}
          </Map>
        </div>
      </div>
    </main>
  );
}