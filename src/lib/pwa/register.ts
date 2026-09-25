import { publicUrl } from "@/lib/public-url";
import { shouldRegisterServiceWorker } from "./policy";

export { isGrokHost, shouldRegisterServiceWorker } from "./policy";

export const GITHUB_PWA_URL = "https://hoseindashti1981.github.io/Train-Operators-Trips/docs/";

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function isIframe(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined") return null;
  const ok = shouldRegisterServiceWorker({
    hostname: location.hostname,
    protocol: location.protocol,
    secure: window.isSecureContext,
    hasServiceWorker: "serviceWorker" in navigator,
    prod: import.meta.env.PROD,
  });
  if (!ok) return null;

  try {
    const registration = await navigator.serviceWorker.register(publicUrl("sw.js"), {
      scope: import.meta.env.BASE_URL || "./",
      updateViaCache: "none",
    });
    await registration.update().catch(() => undefined);
    void warmupOfflineCache();
    return registration;
  } catch (err) {
    console.warn("[pwa] service worker register failed", err);
    return null;
  }
}

async function warmupOfflineCache() {
  try {
    const origin = self.location.origin;
    const sameOrigin = performance
      .getEntriesByType("resource")
      .map((entry) => (entry as PerformanceResourceTiming).name)
      .filter((url) => url.startsWith(origin));
    await Promise.all([
      fetch(publicUrl("samples/gozaresh-avaliye.xls"), { cache: "reload" }).catch(() => undefined),
      fetch(publicUrl("manifest.json")).catch(() => undefined),
      fetch(publicUrl("manifest.webmanifest")).catch(() => undefined),
      fetch(publicUrl("icon-192.png")).catch(() => undefined),
      fetch(publicUrl("icon-512.png")).catch(() => undefined),
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
