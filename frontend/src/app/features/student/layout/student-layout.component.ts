import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AppNotification, NotificationService } from '../../../core/services/notification.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import { NavigatorBotComponent } from '../../../shared/components/navigator-bot/navigator-bot.component';

@Component({
  selector: 'app-student-layout',
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LogoComponent, ThemeToggleComponent, NavigatorBotComponent],
  templateUrl: './student-layout.component.html',
})
export class StudentLayoutComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  readonly notify = inject(NotificationService);

  @ViewChild('userMenu') userMenu?: ElementRef<HTMLElement>;
  @ViewChild('bellMenu') bellMenu?: ElementRef<HTMLElement>;

  readonly user = this.auth.user;
  search = signal('');
  menuOpen = signal(false);
  bellOpen = signal(false);

  // Sidebar nav — navigation only, routes to separate pages.
  readonly navItems = [
    { label: 'Home', path: '/student/home', icon: 'home' },
    { label: 'Job dashboard', path: '/student/jobs', icon: 'briefcase' },
    { label: 'Application tracker', path: '/student/tracker', icon: 'clipboard' },
  ];

  // live notifications (derived + polled by NotificationService)
  notifications = this.notify.notifications;
  unreadCount = this.notify.unreadCount;
  toasts = this.notify.toasts;

  ngOnInit() { this.notify.start(); }
  ngOnDestroy() { this.notify.stop(); }

  /** Open a notification: mark read, navigate, close menus. */
  openNotification(n: AppNotification) {
    this.notify.markSeen(n.id);
    this.bellOpen.set(false);
    this.router.navigate([n.link]);
  }
  /** Click a toast: mark read, dismiss, navigate. */
  openToast(n: AppNotification) {
    this.notify.markSeen(n.id);
    this.notify.dismissToast(n.id);
    this.router.navigate([n.link]);
  }
  isUnread(id: string) { return this.notify.isUnread(id); }

  initials = computed(() => {
    const parts = (this.user()?.fullName ?? '').trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'S';
  });

  toggleMenu() { this.menuOpen.update((v) => !v); this.bellOpen.set(false); }
  toggleBell() {
    this.bellOpen.update((v) => !v);
    this.menuOpen.set(false);
    if (this.bellOpen()) this.notify.markAllSeen(); // viewing the list clears the unread badge
  }

  goProfile() { this.menuOpen.set(false); this.router.navigate(['/student/profile']); }

  logout() {
    this.menuOpen.set(false);
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  goSearch() {
    if (!this.search().trim()) return;
    // Search is applied on the Jobs page (query wiring lands with that feature).
    this.router.navigate(['/student/jobs']);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const t = e.target as Node;
    if (this.menuOpen() && this.userMenu && !this.userMenu.nativeElement.contains(t)) this.menuOpen.set(false);
    if (this.bellOpen() && this.bellMenu && !this.bellMenu.nativeElement.contains(t)) this.bellOpen.set(false);
  }
}