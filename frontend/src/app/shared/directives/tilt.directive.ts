import { Directive, ElementRef, HostListener, Input, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appTilt]',
})
export class TiltDirective {
  private el = inject(ElementRef<HTMLElement>);
  private reduceMotion = false;
  @Input() tiltMax = 7;

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
  }

  @HostListener('mousemove', ['$event'])
  onMove(e: MouseEvent) {
    if (this.reduceMotion) return;
    const node = this.el.nativeElement;
    const r = node.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * this.tiltMax * 2;
    const ry = (px - 0.5) * this.tiltMax * 2;
    node.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  }

  @HostListener('mouseleave')
  onLeave() {
    this.el.nativeElement.style.transform = '';
  }
}