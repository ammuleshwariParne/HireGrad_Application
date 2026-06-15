import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import { NavigatorBotComponent } from '../../../shared/components/navigator-bot/navigator-bot.component';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LogoComponent, ThemeToggleComponent, NavigatorBotComponent],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  @ViewChild('userMenu') userMenu?: ElementRef<HTMLElement>;
  @ViewChild('bellMenu') bellMenu?: ElementRef<HTMLElement>;

  readonly user = this.auth.user;
  search = signal('');
  menuOpen = signal(false);
  bellOpen = signal(false);

  readonly navItems = [
    { label: 'Home', path: '/admin/home', icon: 'home' },
    { label: 'Job posting', path: '/admin/jobs', icon: 'briefcase' },
    { label: 'Application management', path: '/admin/applications', icon: 'clipboard' },
    { label: 'Student signup', path: '/admin/students', icon: 'user-plus' },
    { label: 'Report analysis', path: '/admin/reports', icon: 'chart' },
  ];

  // === MOCK notifications — replace with GET /api/admin/notifications ===
  notifications = signal([
    { title: 'New applications received', detail: 'Students applied to recent postings.' },
    { title: 'Posting deadline approaching', detail: 'Review an opening before it closes.' },
  ]);
  unreadCount = computed(() => this.notifications().length);

  toggleMenu() { this.menuOpen.update((v) => !v); this.bellOpen.set(false); }
  toggleBell() { this.bellOpen.update((v) => !v); this.menuOpen.set(false); }
  goProfile() { this.menuOpen.set(false); this.router.navigate(['/admin/profile']); }
  logout() { this.menuOpen.set(false); this.auth.logout(); this.router.navigate(['/login']); }
  goSearch() { if (this.search().trim()) this.router.navigate(['/admin/applications']); }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const t = e.target as Node;
    if (this.menuOpen() && this.userMenu && !this.userMenu.nativeElement.contains(t)) this.menuOpen.set(false);
    if (this.bellOpen() && this.bellMenu && !this.bellMenu.nativeElement.contains(t)) this.bellOpen.set(false);
  }
}