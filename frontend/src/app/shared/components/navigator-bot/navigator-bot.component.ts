import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface Destination {
  label: string;
  path: string;
  icon: 'home' | 'briefcase' | 'clipboard' | 'user' | 'user-plus' | 'chart';
  keywords: string[];
  blurb: string;
}

interface BotMessage {
  from: 'bot' | 'user';
  text: string;
  link?: string;
  linkLabel?: string;
}

/**
 * Grady — a floating, role-aware navigation assistant. Lives bottom-right on every
 * student and admin page. Matches the user's message against known destinations /
 * FAQs and offers a one-tap jump. Pure client-side; no backend call.
 */
@Component({
  selector: 'app-navigator-bot',
  imports: [CommonModule],
  template: `
    <!-- ===== launcher ===== -->
    <div class="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3" style="perspective:800px">
      @if (open()) {
        <!-- ===== chat panel ===== -->
        <div id="bot-chat-panel" class="flex h-[28rem] w-[21rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-fade-in-up dark:border-slate-700 dark:bg-slate-900"
             style="transform-origin:bottom right">
          <!-- header -->
          <div class="flex items-center gap-3 px-4 py-3 text-white" style="background-image:linear-gradient(135deg,#059669,#34d399)">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
              <ng-container [ngTemplateOutlet]="robot" [ngTemplateOutletContext]="{ size: 22 }" />
            </span>
            <div class="flex-1">
              <p class="text-sm font-bold leading-none">Grady</p>
              <p class="mt-0.5 text-[11px] text-emerald-50/90">Your navigation buddy</p>
            </div>
            <button id="bot-close-btn" (click)="toggle()" aria-label="Close" class="rounded-lg p-1 text-white/80 transition hover:bg-white/15 hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>

          <!-- messages -->
          <div #scroll class="flex-1 space-y-3 overflow-y-auto bg-emerald-50/40 px-3 py-4 dark:bg-slate-950/40">
            @for (m of messages(); track $index) {
              @if (m.from === 'bot') {
                <div [id]="'bot-msg-' + $index" class="flex items-start gap-2">
                  <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white" style="background-image:linear-gradient(135deg,#059669,#34d399)">
                    <ng-container [ngTemplateOutlet]="robot" [ngTemplateOutletContext]="{ size: 16 }" />
                  </span>
                  <div class="max-w-[80%]">
                    <div class="rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">{{ m.text }}</div>
                    @if (m.link) {
                      <button [id]="'bot-msg-link-' + $index" (click)="go(m.link!)" class="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600">
                        {{ m.linkLabel }}
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                      </button>
                    }
                  </div>
                </div>
              } @else {
                <div [id]="'bot-msg-' + $index" class="flex justify-end">
                  <div class="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-500 px-3 py-2 text-sm text-white shadow-sm">{{ m.text }}</div>
                </div>
              }
            }
            @if (typing()) {
              <div class="flex items-center gap-2">
                <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white" style="background-image:linear-gradient(135deg,#059669,#34d399)">
                  <ng-container [ngTemplateOutlet]="robot" [ngTemplateOutletContext]="{ size: 16 }" />
                </span>
                <div class="flex gap-1 rounded-2xl bg-white px-3 py-2.5 shadow-sm dark:bg-slate-800">
                  <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style="animation-delay:0ms"></span>
                  <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style="animation-delay:150ms"></span>
                  <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style="animation-delay:300ms"></span>
                </div>
              </div>
            }
          </div>

          <!-- quick chips -->
          <div class="flex flex-wrap gap-1.5 border-t border-slate-100 px-3 pt-2.5 dark:border-slate-800">
            @for (d of destinations(); track d.path) {
              <button [id]="'bot-chip-' + d.path" (click)="go(d.path)"
                      class="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                {{ d.label }}
              </button>
            }
          </div>

          <!-- input -->
          <form id="bot-form" (submit)="$event.preventDefault(); send()" class="flex items-center gap-2 px-3 py-3">
            <input id="bot-input" [value]="draft()" (input)="draft.set($any($event.target).value)"
                   placeholder="Ask me where to go…"
                   class="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
            <button id="bot-send-btn" type="submit" aria-label="Send"
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition hover:bg-brand-600 disabled:opacity-50"
                    [disabled]="!draft().trim()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
            </button>
          </form>
        </div>
      }

      <!-- ===== floating robot button (3D float + tilt on hover) ===== -->
      <button id="bot-launcher-btn" (click)="toggle()" aria-label="Open navigation assistant"
              class="group relative flex h-16 w-16 items-center justify-center rounded-full text-white shadow-xl transition-transform duration-300 hover:scale-110"
              style="background-image:linear-gradient(135deg,#059669,#34d399); transform-style:preserve-3d"
              [class.animate-float]="!open()">
        <!-- pulsing halo -->
        @if (!open()) {
          <span class="absolute inset-0 -z-10 animate-ping rounded-full bg-emerald-400/40"></span>
        }
        <span class="transition-transform duration-300 group-hover:-rotate-12" style="transform:translateZ(14px)">
          <ng-container [ngTemplateOutlet]="robot" [ngTemplateOutletContext]="{ size: 32 }" />
        </span>
        <!-- little notification dot -->
        @if (!open()) {
          <span class="absolute right-1 top-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white"></span>
        }
      </button>
    </div>

    <!-- ===== cute robot icon (reused at several sizes) ===== -->
    <ng-template #robot let-size="size">
      <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2v3" /><circle cx="12" cy="2" r="1.1" fill="currentColor" stroke="none" />
        <rect x="4" y="6.5" width="16" height="12" rx="4" />
        <rect x="9" y="10.5" width="2" height="3.5" rx="1" fill="currentColor" stroke="none" />
        <rect x="13" y="10.5" width="2" height="3.5" rx="1" fill="currentColor" stroke="none" />
        <path d="M2 11v3" /><path d="M22 11v3" />
      </svg>
    </ng-template>
  `,
})
export class NavigatorBotComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  @ViewChild('scroll') scroll?: ElementRef<HTMLElement>;

  open = signal(false);
  draft = signal('');
  typing = signal(false);
  messages = signal<BotMessage[]>([]);

  private readonly studentDest: Destination[] = [
    { label: 'Home', path: '/student/home', icon: 'home', keywords: ['home', 'dashboard', 'overview', 'start'], blurb: 'your home dashboard' },
    { label: 'Jobs', path: '/student/jobs', icon: 'briefcase', keywords: ['job', 'jobs', 'apply', 'opening', 'role', 'vacancy', 'company', 'eligible'], blurb: 'the job dashboard to browse and apply' },
    { label: 'Tracker', path: '/student/tracker', icon: 'clipboard', keywords: ['track', 'tracker', 'application', 'status', 'applied', 'selected'], blurb: 'your application tracker' },
    { label: 'My profile', path: '/student/profile', icon: 'user', keywords: ['profile', 'resume', 'skills', 'cgpa', 'edit', 'photo', 'complete'], blurb: 'your profile' },
  ];

  private readonly adminDest: Destination[] = [
    { label: 'Home', path: '/admin/home', icon: 'home', keywords: ['home', 'dashboard', 'overview', 'stats', 'start'], blurb: 'your admin dashboard' },
    { label: 'Post job', path: '/admin/jobs', icon: 'briefcase', keywords: ['post', 'job', 'jobs', 'create job', 'opening', 'publish', 'drive'], blurb: 'the job posting form' },
    { label: 'Applications', path: '/admin/applications', icon: 'clipboard', keywords: ['application', 'applicant', 'manage', 'review', 'status', 'select', 'reject'], blurb: 'application management' },
    { label: 'Student signup', path: '/admin/students', icon: 'user-plus', keywords: ['student', 'signup', 'account', 'create', 'register', 'provision', 'credential'], blurb: 'student account creation' },
    { label: 'Reports', path: '/admin/reports', icon: 'chart', keywords: ['report', 'analysis', 'analytics', 'placement rate', 'stats', 'export', 'company', 'college', 'department'], blurb: 'placement report analysis' },
  ];

  isAdmin = computed(() => this.auth.role() === 'ADMIN');
  destinations = computed(() => (this.isAdmin() ? this.adminDest : this.studentDest));

  toggle() {
    this.open.update((v) => !v);
    if (this.open() && this.messages().length === 0) {
      const who = this.auth.user()?.fullName?.split(' ')[0] ?? 'there';
      this.pushBot(`Hi ${who}! I'm Grady 🤖 Tell me where you'd like to go, or tap a shortcut below.`);
    }
  }

  send() {
    const text = this.draft().trim();
    if (!text) return;
    this.messages.update((m) => [...m, { from: 'user', text }]);
    this.draft.set('');
    this.respond(text.toLowerCase());
  }

  private respond(q: string) {
    this.typing.set(true);
    const reply = this.match(q);
    // small "thinking" delay for personality
    setTimeout(() => {
      this.typing.set(false);
      this.messages.update((m) => [...m, reply]);
      this.scrollToBottom();
    }, 450);
    this.scrollToBottom();
  }

  /** Map the query to a greeting, smalltalk, FAQ answer, or a navigation suggestion. */
  private match(q: string): BotMessage {
    const firstName = this.auth.user()?.fullName?.split(' ')[0] ?? 'there';

    // ---- greetings ----
    if (/\b(hi+|hey+|hello+|yo|howdy|namaste|hola|greetings)\b/.test(q) || /good (morning|afternoon|evening|day)/.test(q)) {
      return { from: 'bot', text: `Hi ${firstName}! 👋 ${this.capabilities()} What would you like to do?` };
    }
    // ---- smalltalk ----
    if (/how are you|how'?s it going|how do you do|what'?s up|wassup|sup\b/.test(q)) {
      return { from: 'bot', text: `Doing great and ready to help! ${this.capabilities()}` };
    }
    if (/\b(thanks|thank you|thx|ty|cheers|appreciate)\b/.test(q)) {
      return { from: 'bot', text: "You're welcome! 😊 Anything else I can open for you?" };
    }
    if (/\b(bye|goodbye|see you|cya|good night|gn)\b/.test(q)) {
      return { from: 'bot', text: 'See you around! 👋 Tap the robot any time you need to get somewhere.' };
    }
    // ---- who/what are you, help, capabilities ----
    if (/who are you|what are you|your name|what can you do|what do you do|\bhelp\b|\bmenu\b|options|guide me/.test(q)) {
      return { from: 'bot', text: `I'm Grady 🤖, your in-app guide. ${this.capabilities()} Just say e.g. "open jobs", or tap a shortcut below.` };
    }

    // ---- FAQ intents (richer than a bare link) ----
    if (/(change|reset|forgot|new).*password|password/.test(q)) {
      return { from: 'bot', text: 'You set your own password right after your first login. To update your details later, open your profile.', link: this.isAdmin() ? '/admin/profile' : '/student/profile', linkLabel: 'Open My profile' };
    }
    if (!this.isAdmin() && (/(how|where|want).*apply|apply(ing)?( to)?|submit application/.test(q))) {
      return { from: 'bot', text: 'Open the Job dashboard, pick a role you’re eligible for, choose a resume, and hit Apply.', link: '/student/jobs', linkLabel: 'Open Jobs' };
    }
    if (!this.isAdmin() && /eligib/.test(q)) {
      return { from: 'bot', text: 'Eligibility is auto-checked from your CGPA and skills against each job. Keep your profile complete to unlock more roles.', link: '/student/profile', linkLabel: 'Open My profile' };
    }
    if (!this.isAdmin() && /(my )?(status|result|tracker|where.*application|did i get)/.test(q)) {
      return { from: 'bot', text: 'Your Application Tracker shows the live status of every job you applied to.', link: '/student/tracker', linkLabel: 'Open Tracker' };
    }
    if (this.isAdmin() && /(report|analytic|placement rate|export|csv|pdf)/.test(q)) {
      return { from: 'bot', text: 'The Report Analysis dashboard breaks placements down by company, college and department, with CSV/PDF export.', link: '/admin/reports', linkLabel: 'Open Reports' };
    }
    if (this.isAdmin() && /(create|add|register|provision|new).*(student|account|login)|sign ?up/.test(q)) {
      return { from: 'bot', text: 'Use Student signup to provision a login — it generates a temporary password to share with the student.', link: '/admin/students', linkLabel: 'Open Student signup' };
    }
    if (/log ?out|sign ?out/.test(q)) {
      return { from: 'bot', text: 'Click your avatar at the bottom of the left sidebar, then choose Logout.' };
    }

    // ---- navigation by keyword ----
    const dest = this.destinations().find((d) => d.keywords.some((k) => q.includes(k)));
    if (dest) {
      return { from: 'bot', text: `Sure — that's ${dest.blurb}. Opening it for you 👇`, link: dest.path, linkLabel: `Go to ${dest.label}` };
    }

    // ---- helpful, role-aware fallback ----
    const labels = this.destinations().map((d) => d.label);
    return {
      from: 'bot',
      text: `I didn't quite catch that 🤔 — but I can take you to: ${labels.join(', ')}. Try "open ${labels[1].toLowerCase()}" or tap a shortcut below 👇`,
    };
  }

  /** One-liner describing what Grady can navigate to, role-aware. */
  private capabilities(): string {
    return `I can open ${this.destinations().map((d) => d.label).join(', ')} for you.`;
  }

  go(path: string) {
    this.open.set(false);
    this.router.navigate([path]);
  }

  private pushBot(text: string) {
    this.messages.update((m) => [...m, { from: 'bot', text }]);
    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = this.scroll?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  }

  @HostListener('document:keydown.escape')
  onEsc() { if (this.open()) this.open.set(false); }
}
