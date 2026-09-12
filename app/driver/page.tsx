"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function DriverPage() {
  const watchId = useRef<number | null>(null);

  const [tracking, setTracking] = useState(false);
  const [status, setStatus] = useState("Not tracking");

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);

  function startTracking() {
    if (!navigator.geolocation) {
      setStatus("GPS is not supported by this browser.");
      return;
    }

    setStatus("Getting GPS location...");
    setTracking(true);

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        // Show GPS location on screen
        setLocation({
          latitude,
          longitude,
          accuracy,
        });

        // Send GPS location to Supabase
        const { error } = await supabase
          .from("bus_locations")
          .upsert(
            {
              bus_id: "BUS-01",
              latitude,
              longitude,
              accuracy,
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "bus_id",
            }
          );

        if (error) {
          console.error("Supabase error:", error);
          setStatus(`❌ Supabase Error: ${error.message}`);
          return;
        }

        setStatus("🟢 GPS tracking active — location sent!");
      },
      (error) => {
        console.error("GPS error:", error);

        setStatus("❌ Unable to get GPS location");
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  }

  function stopTracking() {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    setTracking(false);
    setStatus("Not tracking");
  }

  useEffect(() => {
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-3xl font-bold">
          🚌 Driver Mode
        </h1>

        <p className="mb-6 text-gray-600">
          College Bus Tracker
        </p>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="mb-6">
            Status: <strong>{status}</strong>
          </p>

          {location && (
            <div className="mb-6 rounded-xl bg-gray-100 p-4">
              <p>
                Latitude:{" "}
                <strong>{location.latitude.toFixed(6)}</strong>
              </p>

              <p>
                Longitude:{" "}
                <strong>{location.longitude.toFixed(6)}</strong>
              </p>

              <p>
                Accuracy:{" "}
                <strong>
                  ±{Math.round(location.accuracy)} meters
                </strong>
              </p>
            </div>
          )}

          {!tracking ? (
            <button
              onClick={startTracking}
              className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white"
            >
              📍 Start Tracking
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white"
            >
              ⛔ Stop Tracking
            </button>
          )}
        </div>
      </div>
    </main>
  );
}