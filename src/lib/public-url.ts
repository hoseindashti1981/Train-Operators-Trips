/** Prefix public assets with Vite base (`/` locally, `/Train-Operators-Trips/` on GitHub Pages). */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  const clean = path.replace(/^\//, "");
  return `${base}${clean}`;
}
