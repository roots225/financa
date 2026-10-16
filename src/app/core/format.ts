import { Pipe, PipeTransform } from '@angular/core';

const nf = (min: number, max = min) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: min, maximumFractionDigits: max });

const cache = new Map<string, Intl.NumberFormat>();
function fmt(value: number, digits: number): string {
  const key = String(digits);
  let f = cache.get(key);
  if (!f) {
    f = nf(digits);
    cache.set(key, f);
  }
  return f.format(value);
}

/** 1234567 → "1 234 567" ; with `signed` → "+1 234 567". */
@Pipe({ name: 'fcfa' })
export class FcfaPipe implements PipeTransform {
  transform(value: number | null | undefined, signed = false): string {
    if (value == null || Number.isNaN(value)) return '—';
    const s = fmt(Math.round(value), 0);
    return signed && value > 0 ? `+${s}` : s;
  }
}

/** 47800000 → "47,8M" (millions of FCFA). */
@Pipe({ name: 'mfcfa' })
export class MillionsPipe implements PipeTransform {
  transform(value: number | null | undefined, digits = 1, signed = false): string {
    if (value == null || Number.isNaN(value)) return '—';
    const s = fmt(value / 1_000_000, digits);
    return `${signed && value > 0 ? '+' : ''}${s}M`;
  }
}

/** Fixed-decimals French number: 1.884 → "1,88". */
@Pipe({ name: 'num' })
export class NumPipe implements PipeTransform {
  transform(value: number | null | undefined, digits = 2, signed = false): string {
    if (value == null || Number.isNaN(value)) return '—';
    const s = fmt(value, digits);
    return signed && value > 0 ? `+${s}` : s;
  }
}

/** ISO date → "28/10/26". */
@Pipe({ name: 'shortDate' })
export class ShortDatePipe implements PipeTransform {
  transform(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y.slice(2)}`;
  }
}

export const FORMAT_PIPES = [FcfaPipe, MillionsPipe, NumPipe, ShortDatePipe] as const;
