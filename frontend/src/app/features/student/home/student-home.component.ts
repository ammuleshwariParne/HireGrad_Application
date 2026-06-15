import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService, StudentDashboard } from '../../../core/services/dashboard.service';
import { TiltDirective } from '../../../shared/directives/tilt.directive';

@Component({
  selector: 'app-student-home',
  imports: [CommonModule, RouterLink, TiltDirective],
  templateUrl: './student-home.component.html',
})
export class StudentHomeComponent {
  private auth = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private reduceMotion = this.isBrowser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  auroraX = signal(0);
  auroraY = signal(0);

  // === live dashboard (GET /api/student/dashboard) ===
  dash = signal<StudentDashboard | null>(null);
  loading = signal(true);

  greeting = this.computeGreeting();
  firstName = computed(() => {
    const name = this.dash()?.fullName ?? this.auth.user()?.fullName ?? 'Student';
    return name.split(' ')[0];
  });

  // chips + counts (all derived from the live response, default 0 while loading)
  applicationsInProgress = computed(() => this.dash()?.inReview ?? 0);
  eligibleRolesCount = computed(() => this.dash()?.eligibleRoles ?? 0);
  selectedCount = computed(() => this.dash()?.selected ?? 0);
  totalApplications = computed(() => this.dash()?.totalApplications ?? 0);

  recentApplications = computed(() => this.dash()?.recentApplications ?? []);
  recommendedJobs = computed(() => this.dash()?.recommendedJobs ?? []);
  missingSections = computed(() => this.dash()?.missingSections ?? []);

  profileCompleteness = computed(() => this.dash()?.profileCompletion ?? 0);
  readonly ringCircumference = 2 * Math.PI * 52;
  ringDashoffset = computed(() => this.ringCircumference * (1 - this.profileCompleteness() / 100));

  summaryCards = computed(() => [
    { label: 'Applications submitted', value: this.totalApplications(), icon: 'clipboard', hint: 'In your tracker', link: '/student/tracker' },
    { label: 'In review', value: this.applicationsInProgress(), icon: 'calendar', hint: 'Awaiting a decision', link: '/student/tracker' },
    { label: 'Selected', value: this.selectedCount(), icon: 'check', hint: 'Offers so far', link: '/student/tracker' },
    { label: 'Eligible roles', value: this.eligibleRolesCount(), icon: 'briefcase', hint: 'Matching your profile', link: '/student/jobs' },
  ]);

  readonly quickActions = [
    { label: 'Browse jobs', desc: 'Find roles you’re eligible for', icon: 'briefcase', link: '/student/jobs' },
    { label: 'View tracker', desc: 'Track your applications', icon: 'clipboard', link: '/student/tracker' },
    { label: 'Complete profile', desc: 'Boost your visibility', icon: 'user', link: '/student/profile' },
  ];

  constructor() {
    this.dashboardService.getStudentDashboard().subscribe({
      next: (d) => { this.dash.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  lpa(ctc: number | null): string {
    if (!ctc) return '—';
    const v = ctc / 100000;
    return (Number.isInteger(v) ? v.toString() : v.toFixed(1)) + ' LPA';
  }

  statusLabel(s: string) { return s === 'APPLIED' ? 'Applied' : s === 'SELECTED' ? 'Selected' : 'Rejected'; }
  statusClass(s: string) {
    return s === 'SELECTED'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
      : s === 'REJECTED'
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
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
