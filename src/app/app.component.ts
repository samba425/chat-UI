import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { ThemeService, ColorTheme } from './services/theme.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent {
  public username: string | null = null;
  currentTheme$: Observable<ColorTheme>;
  availableThemes: ColorTheme[];
  isDropdownOpen = false;

  constructor(
    public authService: AuthService,
    private themeService: ThemeService,
    private router: Router
  ) {
    this.currentTheme$ = this.themeService.currentTheme$;
    this.availableThemes = this.themeService.getAvailableThemes();
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  setTheme(theme: ColorTheme) {
    this.themeService.setTheme(theme);
    this.isDropdownOpen = false; // Close dropdown after selection
  }

  ngOnInit() {
    // Initialize theme service
    this.themeService.getCurrentTheme(); // This will trigger theme application
    
    this.authService.username$.subscribe(name => {
      this.username = name?.split('@')[0] || null;
    });
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.authService.logout();
    // username will be updated by subscription
  }
}
