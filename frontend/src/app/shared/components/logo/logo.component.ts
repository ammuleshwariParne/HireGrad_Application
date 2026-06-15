import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  template: `
    <a id="logo-home-link" [routerLink]="homeLink"
       class="flex items-center gap-2.5 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
      <span class="flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg shadow-brand-500/30"
            style="background-image:linear-gradient(135deg,#6ee7b7,#34d399)">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
        </svg>
      </span>
      <span class="text-lg font-bold tracking-tight text-slate-900 dark:text-white"
            style="font-family:'Bricolage Grotesque',ui-sans-serif">
        Hire<span class="text-brand-500">Grad</span>
      </span>
    </a>
  `,
})
export class LogoComponent {
  @Input() homeLink = '/student/home';
}