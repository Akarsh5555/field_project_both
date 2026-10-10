import React, { useEffect, useRef, useState } from "react";
import { useGeolocation } from "../../hooks/useGeolocation";
import {
  saveBeatPlan,
  getDailyBeatPlan,
  updateRetailerCoordinates,
  getGoogleMapsDirectionsUrl,
  BeatPlanRetailerItem,
} from "../../integrations/supabase/beats";
import { supabase } from "../../integrations/supabase/client";

export interface Retailer {
  id: string;
  name: string;
  code?: string | null;
  address?: string | null;
  phone?: string | null;
  latitude: number | null;
  longitude: number | null;
}

export function BeatPlanningMap() {
  const { latitude: userLat, longitude: userLng, error: geoError, loading: geoLoading, getLocation } = useGeolocation();

  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [selectedPlanItems, setSelectedPlanItems] = useState<Retailer[]>([]);
  const [activeDate, setActiveDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planMessage, setPlanMessage] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const googleMapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

  // 1. Fetch available retailers
  useEffect(() => {
    async function loadRetailers() {
      const { data, error } = await supabase
        .from("retailers")
        .select("id, name, code, address, phone, latitude, longitude")
        .eq("is_active", true)
        .order("name");

      if (!error && data) {
        setRetailers(data as Retailer[]);
      }
    }
    loadRetailers();
  }, []);

  // 2. Fetch existing beat plan for active date
  useEffect(() => {
    async function loadPlan() {
      try {
        const plan = await getDailyBeatPlan(supabase, activeDate);
        if (plan.found && plan.items.length > 0) {
          const orderedRetailers: Retailer[] = plan.items.map((item: BeatPlanRetailerItem) => ({
            id: item.retailer_id,
            name: item.retailer_name,
            code: item.retailer_code,
            address: item.address,
            phone: item.phone,
            latitude: item.latitude,
            longitude: item.longitude,
          }));
          setSelectedPlanItems(orderedRetailers);
        }
      } catch (err) {
        console.error("Failed to load beat plan", err);
      }
    }
    loadPlan();
  }, [activeDate]);

  // 3. Dynamically load Google Maps script
  useEffect(() => {
    if (!apiKey) return;

    if ((window as any).google && (window as any).google.maps) {
      setMapLoaded(true);
      return;
    }

    const scriptId = "google-maps-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    }
  }, [apiKey]);

  // 4. Initialize Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !(window as any).google) return;

    const defaultCenter = userLat && userLng
      ? { lat: userLat, lng: userLng }
      : { lat: 28.6139, lng: 77.2090 }; // Default fallback: New Delhi

    if (!googleMapInstance.current) {
      googleMapInstance.current = new (window as any).google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
      });
    }
  }, [mapLoaded, userLat, userLng]);

  // 5. Render Markers & Planned Route Polyline on Map
  useEffect(() => {
    if (!googleMapInstance.current || !(window as any).google) return;

    const google = (window as any).google;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    // Sales Rep Current Location Marker
    if (userLat && userLng) {
      const userMarker = new google.maps.Marker({
        position: { lat: userLat, lng: userLng },
        map: googleMapInstance.current,
        title: "Your Location (Sales Rep)",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
      markersRef.current.push(userMarker);
      bounds.extend({ lat: userLat, lng: userLng });
      hasPoints = true;
    }

    // Retailers in Selected Beat Plan (Numbered in Visit Order)
    const routeCoords: any[] = [];
    if (userLat && userLng) {
      routeCoords.push({ lat: userLat, lng: userLng });
    }

    selectedPlanItems.forEach((ret, index) => {
      if (ret.latitude && ret.longitude) {
        const pos = { lat: ret.latitude, lng: ret.longitude };
        routeCoords.push(pos);
        bounds.extend(pos);
        hasPoints = true;

        const marker = new google.maps.Marker({
          position: pos,
          map: googleMapInstance.current,
          label: {
            text: `${index + 1}`,
            color: "#ffffff",
            fontWeight: "bold",
          },
          title: `Stop ${index + 1}: ${ret.name}`,
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 6px; font-family: sans-serif;">
              <strong>Stop #${index + 1}: ${ret.name}</strong><br/>
              <span style="font-size: 12px; color: #555;">${ret.address || "No address"}</span><br/>
              <div style="margin-top: 8px;">
                <a href="${getGoogleMapsDirectionsUrl(
                  userLat && userLng ? { latitude: userLat, longitude: userLng } : null,
                  { latitude: ret.latitude, longitude: ret.longitude }
                )}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; font-weight: bold; text-decoration: underline;">
                  Open Directions in Google Maps
                </a>
              </div>
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(googleMapInstance.current, marker);
        });

        markersRef.current.push(marker);
      }
    });

    // Draw route polyline between planned stops
    if (routeCoords.length > 1) {
      polylineRef.current = new google.maps.Polyline({
        path: routeCoords,
        geodesic: true,
        strokeColor: "#2563eb",
        strokeOpacity: 0.8,
        strokeWeight: 4,
      });
      polylineRef.current.setMap(googleMapInstance.current);
    }

    if (hasPoints) {
      googleMapInstance.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    }
  }, [selectedPlanItems, userLat, userLng, mapLoaded]);

  // Reorder functions
  const moveUp = (index: number) => {
    if (index === 0) return;
    const items = [...selectedPlanItems];
    const temp = items[index - 1];
    items[index - 1] = items[index];
    items[index] = temp;
    setSelectedPlanItems(items);
  };

  const moveDown = (index: number) => {
    if (index === selectedPlanItems.length - 1) return;
    const items = [...selectedPlanItems];
    const temp = items[index + 1];
    items[index + 1] = items[index];
    items[index] = temp;
    setSelectedPlanItems(items);
  };

  const removeItem = (id: string) => {
    setSelectedPlanItems(selectedPlanItems.filter((i) => i.id !== id));
  };

  const addRetailerToPlan = (retailer: Retailer) => {
    if (!selectedPlanItems.some((i) => i.id === retailer.id)) {
      setSelectedPlanItems([...selectedPlanItems, retailer]);
    }
  };

  const handleSavePlan = async () => {
    setSavingPlan(true);
    setPlanMessage(null);
    try {
      await saveBeatPlan(supabase, {
        planDate: activeDate,
        title: `Beat Plan - ${activeDate}`,
        retailerIds: selectedPlanItems.map((r) => r.id),
      });
      setPlanMessage("Beat plan saved successfully!");
    } catch (err: any) {
      setPlanMessage(`Failed to save: ${err.message}`);
    } finally {
      setSavingPlan(false);
    }
  };

  const handleSetCurrentLocationForRetailer = async (retailerId: string) => {
    if (!userLat || !userLng) {
      alert("Please click 'Get My Location' first to obtain GPS coordinates.");
      return;
    }
    try {
      await updateRetailerCoordinates(supabase, retailerId, userLat, userLng);
      setRetailers((prev) =>
        prev.map((r) => (r.id === retailerId ? { ...r, latitude: userLat, longitude: userLng } : r))
      );
      setSelectedPlanItems((prev) =>
        prev.map((r) => (r.id === retailerId ? { ...r, latitude: userLat, longitude: userLng } : r))
      );
      alert("Store coordinates updated to your current location!");
    } catch (err: any) {
      alert(`Error updating location: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 max-w-7xl mx-auto">
      {/* 1. Header & GPS Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Beat Planning & GPS Route</h2>
          <p className="text-sm text-gray-500">Plan daily store visits and navigate via Google Maps</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={getLocation}
            disabled={geoLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition"
          >
            {geoLoading ? "Locating..." : "📍 Get My Location"}
          </button>

          {userLat && userLng && (
            <div className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1.5 rounded-md">
              <strong>GPS:</strong> {userLat.toFixed(5)}, {userLng.toFixed(5)}
            </div>
          )}
        </div>
      </div>

      {geoError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {geoError}
        </div>
      )}

      {/* 2. Main Workspace: Beat Sequencing (Left) & Map (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Planned Route Sequencing */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Planned Route Stops</h3>
            <input
              type="date"
              value={activeDate}
              onChange={(e) => setActiveDate(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            />
          </div>

          {planMessage && (
            <div
              className={`p-2 rounded text-xs ${
                planMessage.includes("success")
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {planMessage}
            </div>
          )}

          {/* Planned Sequence List */}
          <div className="flex-1 overflow-y-auto max-h-96 flex flex-col gap-2">
            {selectedPlanItems.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                No stores in today's beat plan.<br />Select stores below to add them to your route.
              </p>
            ) : (
              selectedPlanItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="w-6 h-6 flex-shrink-0 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-medium text-gray-800 truncate">{item.name}</div>
                      <div className="text-xs text-gray-500 truncate">{item.address || "No address"}</div>
                      {!item.latitude && (
                        <span className="text-xs text-amber-600 font-medium">⚠️ Missing GPS</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="px-1.5 py-0.5 border rounded text-xs hover:bg-gray-200 disabled:opacity-30"
                      title="Move earlier"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === selectedPlanItems.length - 1}
                      className="px-1.5 py-0.5 border rounded text-xs hover:bg-gray-200 disabled:opacity-30"
                      title="Move later"
                    >
                      ▼
                    </button>
                    {item.latitude && item.longitude && (
                      <a
                        href={getGoogleMapsDirectionsUrl(
                          userLat && userLng ? { latitude: userLat, longitude: userLng } : null,
                          { latitude: item.latitude, longitude: item.longitude }
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border rounded text-xs font-medium text-blue-600"
                        title="Directions"
                      >
                        ↗
                      </a>
                    )}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 px-1 font-bold"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleSavePlan}
            disabled={savingPlan || selectedPlanItems.length === 0}
            className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-md text-sm font-semibold transition"
          >
            {savingPlan ? "Saving..." : "💾 Save Beat Plan"}
          </button>

          {/* Retailer Selector */}
          <div className="border-t pt-3">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Available Stores</h4>
            <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5">
              {retailers
                .filter((r) => !selectedPlanItems.some((p) => p.id === r.id))
                .map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2 border border-dashed rounded text-xs hover:bg-gray-50"
                  >
                    <div className="truncate pr-2">
                      <div className="font-medium text-gray-700">{r.name}</div>
                      <div className="text-gray-400 truncate">{r.address || "No address"}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!r.latitude && userLat && userLng && (
                        <button
                          onClick={() => handleSetCurrentLocationForRetailer(r.id)}
                          className="px-2 py-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300 rounded"
                          title="Set current GPS as store coordinates"
                        >
                          Pin GPS
                        </button>
                      )}
                      <button
                        onClick={() => addRetailerToPlan(r)}
                        className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded font-medium"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Column: Google Map Container */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
          {!apiKey ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50">
              <div className="text-4xl mb-2">🗺️</div>
              <h4 className="font-semibold text-gray-800">Google Maps API Key Required</h4>
              <p className="text-sm text-gray-500 max-w-md mt-1">
                Please set <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">VITE_GOOGLE_MAPS_API_KEY</code> in your frontend <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">.env</code> file to render the interactive map.
              </p>
            </div>
          ) : (
            <div ref={mapRef} className="w-full flex-1 min-h-[500px]" />
          )}
        </div>
      </div>
    </div>
  );
}
