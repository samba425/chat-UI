// Example: Custom Configuration Script for Client B
// This file can be loaded before the Angular app to customize the appearance and API endpoints

(function (window) {
  // Custom branding for Client B - Red theme
  window["appConfig"] = {
    appName: "Enterprise AI Assistant", 
    logoUrl: "/assets/client-b-logo.png",
    faviconUrl: "/assets/client-b-favicon.ico",
    primaryColor: "#dc2626", // Red theme
    secondaryColor: "#b91c1c", 
    darkModeEnabled: true,
    
    // Client B's API endpoints
    baseUrl: "https://enterprise.clientb.net",
    authTokenUrl: "https://enterprise.clientb.net/auth/token",
    authRegisterUrl: "https://enterprise.clientb.net/auth/signup",
    chatApiBaseUrl: "https://chat-service.clientb.net/v2",
    netqueryApiUrl: "https://enterprise.clientb.net/ai/stream",
    historyApiUrl: "https://enterprise.clientb.net/history/user",
    templateApiUrl: "https://enterprise.clientb.net/v2/templates",
    feedbackApiUrl: "https://enterprise.clientb.net/v2/feedback",
    
    // Feature customization
    enableDebugLogging: false,
    enableMockData: false,
    enableRegistration: true,
    enableThemeSwitcher: true,
    enableFeedback: true,
    
    // Custom CSS variables
    customStyles: {
      "--navbar-bg": "#dc2626",
      "--sidebar-bg": "#4b5563",
      "--chat-bubble-user": "#dc2626",
      "--chat-bubble-assistant": "#f9fafb",
      "--border-radius": "8px"
    },
    
    version: "1.5.2"
  };
})(window);
