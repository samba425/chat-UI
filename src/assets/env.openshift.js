// OpenShift Environment Configuration
(function (window) {
  window["env"] = window["env"] || {};

  // OpenShift environment settings
  window["env"]["environment"] = "openshift";
  
  // OpenShift route configuration
  // Replace with your actual OpenShift route
  const OPENSHIFT_ROUTE = "${OPENSHIFT_ROUTE:-incident-copilot.apps.ocp-cluster.com}";
  const PROTOCOL = "${PROTOCOL:-https}";
  const PORT = "${API_PORT:-9091}";
  
  window["env"]["baseUrl"] = `${PROTOCOL}://${OPENSHIFT_ROUTE}:${PORT}`;
  
  // API endpoints
  window["env"]["authTokenUrl"] = `${PROTOCOL}://${OPENSHIFT_ROUTE}:${PORT}/auth/token`;
  window["env"]["authRegisterUrl"] = `${PROTOCOL}://${OPENSHIFT_ROUTE}:${PORT}/auth/register`;
  window["env"]["netqueryApiUrl"] = `${PROTOCOL}://${OPENSHIFT_ROUTE}:${PORT}/api/v1/chat/`;
  window["env"]["historyApiUrl"] = `${PROTOCOL}://${OPENSHIFT_ROUTE}:${PORT}/api/v1/chat/history/`;
  window["env"]["templateApiUrl"] = `${PROTOCOL}://${OPENSHIFT_ROUTE}:${PORT}/api/v1/template`;
  window["env"]["feedbackApiUrl"] = `${PROTOCOL}://${OPENSHIFT_ROUTE}:${PORT}/api/v1/feedback`;
  window["env"]["chatApiBaseUrl"] = `${PROTOCOL}://${OPENSHIFT_ROUTE}:${PORT}/api/v1`;
  
  // OpenShift feature flags
  window["env"]["enableDebugLogging"] = false;
  window["env"]["enableMockData"] = false;
  
  console.log('☁️ OpenShift Environment Loaded:', `${PROTOCOL}://${OPENSHIFT_ROUTE}:${PORT}`);
  
})(this);
