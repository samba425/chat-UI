// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// Dynamic environment configuration that adapts to deployment context
const getBaseUrl = (): string => {
  // Check if running in development mode
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // For deployed environments, use the same host with port 8000
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:8000`;
};

// Get dynamic base URL
const dynamicBaseUrl = (window as any).env?.baseUrl || getBaseUrl();

export const environment = {
  production: false,
  
  // Dynamic URL configuration
  baseUrl: dynamicBaseUrl,
  
  // API Endpoints with dynamic base URL
  authTokenUrl: (window as any).env?.authTokenUrl || `${dynamicBaseUrl}/auth/login`,
  authRegisterUrl: (window as any).env?.authRegisterUrl || `${dynamicBaseUrl}/auth/register`,
  authTokenKey: 'authToken',
  
  // Chat API - can be different service
  chatApiBaseUrl: (window as any).env?.chatApiBaseUrl || `http://localhost:8183/api/v1`,
  
  // Main API endpoints
  netqueryApiUrl: (window as any).env?.netqueryApiUrl || `${dynamicBaseUrl}/query/stream`,
  historyApiUrl: (window as any).env?.historyApiUrl || `${dynamicBaseUrl}/history`,
  templateApiUrl: (window as any).env?.templateApiUrl || `${dynamicBaseUrl}/api/v1/template`,
  feedbackApiUrl: (window as any).env?.feedbackApiUrl || `${dynamicBaseUrl}/api/v1/feedback`,
  
  // Feature flags
  enableDebugLogging: (window as any).env?.enableDebugLogging || true,
  enableMockData: (window as any).env?.enableMockData || false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
