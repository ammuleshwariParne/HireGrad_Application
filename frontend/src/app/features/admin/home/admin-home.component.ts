import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminDashboard, DashboardService } from '../../../core/services/dashboard.service';
import { TiltDirective } from '../../../shared/directives/tilt.directive';

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule, RouterLink, TiltDirective],
  templateUrl: './admin-home.component.html',
})
export class AdminHomeComponent {
  private auth = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private reduceMotion = this.isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  auroraX = signal(0);
  auroraY = signal(0);

  // === live dashboard (GET /api/admin/dashboard) ===
  dash = signal<AdminDashboard | null>(null);
  loading = signal(true);

  greeting = this.computeGreeting();
  firstName = computed(() => {
    const name = this.dash()?.fullName ?? this.auth.user()?.fullName ?? 'Placement Cell';
    return name.split(' ')[0];
  });

  activeJobs = computed(() => this.dash()?.activePostings ?? 0);
  totalApplicants = computed(() => this.dash()?.totalApplicants ?? 0);
  pendingReviews = computed(() => this.dash()?.pendingReviews ?? 0);
  selectedCount = computed(() => this.dash()?.selected ?? 0);
  placementRate = computed(() => this.dash()?.placementRate ?? 0);

  postings = computed(() => this.dash()?.postings ?? []);
  recentActivity = computed(() => this.dash()?.recentActivity ?? []);

  readonly ringCircumference = 2 * Math.PI * 52;
  ringDashoffset = computed(() => this.ringCircumference * (1 - this.placementRate() / 100));

  summaryCards = computed(() => [
    { label: 'Active postings', value: this.activeJobs(), icon: 'briefcase', hint: 'Currently open', link: '/admin/jobs' },
    { label: 'Total applicants', value: this.totalApplicants(), icon: 'users', hint: 'Across all drives', link: '/admin/applications' },
    { label: 'Selected', value: this.selectedCount(), icon: 'check', hint: 'Offers made', link: '/admin/applications' },
    { label: 'Pending reviews', value: this.pendingReviews(), icon: 'clipboard', hint: 'Awaiting your decision', link: '/admin/applications' },
  ]);

  readonly quickActions = [
    { label: 'Post a job', desc: 'Publish a new opening', icon: 'briefcase', link: '/admin/jobs' },
    { label: 'Manage applications', desc: 'Advance students through stages', icon: 'clipboard', link: '/admin/applications' },
    { label: 'Create student account', desc: 'Provision a login for a student', icon: 'user-plus', link: '/admin/students' },
  ];

  constructor() {
    this.dashboardService.getAdminDashboard().subscribe({
      next: (d) => { this.dash.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  typeLabel(t: string) { return t === 'FULL_TIME' ? 'Full-time' : t === 'INTERNSHIP' ? 'Internship' : t === 'PART_TIME' ? 'Part-time' : t; }
  statusLabel(s: string) { return s === 'APPLIED' ? 'Applied' : s === 'SELECTED' ? 'Selected' : 'Rejected'; }
  statusClass(s: string) {
    return s === 'SELECTED'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
      : s === 'REJECTED'
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
  }
  initials(name: string) {
    return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('') || '?';
  }

  onAuroraMove(e: MouseEvent) {
    if (this.reduceMotion) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.auroraX.set(((e.clientX - r.left) / r.width - 0.5) * 40);
    this.auroraY.set(((e.clientY - r.top) / r.height - 0.5) * 40);
  }
  onAuroraLeave() { this.auroraX.set(0); this.auroraY.set(0); }

  private computeGreeting(): string {
    const h = this.isBrowser ? new Date().getHours() : 9;
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }
}
