# Dynamic Angular Chat Application

A fully configurable Angular chat application that supports dynamic branding, API configuration, and white-label deployments.

## 🚀 Key Features

- **Dynamic Branding**: Customize app name, logo, colors, and themes
- **Configurable APIs**: Set different API endpoints for different environments/clients
- **White-Label Ready**: Deploy the same codebase for multiple clients with different branding
- **Feature Toggles**: Enable/disable features per deployment
- **Multi-Tenant Support**: Support multiple clients with different configurations

## 📋 Quick Start

### 1. Basic Setup
```bash
npm install
npm start
```

### 2. Custom Configuration
```bash
# Generate a custom configuration
./generate-config.sh "my-client" "https://api.myclient.com" "My Chat App" "#ff6b35"

# Build and deploy
npm run build
```

### 3. View Configuration Demo
Open `demo-config.html` in your browser to see dynamic configuration examples.

## 🎨 Configuration Methods

### Method 1: JSON Configuration (Recommended)
Create or modify `/assets/config.json`:
```json
{
  "branding": {
    "appName": "Your Custom Chat App",
    "logoUrl": "/assets/your-logo.png",
    "primaryColor": "#0066cc"
  },
  "apiEndpoints": {
    "baseUrl": "https://your-api-domain.com"
  }
}
```

### Method 2: JavaScript Override
```javascript
window.appConfig = {
  appName: "Custom Chat",
  logoUrl: "/assets/custom-logo.png",
  primaryColor: "#ff6b35"
};
```

### Method 3: Docker Environment Variables
```bash
docker run -e APP_NAME="Custom Chat" -e PRIMARY_COLOR="#ff6b35" your-chat-app
```

## 📚 Documentation

- **[Complete Configuration Guide](DYNAMIC_CONFIG_GUIDE.md)** - Detailed setup instructions
- **[Example Configurations](src/assets/config-examples/)** - Ready-to-use examples
- **[Docker Multi-Tenant Setup](docker-compose.multi-tenant.yml)** - Multiple client deployment

## 🛠 Development

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.18.

### Development server
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`.

### Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
