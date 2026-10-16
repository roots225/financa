import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  icon: string;
  tone: 'success' | 'info' | 'error';
}

/** Lightweight toast notifications (replaces the mockups' `alert()` calls). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, tone: Toast['tone'] = 'success', icon?: string): void {
    const id = ++this.seq;
    const defaultIcon = tone === 'error' ? 'alert-circle' : tone === 'info' ? 'info' : 'check-circle-2';
    this.toasts.update((t) => [...t, { id, message, tone, icon: icon ?? defaultIcon }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  success(message: string, icon?: string): void {
    this.show(message, 'success', icon);
  }

  info(message: string, icon?: string): void {
    this.show(message, 'info', icon);
  }

  error(message: string, icon?: string): void {
    this.show(message, 'error', icon);
  }

  dismiss(id: number): void {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}
