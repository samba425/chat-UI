// Environment Template for Dynamic Configuration
// This file can be customized for specific deployment environments

(function (window) {
  window["env"] = window["env"] || {};

  // ===========================================
  // ENVIRONMENT CONFIGURATION
  // ===========================================
  
  // Override these values for specific environments
  // If not set, will auto-detect based on hostname
  
  // Manual override for base URL (optional)
  // window["env"]["baseUrl"] = "http://your-vm-ip:9091";
  
  // Manual override for environment type (optional)
  // window["env"]["environment"] = "production";
  
  // ===========================================
  // API ENDPOINT OVERRIDES (OPTIONAL)
  // ===========================================
  
  // Uncomment and customize for specific environments
  
  // Authentication endpoints
  // window["env"]["authTokenUrl"] = "http://your-vm-ip:9091/auth/token";
  // window["env"]["authRegisterUrl"] = "http://your-vm-ip:9091/auth/register";
  
  // Chat and AI endpoints
  // window["env"]["netqueryApiUrl"] = "http://your-vm-ip:9091/api/v1/chat/";
  // window["env"]["historyApiUrl"] = "http://your-vm-ip:9091/api/v1/chat/history/";
  // window["env"]["chatApiBaseUrl"] = "http://your-vm-ip:9091/api/v1";
  
  // Template and feedback endpoints
  // window["env"]["templateApiUrl"] = "http://your-vm-ip:9091/api/v1/template";
  // window["env"]["feedbackApiUrl"] = "http://your-vm-ip:9091/api/v1/feedback";
  
  // ===========================================
  // FEATURE FLAGS
  // ===========================================
  
  // Debug logging (useful for troubleshooting)
  // window["env"]["enableDebugLogging"] = true;
  
  // Mock data for testing
  // window["env"]["enableMockData"] = false;
  
  // ===========================================
  // EXAMPLES FOR DIFFERENT ENVIRONMENTS
  // ===========================================
  
  /*
  // Example 1: VM Deployment
  window["env"]["baseUrl"] = "http://10.196.209.153:9091";
  
  // Example 2: OpenShift Deployment
  window["env"]["baseUrl"] = "https://incident-copilot.apps.ocp-cluster.com:9091";
  
  // Example 3: Custom Domain
  window["env"]["baseUrl"] = "https://copilot.yourcompany.com:9091";
  
  // Example 4: Different Service Ports
  window["env"]["authTokenUrl"] = "http://your-vm-ip:8080/auth/token";
  window["env"]["chatApiBaseUrl"] = "http://your-vm-ip:8015/api/v1";
  */
  
})(this);
