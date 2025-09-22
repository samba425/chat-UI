import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ThemeService, ColorTheme } from './services/theme.service';
import { ConfigService } from './services/config.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppConfig } from './models/app-config.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  public username: string | null = null;
  currentTheme$: Observable<ColorTheme>;
  availableThemes: ColorTheme[];
  isDropdownOpen = false;
  
  // Dynamic app configuration
  config$: Observable<AppConfig>;
  appName = 'Novus.AI'; // Default fallback
  logoUrl = '/assets/novus-logo.png'; // Default fallback

  constructor(
    public authService: AuthService,
    private themeService: ThemeService,
    private configService: ConfigService,
    private router: Router
  ) {
    this.currentTheme$ = this.themeService.currentTheme$;
    this.availableThemes = this.themeService.getAvailableThemes();
    this.config$ = this.configService.config$;
  }

  ngOnInit() {
    // Subscribe to configuration changes
    this.config$.subscribe(config => {
      this.appName = config.branding.appName;
      this.logoUrl = config.branding.logoUrl;
      
      // Update theme switcher visibility based on configuration
      if (!config.features?.enableThemeSwitcher) {
        this.availableThemes = [];
      } else {
        this.availableThemes = this.themeService.getAvailableThemes();
      }
    });

    // Initialize theme service
    this.themeService.getCurrentTheme(); // This will trigger theme application
    
    this.authService.username$.subscribe(name => {
      this.username = name?.split('@')[0] || null;
    });
    
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  setTheme(theme: ColorTheme) {
    this.themeService.setTheme(theme);
    this.isDropdownOpen = false; // Close dropdown after selection
  }

  logout() {
    this.authService.logout();
    // username will be updated by subscription
  }
}
