const DEFAULT_API_ORIGIN = 'http://localhost:5000';

export function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/+$/, '').replace(/\/api(?:\/v1)?$/i, '');
}

export function joinUrl(origin: string, route: string): string {
  const normalizedOrigin = normalizeOrigin(origin);
  const normalizedRoute = route.startsWith('/') ? route : `/${route}`;
  return `${normalizedOrigin}${normalizedRoute}`;
}

export function alignLoopbackOrigin(origin: string, pageHostname: string): string {
  if (!pageHostname || !['localhost', '127.0.0.1'].includes(pageHostname)) {
    return origin;
  }

  try {
    const url = new URL(origin);
    if (['localhost', '127.0.0.1'].includes(url.hostname)) {
      url.hostname = pageHostname;
      return url.toString().replace(/\/$/, '');
    }
  } catch {
    return origin;
  }

  return origin;
}

const pageHostname = typeof window === 'undefined' ? '' : window.location.hostname;
const configuredApiOrigin = normalizeOrigin(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || DEFAULT_API_ORIGIN
);

export const API_ORIGIN = normalizeOrigin(
  alignLoopbackOrigin(configuredApiOrigin, pageHostname)
);

export const WS_ORIGIN = normalizeOrigin(
  alignLoopbackOrigin(import.meta.env.VITE_WS_URL || API_ORIGIN, pageHostname)
)
  .replace(/^http:/, 'ws:')
  .replace(/^https:/, 'wss:');

export const apiUrl = (route: string): string => joinUrl(API_ORIGIN, route);
