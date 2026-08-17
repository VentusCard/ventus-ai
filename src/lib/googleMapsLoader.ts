/** Loads the Google Maps JS API once per session (browser key, async + callback). */

const CALLBACK_NAME = "__ventusGoogleMapsReady";

/** Minimal structural typing so the app does not depend on @types/google.maps. */
export type GoogleMapsApi = any;

let loadPromise: Promise<GoogleMapsApi> | null = null;

export function getMapsBrowserKey(): string | undefined {
  return import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
}

export function loadGoogleMaps(): Promise<GoogleMapsApi> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Google Maps can only load in the browser"));
      return;
    }
    const w = window as unknown as Record<string, any>;
    if (w.google?.maps) {
      resolve(w.google.maps);
      return;
    }

    const key = getMapsBrowserKey();
    if (!key) {
      reject(new Error("Google Maps browser key is not configured"));
      return;
    }

    const channel = (import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined) ?? "";

    w[CALLBACK_NAME] = () => resolve(w.google.maps);

    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}` +
      `&loading=async&callback=${CALLBACK_NAME}` +
      (channel ? `&channel=${encodeURIComponent(channel)}` : "");
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return loadPromise;
}
