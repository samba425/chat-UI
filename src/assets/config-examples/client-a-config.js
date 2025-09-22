// Example: Custom Configuration Script for Client A
// This file can be loaded before the Angular app to customize the appearance and API endpoints

(function (window) {
  // Custom branding for Client A
  window["appConfig"] = {
    appName: "SecureChat Pro", 
    logoUrl: "/assets/client-a-logo.png",
    faviconUrl: "/assets/client-a-favicon.ico",
    primaryColor: "#1e40af", // Blue theme
    secondaryColor: "#1e3a8a", 
    darkModeEnabled: true,
    
    // Client A's API endpoints
    baseUrl: "https://api.clienta.com",
    authTokenUrl: "https://auth.clienta.com/login",
    authRegisterUrl: "https://auth.clienta.com/register",
    chatApiBaseUrl: "https://chat.clienta.com/api/v1",
    netqueryApiUrl: "https://api.clienta.com/query/stream",
    historyApiUrl: "https://api.clienta.com/history",
    templateApiUrl: "https://api.clienta.com/api/v1/template",
    feedbackApiUrl: "https://api.clienta.com/api/v1/feedback",
    
    // Feature customization
    enableDebugLogging: false,
    enableMockData: false,
    enableRegistration: false, // Disable registration for this client
    enableThemeSwitcher: false, // Lock to single theme
    enableFeedback: true,
    
    // Custom CSS variables
    customStyles: {
      "--navbar-bg": "#1e40af",
      "--sidebar-bg": "#374151",
      "--chat-bubble-user": "#1e40af",
      "--chat-bubble-assistant": "#f3f4f6"
    },
    
    version: "2.1.0"
  };
})(window);
