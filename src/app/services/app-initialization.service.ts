import { Injectable } from '@angular/core';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AppInitializationService {
  
  constructor(private configService: ConfigService) {}

  async initializeApp(): Promise<void> {
    try {
      console.log('Loading application configuration...');
      await this.configService.loadConfig();
      console.log('Application configuration loaded successfully');
    } catch (error) {
      console.error('Failed to load application configuration:', error);
      // App will continue with default configuration
    }
  }
}
