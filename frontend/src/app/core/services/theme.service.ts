import { Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  // Declared BEFORE `theme` so they're initialized first (field order matters).
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const t = this.theme();
      if (!this.isBrowser) return; // skip DOM work on the server
      const root = document.documentElement;
      t === 'dark' ? root.classList.add('dark') : root.classList.remove('dark');
      localStorage.setItem('hiregrad-theme', t);
    });
  }

  toggle(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  private getInitialTheme(): Theme {
    if (!this.isBrowser) return 'light'; // safe default during SSR
    const saved = localStorage.getItem('hiregrad-theme') as Theme | null;
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}