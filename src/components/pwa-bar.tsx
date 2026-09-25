import { Download, Smartphone, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  GITHUB_PWA_URL,
  isIframe,
  isStandalone,
  registerServiceWorker,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/register";

export function PwaBar() {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [standalone, setStandalone] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [framed, setFramed] = useState(false);
  const [swReady, setSwReady] = useState(false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    setReady(true);
    setOnline(navigator.onLine);
    setStandalone(isStandalone());
    setFramed(isIframe());
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/i.test(ua);
    setIosHint(ios && !isStandalone());

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const onInstalled = () => {
      setInstallEvent(null);
      setStandalone(true);
      setIosHint(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    void registerServiceWorker().then((reg) => {
      setSwReady(Boolean(reg));
    });
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.ready.then(() => setSwReady(true)).catch(() => undefined);
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (installEvent) {
      await installEvent.prompt();
      const choice = await installEvent.userChoice;
      if (choice.outcome === "accepted") setInstallEvent(null);
      return;
    }
    if (framed) {
      window.open(GITHUB_PWA_URL, "_blank", "noopener,noreferrer");
      return;
    }
    setHint(true);
  }

  if (!ready) return null;
  if (standalone && online) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!online ? (
        <span
          className={cn(
            "inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-elevated px-3 text-sm text-warn",
          )}
        >
          <WifiOff className="size-4" />
          آفلاین — پردازش فایل محلی ادامه دارد
        </span>
      ) : null}
      {!standalone ? (
        <Button variant="outline" onClick={() => void install()}>
          {framed ? <Smartphone /> : <Download />}
          {framed ? "نصب از گیت‌هاب" : "نصب روی دستگاه"}
        </Button>
      ) : null}
      {iosHint ? (
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
          در سافاری: Share سپس Add to Home Screen.
        </p>
      ) : null}
      {hint && !installEvent ? (
        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          از منوی مرورگر «Install app / افزودن به صفحه اصلی» را بزنید.
          {swReady ? " سرویس آفلاین آماده است." : ""}
        </p>
      ) : null}
    </div>
  );
}
