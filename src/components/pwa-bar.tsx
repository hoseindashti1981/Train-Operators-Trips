import { Download, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  isStandalone,
  type BeforeInstallPromptEvent,
} from "@/lib/pwa/register";

export function PwaBar() {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [standalone, setStandalone] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    setReady(true);
    setOnline(navigator.onLine);
    setStandalone(isStandalone());
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

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === "accepted") setInstallEvent(null);
  }

  if (!ready) return null;
  if (online && standalone && !installEvent) return null;

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
      {installEvent ? (
        <Button variant="outline" onClick={() => void install()}>
          <Download />
          نصب روی دستگاه
        </Button>
      ) : null}
      {iosHint && !installEvent ? (
        <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
          در سافاری: Share سپس Add to Home Screen تا آفلاین نصب شود.
        </p>
      ) : null}
    </div>
  );
}
