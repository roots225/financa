import { Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideIconComponent } from './lucide-icon.component';

/**
 * Converts integers to formal French words (e.g. 2 450 000 → "Deux millions quatre cent cinquante mille").
 */
function numberToFrenchWords(n: number): string {
  if (n === 0) return 'Zéro';
  n = Math.floor(Math.abs(n));

  const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const teens = [
    'dix',
    'onze',
    'douze',
    'treize',
    'quatorze',
    'quinze',
    'seize',
    'dix-sept',
    'dix-huit',
    'dix-neuf',
  ];
  const tens = [
    '',
    'dix',
    'vingt',
    'trente',
    'quarante',
    'cinquante',
    'soixante',
    'soixante-dix',
    'quatre-vingts',
    'quatre-vingt-dix',
  ];

  function convertBelow100(val: number): string {
    if (val < 10) return units[val];
    if (val < 20) return teens[val - 10];
    const t = Math.floor(val / 10);
    const u = val % 10;
    if (t === 7) return u === 1 ? 'soixante et onze' : 'soixante-' + teens[u];
    if (t === 9) return 'quatre-vingt-' + teens[u];
    if (t === 8 && u === 0) return 'quatre-vingts';
    if (u === 0) return tens[t];
    if (u === 1 && t < 8) return tens[t] + ' et un';
    return tens[t] + '-' + units[u];
  }

  function convertBelow1000(val: number): string {
    if (val < 100) return convertBelow100(val);
    const h = Math.floor(val / 100);
    const r = val % 100;
    const prefix = h === 1 ? 'cent' : units[h] + (r === 0 ? ' cents' : ' cent');
    if (r === 0) return prefix;
    return prefix + ' ' + convertBelow100(r);
  }

  const billions = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1_000);
  const remainder = n % 1_000;

  const parts: string[] = [];
  if (billions > 0)
    parts.push(convertBelow1000(billions) + (billions > 1 ? ' milliards' : ' milliard'));
  if (millions > 0)
    parts.push(convertBelow1000(millions) + (millions > 1 ? ' millions' : ' million'));
  if (thousands > 0) parts.push(thousands === 1 ? 'mille' : convertBelow1000(thousands) + ' mille');
  if (remainder > 0) parts.push(convertBelow1000(remainder));

  const result = parts.join(' ').trim();
  return result ? result.charAt(0).toUpperCase() + result.slice(1) : '';
}

@Component({
  selector: 'app-amount-input',
  standalone: true,
  imports: [FormsModule, LucideIconComponent],
  template: `
    <div class="flex flex-col gap-1 w-full">
      @if (label()) {
        <label
          [for]="id()"
          class="text-xs font-bold uppercase tracking-wider text-secondary flex items-center justify-between"
        >
          <span>{{ label() }}</span>
          @if (required()) {
            <span class="text-rose-500 font-bold">*</span>
          }
        </label>
      }

      <div class="relative flex items-center">
        <input
          [id]="id()"
          type="number"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [placeholder]="placeholder()"
          [disabled]="disabled()"
          [required]="required()"
          [ngModel]="value()"
          (ngModelChange)="onInputChange($event)"
          class="h-10 w-full rounded-xl bg-surface-container-low pl-3 pr-14 text-body-sm font-semibold tabular text-on-surface placeholder:text-secondary focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <span
          class="pointer-events-none absolute right-3 text-xs font-bold text-secondary font-mono select-none"
        >
          {{ currency() }}
        </span>
      </div>

      <!-- Formatage du montant au bas du champ pour lisibilité immédiate -->
      @if (hasValue()) {
        <div
          class="mt-1 flex flex-col items-start rounded-lg bg-surface-container-low/80 px-2.5 py-1 text-xs text-on-surface border border-surface-container transition-all animate-in fade-in-50 duration-150"
        >
          <div class="flex items-center gap-1 font-bold text-primary font-mono tabular">
            <lucide-icon name="banknote" size="16" class="text-primary/70 shrink-0" />
            <span>{{ formattedValue() }} {{ currency() }}</span>
          </div>

          <div class="flex items-center gap-1">
            @if (showInWords() && wordsValue()) {
              <span class="text-slate-300">·</span>
              <span class="text-[11px] text-slate-600 font-medium italic truncate max-w-full">
                {{ wordsValue() }} {{ currency() }}
              </span>
            }
          </div>
        </div>
      } @else if (helperText()) {
        <p class="text-[11px] text-secondary mt-0.5">{{ helperText() }}</p>
      }
    </div>
  `,
})
export class AmountInputComponent {
  /**
   * Two-way bound numeric value.
   * Usage: `[(value)]="myAmount"`
   */
  readonly value = model<number | null>(null);

  /**
   * Customizable label text (default: 'Montant Net (FCFA)').
   * Can be overridden on each call: `label="Montant du prêt"` or `label="Chiffre d'affaires"`.
   */
  readonly label = input<string>('Montant Net (FCFA)');

  /**
   * HTML element id (default: 'amount-input').
   */
  readonly id = input<string>('amount-input');

  /**
   * Currency suffix displayed inside the input (default: 'FCFA').
   */
  readonly currency = input<string>('FCFA');

  /**
   * Placeholder text (default: '0').
   */
  readonly placeholder = input<string>('0');

  readonly min = input<number>(0);
  readonly max = input<number | null>(null);
  readonly step = input<number>(1);
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly showInWords = input<boolean>(true);
  readonly helperText = input<string | undefined>(undefined);

  readonly hasValue = computed(() => {
    const v = this.value();
    return v !== null && v !== undefined && !Number.isNaN(v) && v > 0;
  });

  /**
   * Formats the number with French thousand separators: 2450000 -> "2 450 000".
   */
  readonly formattedValue = computed(() => {
    const v = this.value();
    if (v === null || v === undefined || Number.isNaN(v)) return '0';
    return new Intl.NumberFormat('fr-FR').format(Math.round(v));
  });

  /**
   * Spells the amount in words in French: 2450000 -> "Deux millions quatre cent cinquante mille".
   */
  readonly wordsValue = computed(() => {
    const v = this.value();
    if (!v || v <= 0) return '';
    return numberToFrenchWords(v);
  });

  /**
   * Short finance magnitude badge: e.g. "2,45 M FCFA" or "1,2 Md FCFA".
   */
  readonly shortScale = computed((): string => {
    const v = this.value();
    if (!v || v < 1_000) return '';
    if (v >= 1_000_000_000) {
      const b = (v / 1_000_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
      return `${b} Md ${this.currency()}`;
    }
    if (v >= 1_000_000) {
      const m = (v / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
      return `${m} M ${this.currency()}`;
    }
    if (v >= 10_000) {
      const k = (v / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 0 });
      return `${k} K ${this.currency()}`;
    }
    return '';
  });

  onInputChange(val: any): void {
    if (val === '' || val === null || val === undefined) {
      this.value.set(null);
    } else {
      const num = Number(val);
      this.value.set(Number.isNaN(num) ? null : num);
    }
  }
}
