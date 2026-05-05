const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export function getConfiguredApiBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (configuredUrl && configuredUrl !== "/") {
    return configuredUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return `http://${window.location.hostname}:3001`;
  }

  return DEFAULT_API_BASE_URL;
}
