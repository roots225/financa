import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LUCIDE_ICONS } from './lucide-icons';

@Component({
  selector: 'lucide-icon',
  standalone: true,
  template: ``,
  host: {
    '[class]': '"inline-flex items-center justify-center shrink-0 align-middle leading-none"',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[innerHTML]': 'svgContent()',
  },
})
export class LucideIconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<string>();
  readonly size = input<number | string>(18);
  readonly strokeWidth = input<number | string>(2);

  protected readonly svgContent = computed<SafeHtml>(() => {
    const raw = LUCIDE_ICONS[this.name()] ?? LUCIDE_ICONS['info'] ?? '';
    // Replace fixed width/height with 100% so it conforms to the host size,
    // and adjust stroke-width if specified.
    const sw = this.strokeWidth();
    const sized = raw
      .replace(/width="24"/g, 'width="100%"')
      .replace(/height="24"/g, 'height="100%"')
      .replace(/stroke-width="2"/g, `stroke-width="${sw}"`);
    return this.sanitizer.bypassSecurityTrustHtml(sized);
  });
}
