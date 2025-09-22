import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AppConfig, DEFAULT_APP_CONFIG } from '../models/app-config.model';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configSubject = new BehaviorSubject<AppConfig>(DEFAULT_APP_CONFIG);
  public config$ = this.configSubject.asObservable();
  
  private loadedConfig: AppConfig = DEFAULT_APP_CONFIG;

  constructor(private http: HttpClient) {}

  /**
   * Load configuration from a JSON file or environment variables
   */
  async loadConfig(): Promise<AppConfig> {
    try {
      // First try to load from a config.json file
      const config = await this.loadFromFile().toPromise();
      if (config) {
        this.setConfig(config);
        return config;
      }
    } catch (error) {
      console.warn('Failed to load config from file, trying environment variables:', error);
    }

    try {
      // Fallback to environment variables or window object
      const config = this.loadFromEnvironment();
      this.setConfig(config);
      return config;
    } catch (error) {
      console.warn('Failed to load config from environment, using defaults:', error);
      this.setConfig(DEFAULT_APP_CONFIG);
      return DEFAULT_APP_CONFIG;
    }
  }

  /**
   * Load configuration from config.json file
   */
  private loadFromFile(): Observable<AppConfig | null> {
    return this.http.get<AppConfig>('/assets/config.json').pipe(
      map(config => this.mergeWithDefaults(config)),
      catchError(error => {
        console.warn('Config file not found or invalid:', error);
        return of(null);
      })
    );
  }

  /**
   * Load configuration from environment variables or window object
   */
  private loadFromEnvironment(): AppConfig {
    const windowEnv = (window as any).env || {};
    const windowConfig = (window as any).appConfig || {};
    
    const config: AppConfig = {
      branding: {
        appName: windowConfig.appName || windowEnv.appName || DEFAULT_APP_CONFIG.branding.appName,
        logoUrl: windowConfig.logoUrl || windowEnv.logoUrl || DEFAULT_APP_CONFIG.branding.logoUrl,
        faviconUrl: windowConfig.faviconUrl || windowEnv.faviconUrl || DEFAULT_APP_CONFIG.branding.faviconUrl,
        primaryColor: windowConfig.primaryColor || windowEnv.primaryColor || DEFAULT_APP_CONFIG.branding.primaryColor,
        secondaryColor: windowConfig.secondaryColor || windowEnv.secondaryColor || DEFAULT_APP_CONFIG.branding.secondaryColor,
        darkModeEnabled: windowConfig.darkModeEnabled !== undefined ? windowConfig.darkModeEnabled : DEFAULT_APP_CONFIG.branding.darkModeEnabled
      },
      apiEndpoints: {
        baseUrl: windowConfig.baseUrl || windowEnv.baseUrl || this.getDefaultBaseUrl(),
        authTokenUrl: windowConfig.authTokenUrl || windowEnv.authTokenUrl || `${this.getDefaultBaseUrl()}/auth/login`,
        authRegisterUrl: windowConfig.authRegisterUrl || windowEnv.authRegisterUrl || `${this.getDefaultBaseUrl()}/auth/register`,
        chatApiBaseUrl: windowConfig.chatApiBaseUrl || windowEnv.chatApiBaseUrl || DEFAULT_APP_CONFIG.apiEndpoints.chatApiBaseUrl,
        netqueryApiUrl: windowConfig.netqueryApiUrl || windowEnv.netqueryApiUrl || `${this.getDefaultBaseUrl()}/query/stream`,
        historyApiUrl: windowConfig.historyApiUrl || windowEnv.historyApiUrl || `${this.getDefaultBaseUrl()}/history`,
        templateApiUrl: windowConfig.templateApiUrl || windowEnv.templateApiUrl || `${this.getDefaultBaseUrl()}/api/v1/template`,
        feedbackApiUrl: windowConfig.feedbackApiUrl || windowEnv.feedbackApiUrl || `${this.getDefaultBaseUrl()}/api/v1/feedback`
      },
      features: {
        enableDebugLogging: windowConfig.enableDebugLogging !== undefined ? windowConfig.enableDebugLogging : DEFAULT_APP_CONFIG.features?.enableDebugLogging,
        enableMockData: windowConfig.enableMockData !== undefined ? windowConfig.enableMockData : DEFAULT_APP_CONFIG.features?.enableMockData,
        enableRegistration: windowConfig.enableRegistration !== undefined ? windowConfig.enableRegistration : DEFAULT_APP_CONFIG.features?.enableRegistration,
        enableThemeSwitcher: windowConfig.enableThemeSwitcher !== undefined ? windowConfig.enableThemeSwitcher : DEFAULT_APP_CONFIG.features?.enableThemeSwitcher,
        enableFeedback: windowConfig.enableFeedback !== undefined ? windowConfig.enableFeedback : DEFAULT_APP_CONFIG.features?.enableFeedback
      },
      customStyles: windowConfig.customStyles || {},
      version: windowConfig.version || '1.0.0'
    };

    return config;
  }

  /**
   * Dynamically set configuration at runtime
   */
  public setConfig(config: Partial<AppConfig>): void {
    this.loadedConfig = this.mergeWithDefaults(config);
    this.configSubject.next(this.loadedConfig);
    this.applyBrandingStyles();
    this.updatePageTitle();
    this.updateFavicon();
  }

  /**
   * Get current configuration
   */
  public getConfig(): AppConfig {
    return this.loadedConfig;
  }

  /**
   * Get specific configuration section
   */
  public getBranding() {
    return this.loadedConfig.branding;
  }

  public getApiEndpoints() {
    return this.loadedConfig.apiEndpoints;
  }

  public getFeatures() {
    return this.loadedConfig.features || {};
  }

  /**
   * Merge provided config with defaults
   */
  private mergeWithDefaults(config: Partial<AppConfig>): AppConfig {
    return {
      branding: { ...DEFAULT_APP_CONFIG.branding, ...config.branding },
      apiEndpoints: { ...DEFAULT_APP_CONFIG.apiEndpoints, ...config.apiEndpoints },
      features: { ...DEFAULT_APP_CONFIG.features, ...config.features },
      customStyles: config.customStyles || {},
      version: config.version || DEFAULT_APP_CONFIG.version
    };
  }

  /**
   * Get default base URL based on current location
   */
  private getDefaultBaseUrl(): string {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8000`;
  }

  /**
   * Apply branding styles to the page
   */
  private applyBrandingStyles(): void {
    const branding = this.loadedConfig.branding;
    
    // Update CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--primary-color', branding.primaryColor);
    root.style.setProperty('--secondary-color', branding.secondaryColor);
    
    // Apply custom styles if provided
    if (this.loadedConfig.customStyles) {
      Object.entries(this.loadedConfig.customStyles).forEach(([property, value]) => {
        root.style.setProperty(property, value);
      });
    }
  }

  /**
   * Update page title
   */
  private updatePageTitle(): void {
    document.title = this.loadedConfig.branding.appName;
  }

  /**
   * Update favicon
   */
  private updateFavicon(): void {
    const branding = this.loadedConfig.branding;
    if (branding.faviconUrl) {
      let link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = branding.faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }
}
