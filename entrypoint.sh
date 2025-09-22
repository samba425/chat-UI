#!/bin/sh
# Enhanced entrypoint.sh for dynamic environment configuration

echo "🚀 Starting Novus chat Chatbot UI..."

# Determine environment and configure accordingly
configure_environment() {
    local env_file="/usr/share/nginx/html/env.js"
    
    echo "📝 Configuring environment..."
    
    # If specific environment configuration is provided
    if [ "$ENVIRONMENT" = "production" ] && [ -n "$VM_IP_ADDRESS" ]; then
        echo "🖥️ Configuring for VM deployment..."
        sed "s/\${VM_IP_ADDRESS:-10.196.209.153}/$VM_IP_ADDRESS/g" \
            /usr/share/nginx/html/assets/env.production.js > "$env_file"
            
    elif [ "$ENVIRONMENT" = "openshift" ] && [ -n "$OPENSHIFT_ROUTE" ]; then
        echo "☁️ Configuring for OpenShift deployment..."
        sed -e "s/\${OPENSHIFT_ROUTE:-incident-copilot.apps.ocp-cluster.com}/$OPENSHIFT_ROUTE/g" \
            -e "s/\${PROTOCOL:-https}/$PROTOCOL/g" \
            -e "s/\${API_PORT:-9091}/$API_PORT/g" \
            /usr/share/nginx/html/assets/env.openshift.js > "$env_file"
            
    else
        echo "🔧 Using dynamic auto-detection configuration..."
        # Use the auto-detecting env.js from src
        cp /usr/share/nginx/html/assets/../env.js "$env_file" 2>/dev/null || {
            # Fallback: create basic auto-detecting configuration
            cat > "$env_file" << EOF
(function (window) {
  window["env"] = window["env"] || {};

  const getEnvironmentConfig = () => {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return {
        environment: 'development',
        baseUrl: 'http://localhost:9091'
      };
    }
    
    return {
      environment: 'production',
      baseUrl: \`\${protocol}//\${hostname}:9091\`
    };
  };

  const config = getEnvironmentConfig();
  window["env"]["environment"] = config.environment;
  window["env"]["baseUrl"] = config.baseUrl;
  window["env"]["authTokenUrl"] = config.baseUrl + "/auth/token";
  window["env"]["authRegisterUrl"] = config.baseUrl + "/auth/register";
  window["env"]["netqueryApiUrl"] = config.baseUrl + "/api/v1/chat/";
  window["env"]["historyApiUrl"] = config.baseUrl + "/api/v1/chat/history/";
  window["env"]["templateApiUrl"] = config.baseUrl + "/api/v1/template";
  window["env"]["feedbackApiUrl"] = config.baseUrl + "/api/v1/feedback";
  window["env"]["chatApiBaseUrl"] = config.baseUrl + "/api/v1";
  
  console.log('🔧 Environment configured:', config);
})(this);
EOF
        }
    fi
    
    echo "✅ Environment configuration completed"
    
    # Log the configuration for debugging
    if [ "$ENABLE_DEBUG_LOGGING" = "true" ]; then
        echo "📋 Configuration Summary:"
        echo "  Environment: $ENVIRONMENT"
        echo "  VM IP: $VM_IP_ADDRESS"
        echo "  OpenShift Route: $OPENSHIFT_ROUTE"
        echo "  Protocol: $PROTOCOL"
        echo "  API Port: $API_PORT"
        echo ""
        echo "📄 Generated env.js:"
        cat "$env_file"
        echo ""
    fi
}

# Configure environment
configure_environment

echo "🌐 Starting Nginx server..."

# Start Nginx
exec nginx -g 'daemon off;'
