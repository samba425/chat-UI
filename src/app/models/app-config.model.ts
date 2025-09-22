export interface AppBranding {
  appName: string;
  logoUrl: string;
  faviconUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  darkModeEnabled?: boolean;
}

export interface ApiEndpoints {
  baseUrl: string;
  authTokenUrl: string;
  authRegisterUrl: string;
  chatApiBaseUrl: string;
  netqueryApiUrl: string;
  historyApiUrl: string;
  templateApiUrl: string;
  feedbackApiUrl: string;
}

export interface FeatureFlags {
  enableChat?: boolean;
  enableDataDashboard?: boolean;
  enableSettingsDashboard?: boolean;
  enableDebugLogging?: boolean;
  enableMockData?: boolean;
  enableRegistration?: boolean;
  enableThemeSwitcher?: boolean;
  enableFeedback?: boolean;
}

export interface AppConfig {
  branding: AppBranding;
  apiEndpoints: ApiEndpoints;
  features?: FeatureFlags;
  customStyles?: { [key: string]: string };
  version?: string;
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  branding: {
    appName: 'Novus.AI',
    logoUrl: '/assets/novus-logo.png',
    faviconUrl: '/assets/favicon.ico',
    primaryColor: '#0066cc',
    secondaryColor: '#004499',
    darkModeEnabled: true
  },
  apiEndpoints: {
    baseUrl: 'http://localhost:8000',
    authTokenUrl: 'http://localhost:8000/auth/login',
    authRegisterUrl: 'http://localhost:8000/auth/register',
    chatApiBaseUrl: 'http://localhost:8183/api/v1',
    netqueryApiUrl: 'http://localhost:8000/query/stream',
    historyApiUrl: 'http://localhost:8000/history',
    templateApiUrl: 'http://localhost:8000/api/v1/template',
    feedbackApiUrl: 'http://localhost:8000/api/v1/feedback'
  },
  features: {
    enableChat: true,
    enableDataDashboard: false,
    enableSettingsDashboard: false,
    enableDebugLogging: true,
    enableMockData: false,
    enableRegistration: true,
    enableThemeSwitcher: true,
    enableFeedback: true
  }
};
