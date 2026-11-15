/**
 * Dynamic API Base URL resolver for Teepha Flowers & Fabrics
 *
 * Incremented Dev Ports:
 *  - 3331: Backend NestJS API (`http://localhost:3331/api`)
 *  - 3332: Web Storefront (`http://localhost:3332`)
 *  - 3333: Admin Panel (`http://localhost:3333`)
 *  - 3334: Mobile Preview (`http://localhost:3334`)
 */
declare const process: any;

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const port = window.location.port;
    const hostname = window.location.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      port === '3332' ||
      port === '3333' ||
      port === '3334' ||
      port === '4200' ||
      port === '4201' ||
      port === '4202'
    ) {
      return 'http://localhost:3331/api';
    }
    return '/api';
  }
  if (typeof process !== 'undefined' && process.env && process.env['API_URL']) {
    return `${process.env['API_URL']}/api`;
  }
  return 'http://localhost:3331/api';
}
