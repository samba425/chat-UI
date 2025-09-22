export const environment = {
  production: true,
  
  // Legacy support - these will be overridden by ConfigService
  authTokenKey: 'authToken',
  
  // Feature flags - will be overridden by ConfigService
  enableDebugLogging: false,
  enableMockData: false
};
