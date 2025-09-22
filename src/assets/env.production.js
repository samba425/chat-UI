// VM/OpenShift Production Environment Configuration
(function (window) {
  window["env"] = window["env"] || {};

  // Production environment settings
  window["env"]["environment"] = "production";
  
  // Replace VM_IP_ADDRESS with your actual VM IP
  const VM_IP_ADDRESS = "${VM_IP_ADDRESS:-10.196.209.153}";
  window["env"]["baseUrl"] = `http://${VM_IP_ADDRESS}:9091`;
  
  // API endpoints
  window["env"]["authTokenUrl"] = `http://${VM_IP_ADDRESS}:9091/auth/token`;
  window["env"]["authRegisterUrl"] = `http://${VM_IP_ADDRESS}:9091/auth/register`;
  window["env"]["netqueryApiUrl"] = `http://${VM_IP_ADDRESS}:9091/api/v1/chat/`;
  window["env"]["historyApiUrl"] = `http://${VM_IP_ADDRESS}:9091/api/v1/chat/history/`;
  window["env"]["templateApiUrl"] = `http://${VM_IP_ADDRESS}:9091/api/v1/template`;
  window["env"]["feedbackApiUrl"] = `http://${VM_IP_ADDRESS}:9091/api/v1/feedback`;
  window["env"]["chatApiBaseUrl"] = `http://${VM_IP_ADDRESS}:9091/api/v1`;
  
  // Production feature flags
  window["env"]["enableDebugLogging"] = false;
  window["env"]["enableMockData"] = false;
  
  console.log('🚀 Production Environment Loaded:', `http://${VM_IP_ADDRESS}:9091`);
  
})(this);
