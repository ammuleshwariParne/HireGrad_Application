import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EmploymentType, JobRequest, JobService, WorkMode } from '../../../core/services/job.service';

function cgpaRange(c: AbstractControl): ValidationErrors | null {
  const v = c.value;
  if (v === null || v === '' || v === undefined) return null;
  const n = Number(v);
  return !isNaN(n) && n >= 0 && n <= 10 ? null : { range: 'Enter a value 0–10.' };
}
function futureDate(c: AbstractControl): ValidationErrors | null {
  if (!c.value) return null;
  return new Date(c.value).getTime() > Date.now() ? null : { future: 'Deadline must be in the future.' };
}

@Component({
  selector: 'app-job-posting',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './job-posting.component.html',
})
export class JobPostingComponent {
  private fb = inject(FormBuilder);
  private jobService = inject(JobService);
  private router = inject(Router);

  readonly employmentTypes: { value: EmploymentType; label: string }[] = [
    { value: 'FULL_TIME', label: 'Full-time' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'PART_TIME', label: 'Part-time' },
  ];
  readonly workModes: { value: WorkMode; label: string }[] = [
    { value: 'ON_SITE', label: 'On-site' },
    { value: 'HYBRID', label: 'Hybrid' },
    { value: 'REMOTE', label: 'Remote' },
  ];

  employmentType = signal<EmploymentType>('FULL_TIME');
  workMode = signal<WorkMode>('ON_SITE');
  skills = signal<string[]>([]);
  skillInput = signal('');
  skillError = signal(false);
  submitting = signal(false);
  serverError = signal<string | null>(null);
  toast = signal<{ type: 'success' | 'error'; msg: string } | null>(null);

  form = this.fb.group({
    companyName: this.fb.control('', { validators: Validators.required, nonNullable: true }),
    jobTitle: this.fb.control('', { validators: Validators.required, nonNullable: true }),
    location: this.fb.control('', { validators: Validators.required, nonNullable: true }),
    ctcPerYear: this.fb.control<number | null>(null, { validators: [Validators.required, Validators.min(1)] }),
    minCgpa: this.fb.control<number | null>(null, { validators: cgpaRange }),
    description: this.fb.control('', { validators: [Validators.required, Validators.maxLength(2000)], nonNullable: true }),
    applicationDeadline: this.fb.control('', { validators: [Validators.required, futureDate], nonNullable: true }),
  });

  get f() { return this.form.controls; }

  addSkill() {
    const s = this.skillInput().trim();
    if (s && !this.skills().includes(s)) { this.skills.update((a) => [...a, s]); this.skillError.set(false); }
    this.skillInput.set('');
  }
  removeSkill(s: string) { this.skills.update((a) => a.filter((x) => x !== s)); }

  publish() {
    this.form.markAllAsTouched();
    this.serverError.set(null);
    const noSkills = this.skills().length === 0;
    this.skillError.set(noSkills);
    if (this.form.invalid || noSkills) { this.showToast('error', 'Please fix the highlighted fields.'); return; }

    this.submitting.set(true);
    const v = this.form.getRawValue();
    const req: JobRequest = {
      companyName: v.companyName, jobTitle: v.jobTitle, location: v.location,
      ctcPerYear: Number(v.ctcPerYear), employmentType: this.employmentType(), workMode: this.workMode(),
      minCgpa: v.minCgpa != null && (v.minCgpa as unknown) !== '' ? Number(v.minCgpa) : null,
      requiredSkills: this.skills(), description: v.description, applicationDeadline: v.applicationDeadline,
    };

    // === INTEGRATION POINT: POST /api/admin/jobs ===
    this.jobService.createJob(req).subscribe({
      next: () => { this.submitting.set(false); this.showToast('success', 'Job published successfully.'); this.resetForm(); },
      error: (e) => {
        this.submitting.set(false);
        this.serverError.set(e?.error?.error?.message ?? 'Could not publish the job. Please try again.');
        this.showToast('error', this.serverError()!);
      },
    });
  }

  cancel() { this.router.navigate(['/admin/home']); }

  private resetForm() {
    this.form.reset({ companyName: '', jobTitle: '', location: '', ctcPerYear: null, minCgpa: null, description: '', applicationDeadline: '' });
    this.skills.set([]); this.skillInput.set(''); this.employmentType.set('FULL_TIME'); this.workMode.set('ON_SITE');
    this.form.markAsUntouched();
  }

  private showToast(type: 'success' | 'error', msg: string) {
    this.toast.set({ type, msg });
    setTimeout(() => this.toast.set(null), 3000);
  }
}