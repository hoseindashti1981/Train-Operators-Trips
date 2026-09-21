const SW_URL = "/sw.js";

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;
  if (!window.isSecureContext) return null;

  try {
    const registration = await navigator.serviceWorker.register(SW_URL, { scope: "/" });
    await registration.update().catch(() => undefined);
    void warmupOfflineCache();
    return registration;
  } catch {
    return null;
  }
}

async function warmupOfflineCache() {
  try {
    const sameOrigin = performance
      .getEntriesByType("resource")
      .map((entry) => (entry as PerformanceResourceTiming).name)
      .filter((url) => url.startsWith(self.location.origin));
    await Promise.all([
      fetch("/samples/gozaresh-avaliye.xls", { cache: "reload" }).catch(() => undefined),
      fetch("/manifest.webmanifest").catch(() => undefined),
      fetch("/icon-192.png").catch(() => undefined),
      import("xlsx").catch(() => undefined),
      ...sameOrigin.slice(0, 40).map((url) => fetch(url).catch(() => undefined)),
    ]);
  } catch {
    /* first-run warmup is best-effort */
  }
}

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    launchQueue?: {
      setConsumer: (cb: (params: { files: Array<{ getFile: () => Promise<File> }> }) => void) => void;
    };
  }
}
