import { Injectable, signal } from '@angular/core';

export type DialogTone = 'danger' | 'warning' | 'info' | 'primary';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  description?: string;
  tone?: DialogTone;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  action?: () => Promise<void> | void;
}

export interface ActiveDialogState {
  options: ConfirmDialogOptions;
  resolve: (value: boolean) => void;
  isSubmitting: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  readonly activeDialog = signal<ActiveDialogState | null>(null);

  /**
   * Opens the confirmation dialog and returns a Promise that resolves to:
   * - `true` if the user confirmed (and the optional async action completed)
   * - `false` if the user cancelled or closed the dialog
   */
  confirm(options: ConfirmDialogOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.activeDialog.set({
        options: {
          tone: 'danger',
          confirmText: 'Confirmer',
          cancelText: 'Annuler',
          icon: 'alert-triangle',
          ...options,
        },
        resolve,
        isSubmitting: false,
      });
    });
  }

  async submit(): Promise<void> {
    const state = this.activeDialog();
    if (!state || state.isSubmitting) return;

    if (state.options.action) {
      try {
        this.activeDialog.set({ ...state, isSubmitting: true });
        await state.options.action();
      } catch (err) {
        console.error('Error in ConfirmDialog action:', err);
        this.activeDialog.set({ ...state, isSubmitting: false });
        return;
      }
    }

    state.resolve(true);
    this.activeDialog.set(null);
  }

  cancel(): void {
    const state = this.activeDialog();
    if (!state || state.isSubmitting) return;
    state.resolve(false);
    this.activeDialog.set(null);
  }
}
