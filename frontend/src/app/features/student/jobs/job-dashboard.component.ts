import { CommonModule } from '@angular/common';
import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { JobResponse, JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { ProfileService } from '../../../core/services/profile.service';
import { TiltDirective } from '../../../shared/directives/tilt.directive';

type ResumeRef = { name: string; source: 'profile' | 'uploaded' };

@Component({
  selector: 'app-job-dashboard',
  imports: [CommonModule, TiltDirective],
  templateUrl: './job-dashboard.component.html',
})
export class JobDashboardComponent {
  private jobService = inject(JobService);
  private applicationService = inject(ApplicationService);
  private profileService = inject(ProfileService);

  jobs = signal<JobResponse[]>([]);
  loading = signal(true);
  loadError = signal<string | null>(null);

  search = signal('');
  filtersOpen = signal(false);
  typeFilter = signal<'All' | 'FULL_TIME' | 'INTERNSHIP' | 'PART_TIME'>('All');
  modeFilter = signal<'All' | 'ON_SITE' | 'HYBRID' | 'REMOTE'>('All');
  roleFilter = signal('');
  skillFilter = signal('');
  ctcSort = signal<'DEFAULT' | 'HIGH' | 'LOW'>('DEFAULT');

  applied = signal<Set<number>>(new Set());
  resumeByJob = signal<Record<number, ResumeRef>>({});
  profileResume = signal<string | null>(null);
  openMenu = signal<number | null>(null);
  toast = signal<{ type: 'success' | 'error'; msg: string } | null>(null);

  readonly typeChips = [
    { value: 'All', label: 'All' }, { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'INTERNSHIP', label: 'Internship' }, { value: 'PART_TIME', label: 'Part-time' },
  ] as const;
  readonly modeChips = [
    { value: 'All', label: 'All' }, { value: 'ON_SITE', label: 'On-site' },
    { value: 'HYBRID', label: 'Hybrid' }, { value: 'REMOTE', label: 'Remote' },
  ] as const;

  constructor() {
    // === INTEGRATION POINT: default resume from the student's profile ===
    this.profileService.getProfile().subscribe({
      next: (p) => this.profileResume.set(p.resumeFileName ?? null),
      error: () => {},
    });
    // === INTEGRATION POINT: GET /api/student/jobs ===
    this.jobService.listStudentJobs().subscribe({
      next: (jobs) => { this.jobs.set(jobs); this.loading.set(false); },
      error: () => { this.loadError.set('Could not load jobs. Please try again.'); this.loading.set(false); },
    });
    // === INTEGRATION POINT: GET /api/student/applications — mark already-applied jobs ===
    this.applicationService.myApplications().subscribe({
      next: (apps) => this.applied.set(new Set(apps.map((a) => a.jobId))),
      error: () => {},
    });
  }

  roleOptions = computed(() => Array.from(new Set(this.jobs().map((j) => j.jobTitle))).sort());
  skillOptions = computed(() => Array.from(new Set(this.jobs().flatMap((j) => j.requiredSkills))).sort());

  filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    let list = this.jobs().filter((j) => {
      const matchesSearch = !q || [j.jobTitle, j.companyName, j.location].some((s) => (s ?? '').toLowerCase().includes(q));
      const matchesType = this.typeFilter() === 'All' || j.employmentType === this.typeFilter();
      const matchesMode = this.modeFilter() === 'All' || j.workMode === this.modeFilter();
      const matchesRole = !this.roleFilter() || j.jobTitle === this.roleFilter();
      const matchesSkill = !this.skillFilter() || j.requiredSkills.includes(this.skillFilter());
      return matchesSearch && matchesType && matchesMode && matchesRole && matchesSkill;
    });
    if (this.ctcSort() === 'HIGH') list = [...list].sort((a, b) => (b.ctcPerYear ?? 0) - (a.ctcPerYear ?? 0));
    if (this.ctcSort() === 'LOW') list = [...list].sort((a, b) => (a.ctcPerYear ?? 0) - (b.ctcPerYear ?? 0));
    return list;
  });

  resumeFor(jobId: number): ResumeRef | null {
    const override = this.resumeByJob()[jobId];
    if (override) return override;
    return this.profileResume() ? { name: this.profileResume()!, source: 'profile' } : null;
  }

  lpa(ctc: number | null): string {
    if (!ctc) return '—';
    const v = ctc / 100000;
    return (Number.isInteger(v) ? v.toString() : v.toFixed(1)) + ' LPA';
  }
  typeLabel(t: string) { return t === 'FULL_TIME' ? 'Full-time' : t === 'INTERNSHIP' ? 'Internship' : 'Part-time'; }
  modeLabel(m: string) { return m === 'ON_SITE' ? 'On-site' : m === 'HYBRID' ? 'Hybrid' : 'Remote'; }

  toggleMenu(jobId: number) { this.openMenu.update((v) => (v === jobId ? null : jobId)); }
  useProfileResume(jobId: number) {
    this.resumeByJob.update((m) => { const c = { ...m }; delete c[jobId]; return c; });
    this.openMenu.set(null);
  }
  onUpload(jobId: number, e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.resumeByJob.update((m) => ({ ...m, [jobId]: { name: file.name, source: 'uploaded' } }));
    this.openMenu.set(null);
  }

  apply(job: JobResponse) {
    const resume = this.resumeFor(job.id);
    if (!resume) { this.showToast('error', 'Add a resume before applying.'); return; }
    // === INTEGRATION POINT: POST /api/student/applications — persists with status APPLIED,
    // surfacing instantly in the student's tracker and the admin's application management. ===
    this.applicationService.apply({ jobId: job.id, resumeFileName: resume.name }).subscribe({
      next: () => {
        this.applied.update((s) => new Set(s).add(job.id));
        this.showToast('success', `Applied to ${job.jobTitle} at ${job.companyName}`);
      },
      error: (err) => {
        const msg = err?.error?.error?.message ?? 'Could not submit your application. Please try again.';
        if (err?.status === 409) { this.applied.update((s) => new Set(s).add(job.id)); }
        this.showToast('error', msg);
      },
    });
  }
  isApplied(id: number) { return this.applied().has(id); }

  clearFilters() {
    this.search.set(''); this.typeFilter.set('All'); this.modeFilter.set('All');
    this.roleFilter.set(''); this.skillFilter.set(''); this.ctcSort.set('DEFAULT');
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (this.openMenu() !== null && !(e.target as HTMLElement).closest('[data-resume-menu]')) {
      this.openMenu.set(null);
    }
  }

  private showToast(type: 'success' | 'error', msg: string) {
    this.toast.set({ type, msg });
    setTimeout(() => this.toast.set(null), 3000);
  }
}