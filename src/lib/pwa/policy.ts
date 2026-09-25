export function isGrokHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host === "grok.com" || host.endsWith(".grok.com") || host.endsWith(".grok.me");
}

export function shouldRegisterServiceWorker(env: {
  hostname: string;
  protocol: string;
  secure: boolean;
  hasServiceWorker: boolean;
  prod: boolean;
}): boolean {
  if (!env.hasServiceWorker) return false;
  if (!env.secure && env.hostname !== "localhost" && env.hostname !== "127.0.0.1") return false;
  if (isGrokHost(env.hostname)) return false;
  if (env.hostname.endsWith("github.io")) return true;
  return env.prod;
}
