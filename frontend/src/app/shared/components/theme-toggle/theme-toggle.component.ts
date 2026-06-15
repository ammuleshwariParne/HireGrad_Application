import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button
      id="theme-toggle-btn"
      type="button"
      (click)="theme.toggle()"
      [attr.aria-label]="theme.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-soft transition-all duration-200 hover:scale-105 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-brand-400"
    >
      @if (theme.theme() === 'dark') {
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
        </svg>
      } @else {
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  theme = inject(ThemeService);
}