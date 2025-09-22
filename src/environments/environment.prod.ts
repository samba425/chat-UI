// Dynamic environment configuration for production
const getBaseUrl = (): string => {
  // Check if running in development mode (fallback)
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
  production: true,
  
  // Dynamic URL configuration
  baseUrl: dynamicBaseUrl,
  
  // API Endpoints with dynamic base URL
  authTokenUrl: (window as any).env?.authTokenUrl || `${dynamicBaseUrl}/auth/token`,
  authRegisterUrl: (window as any).env?.authRegisterUrl || `${dynamicBaseUrl}/auth/register`,
  authTokenKey: 'authToken',
  
  // Chat API - can be different service  
  chatApiBaseUrl: (window as any).env?.chatApiBaseUrl || `${dynamicBaseUrl}/api/v1`,
  
  // Main API endpoints
  netqueryApiUrl: (window as any).env?.netqueryApiUrl || `${dynamicBaseUrl}/api/v1/chat/`,
  historyApiUrl: (window as any).env?.historyApiUrl || `${dynamicBaseUrl}/api/v1/chat/history/`,
  templateApiUrl: (window as any).env?.templateApiUrl || `${dynamicBaseUrl}/api/v1/template`,
  feedbackApiUrl: (window as any).env?.feedbackApiUrl || `${dynamicBaseUrl}/api/v1/feedback`,
  
  // Feature flags for production
  enableDebugLogging: (window as any).env?.enableDebugLogging || false,
  enableMockData: (window as any).env?.enableMockData || false
};
