import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-change-password',
  imports: [CommonModule, ReactiveFormsModule, LogoComponent, ThemeToggleComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-emerald-50/40 dark:bg-slate-950">
      <header class="flex h-16 items-center justify-between px-4 lg:px-6">
        <app-logo />
        <app-theme-toggle />
      </header>

      <main class="flex flex-1 items-center justify-center px-4 py-10">
        <div id="cpw-card" class="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div class="mb-6 text-center">
            <span class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            </span>
            <h1 class="text-xl font-bold text-slate-900 dark:text-white" style="font-family:'Bricolage Grotesque',ui-sans-serif">Set a new password</h1>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Welcome, <span class="font-medium text-slate-700 dark:text-slate-200">{{ username() }}</span>. For your security, replace the temporary password issued by the placement cell.
            </p>
          </div>

          @if (errorMsg()) {
            <div class="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {{ errorMsg() }}
            </div>
          }

          <form id="cpw-form" [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">New password</label>
              <div class="relative">
                <input id="cpw-new-password-input" [type]="show() ? 'text' : 'password'" formControlName="newPassword" autocomplete="new-password"
                       class="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 pr-10 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
                <button id="cpw-toggle-visibility-btn" type="button" (click)="show.set(!show())" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabindex="-1" aria-label="Toggle password visibility">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                </button>
              </div>
              @if (f.newPassword.touched && f.newPassword.errors?.['required']) {
                <p class="mt-1 text-xs text-red-500">New password is required.</p>
              } @else if (f.newPassword.touched && f.newPassword.errors?.['minlength']) {
                <p class="mt-1 text-xs text-red-500">Use at least 6 characters.</p>
              }
            </div>

            <div>
              <label class="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm new password</label>
              <input id="cpw-confirm-password-input" [type]="show() ? 'text' : 'password'" formControlName="confirmPassword" autocomplete="new-password"
                     class="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
              @if (f.confirmPassword.touched && mismatch()) {
                <p class="mt-1 text-xs text-red-500">Passwords do not match.</p>
              }
            </div>

            <button id="cpw-submit-btn" type="submit" [disabled]="loading()"
                    class="w-full rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60">
              {{ loading() ? 'Updating…' : 'Update password & continue' }}
            </button>
          </form>
        </div>
      </main>
    </div>
  `,
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  show = signal(false);
  loading = signal(false);
  errorMsg = signal<string | null>(null);
  username = computed(() => this.auth.user()?.username ?? '');

  form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  get f() { return this.form.controls; }
  mismatch() {
    const { newPassword, confirmPassword } = this.form.getRawValue();
    return !!confirmPassword && newPassword !== confirmPassword;
  }

  submit(): void {
    this.errorMsg.set(null);
    if (this.form.invalid || this.mismatch()) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.changePassword(this.form.getRawValue().newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/student/home']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err?.message ?? 'Could not change password. Please try again.');
      },
    });
  }
}
