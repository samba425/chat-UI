(function (window) {
  window["env"] = window["env"] || {};

  // Auto-detect environment based on hostname
  const getEnvironmentConfig = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    // Development environment
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return {
        environment: 'development',
        baseUrl: 'http://localhost:9091'
      };
    }
    
    // Production/OpenShift/VM environment
    // Uses same hostname but with port 9091 for API gateway
    return {
      environment: 'production',
      baseUrl: `${protocol}//${hostname}:9091`
    };
  };

  const config = getEnvironmentConfig();

  // Environment variables with dynamic configuration
  window["env"]["environment"] = config.environment;
  window["env"]["baseUrl"] = config.baseUrl;
  
  // API Configuration
  window["env"]["apiUrl"] = config.baseUrl + "/api";
  window["env"]["authTokenUrl"] = config.baseUrl + "/auth/token";
  window["env"]["authRegisterUrl"] = config.baseUrl + "/auth/register";
  window["env"]["netqueryApiUrl"] = config.baseUrl + "/api/v1/chat/";
  window["env"]["historyApiUrl"] = config.baseUrl + "/api/v1/chat/history/";
  window["env"]["templateApiUrl"] = config.baseUrl + "/api/v1/template";
  window["env"]["feedbackApiUrl"] = config.baseUrl + "/api/v1/feedback";
  
  // Chat API (can be same as base or different service)
  window["env"]["chatApiBaseUrl"] = config.baseUrl + "/api/v1";
  
  // Feature flags
  window["env"]["enableDebugLogging"] = config.environment === 'development';
  window["env"]["enableMockData"] = false;
  
  // Log configuration for debugging
  if (window["env"]["enableDebugLogging"]) {
    console.log('🔧 Environment Configuration:', {
      environment: config.environment,
      hostname: window.location.hostname,
      baseUrl: config.baseUrl,
      urls: {
        api: window["env"]["apiUrl"],
        auth: window["env"]["authTokenUrl"],
        netquery: window["env"]["netqueryApiUrl"],
        history: window["env"]["historyApiUrl"]
      }
    });
  }

  // Make configuration available globally for debugging
  window["envConfig"] = config;
  
})(this);
