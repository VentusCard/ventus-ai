import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_COLORS, type LocalPartner, type Metro } from "@/lib/merchantPartnershipData";
import { formatCurrency } from "@/lib/formatHelper";
import { loadGoogleMaps, getMapsBrowserKey } from "@/lib/googleMapsLoader";
import { Loader2, MapPin } from "lucide-react";

interface Props {
  metro: Metro;
  partners: LocalPartner[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const MAP_STYLES: Array<Record<string, unknown>> = [
  { featureType: "poi.business", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#dcfce7" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
];

/** Real Google map of the selected metro with a pin per local partner. */
export function MetroStreetMap({ metro, partners, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const mapsRef = useRef<any>(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState<LocalPartner | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const maxValue = useMemo(() => Math.max(...partners.map((p) => p.estimatedValue), 1), [partners]);

  // Init map once
  useEffect(() => {
    if (!getMapsBrowserKey()) {
      setError("Map key not configured");
      return;
    }
    let cancelled = false;
    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !containerRef.current) return;
        mapsRef.current = maps;
        mapRef.current = new maps.Map(containerRef.current, {
          center: { lat: metro.lat, lng: metro.lng },
          zoom: metro.zoom,
          styles: MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          clickableIcons: false,
          backgroundColor: "#f8fafc",
        });
        setReady(true);
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recenter on metro change
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    mapRef.current.setCenter({ lat: metro.lat, lng: metro.lng });
    mapRef.current.setZoom(metro.zoom);
  }, [ready, metro]);

  // Render markers
  useEffect(() => {
    if (!ready || !mapRef.current || !mapsRef.current) return;
    const map = mapRef.current;
    const maps = mapsRef.current;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    partners.forEach((p) => {
      const color = (CATEGORY_COLORS[p.category] ?? CATEGORY_COLORS.Dining).pin;
      const active = selectedId === p.id;
      const scale = 6 + (p.estimatedValue / maxValue) * 8;
      const marker = new maps.Marker({
        map,
        position: { lat: p.lat, lng: p.lng },
        title: p.name,
        zIndex: active ? 999 : Math.round(p.estimatedValue / 1000),
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale,
          fillColor: color,
          fillOpacity: active ? 1 : 0.85,
          strokeColor: active ? "#0f172a" : "#ffffff",
          strokeWeight: active ? 2.5 : 1.5,
        },
      });
      marker.addListener("click", () => selectRef.current(p.id));
      marker.addListener("mouseover", () => setHovered(p));
      marker.addListener("mouseout", () => setHovered((h) => (h?.id === p.id ? null : h)));
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [ready, partners, selectedId, maxValue]);

  // Pan to selection
  useEffect(() => {
    if (!ready || !mapRef.current || !selectedId) return;
    const p = partners.find((x) => x.id === selectedId);
    if (p) mapRef.current.panTo({ lat: p.lat, lng: p.lng });
  }, [ready, selectedId, partners]);

  const categories = useMemo(() => Array.from(new Set(partners.map((p) => p.category))), [partners]);

  return (
    <div
      className="relative bg-white border border-slate-200 rounded-xl overflow-hidden"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
    >
      <div ref={containerRef} className="w-full h-[440px]" />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-slate-500 text-xs gap-2">
          {error ? (
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{error}</span>
          ) : (
            <><Loader2 className="w-4 h-4 animate-spin" /> Loading {metro.name} map…</>
          )}
        </div>
      )}

      {hovered && hoverPos && (
        <div
          className="absolute pointer-events-none z-10 bg-white border border-slate-200 rounded-lg shadow-lg px-2.5 py-1.5 text-xs"
          style={{ left: Math.min(hoverPos.x + 12, 260), top: Math.max(hoverPos.y - 46, 8) }}
        >
          <p className="font-semibold text-slate-900">{hovered.name}</p>
          <p className="text-[11px] text-slate-500">{hovered.neighborhood} · {hovered.category}</p>
          <p className="text-[11px] text-slate-700 font-medium">{formatCurrency(hovered.estimatedValue)} est. annual value</p>
        </div>
      )}

      <div className="absolute bottom-2 left-2 z-10 flex flex-wrap gap-x-3 gap-y-1 bg-white/95 border border-slate-200 rounded-lg px-2.5 py-1.5 max-w-[70%]">
        {categories.map((c) => (
          <span key={c} className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="w-2 h-2 rounded-full" style={{ background: (CATEGORY_COLORS[c] ?? CATEGORY_COLORS.Dining).pin }} />
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}
