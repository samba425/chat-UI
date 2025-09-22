import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ColorTheme {
  id: string;
  name: string;
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themes: ColorTheme[] = [
    {
      id: 'light',
      name: 'Light',
      isDark: false,
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1f2937',
        accent: '#50e3c2'
      }
    },
    {
      id: 'dark',
      name: 'Dark',
      isDark: true,
      colors: {
        primary: '#4c51bf',
        secondary: '#8b5cf6',
        background: '#111827',
        surface: '#1f2937',
        text: '#f9fafb',
        accent: '#a78bfa'
      }
    },
    {
      id: 'ocean',
      name: 'Ocean Blue',
      isDark: true,
      colors: {
        primary: '#0ea5e9',
        secondary: '#0284c7',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        accent: '#38bdf8'
      }
    },
    {
      id: 'forest',
      name: 'Forest Green',
      isDark: true,
      colors: {
        primary: '#059669',
        secondary: '#047857',
        background: '#0f1419',
        surface: '#1f2937',
        text: '#f0fdf4',
        accent: '#34d399'
      }
    },
    {
      id: 'sunset',
      name: 'Sunset Orange',
      isDark: true,
      colors: {
        primary: '#ea580c',
        secondary: '#dc2626',
        background: '#1a0b08',
        surface: '#292524',
        text: '#fef7ff',
        accent: '#fb923c'
      }
    },
    {
      id: 'royal',
      name: 'Royal Purple',
      isDark: true,
      colors: {
        primary: '#7c3aed',
        secondary: '#6d28d9',
        background: '#0f0a1a',
        surface: '#1e1b3b',
        text: '#f8fafc',
        accent: '#a855f7'
      }
    }
  ];

  private currentTheme = new BehaviorSubject<ColorTheme>(this.themes[0]);
  currentTheme$ = this.currentTheme.asObservable();

  private isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    // Load saved theme from localStorage
    const savedThemeId = localStorage.getItem('selectedTheme');
    if (savedThemeId) {
      const savedTheme = this.themes.find(theme => theme.id === savedThemeId);
      if (savedTheme) {
        this.setTheme(savedTheme);
      } else {
        // If saved theme not found, apply default theme
        this.setTheme(this.themes[0]);
      }
    } else {
      // No saved theme, apply default theme
      this.setTheme(this.themes[0]);
    }
  }

  getThemes(): ColorTheme[] {
    return this.themes;
  }

  getAvailableThemes(): ColorTheme[] {
    return [...this.themes];
  }

  getCurrentTheme(): ColorTheme {
    return this.currentTheme.value;
  }

  setTheme(theme: ColorTheme) {
    this.currentTheme.next(theme);
    this.isDarkMode.next(theme.isDark);
    localStorage.setItem('selectedTheme', theme.id);
    this.applyThemeToDocument(theme);
  }

  toggleTheme() {
    const currentTheme = this.currentTheme.value;
    const nextTheme = currentTheme.isDark ? this.themes[0] : this.themes[1]; // Toggle between light and dark
    this.setTheme(nextTheme);
  }

  private applyThemeToDocument(theme: ColorTheme) {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-background', theme.colors.background);
    root.style.setProperty('--theme-surface', theme.colors.surface);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    
    // Apply theme class to body
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.id}`);
  }
}
