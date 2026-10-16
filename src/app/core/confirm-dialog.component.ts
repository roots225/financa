import { Component, HostListener, inject } from '@angular/core';
import { ConfirmDialogService } from './confirm-dialog.service';
import { LucideIconComponent } from './lucide-icon.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [LucideIconComponent],
  template: `
    @if (dialogService.activeDialog(); as state) {
      <div
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'dialog-title'"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          (click)="onBackdropClick()"
        ></div>

        <!-- Dialog Box -->
        <div
          class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl transition-all animate-in zoom-in-95 duration-200 border border-slate-100"
        >
          <!-- Tone icon -->
          <div class="flex items-start gap-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
              [class.bg-rose-50]="state.options.tone === 'danger'"
              [class.text-rose-600]="state.options.tone === 'danger'"
              [class.border]="true"
              [class.border-rose-100]="state.options.tone === 'danger'"
              [class.bg-amber-50]="state.options.tone === 'warning'"
              [class.text-amber-600]="state.options.tone === 'warning'"
              [class.border-amber-100]="state.options.tone === 'warning'"
              [class.bg-blue-50]="state.options.tone === 'info'"
              [class.text-blue-600]="state.options.tone === 'info'"
              [class.border-blue-100]="state.options.tone === 'info'"
              [class.bg-emerald-50]="state.options.tone === 'primary'"
              [class.text-primary]="state.options.tone === 'primary'"
              [class.border-emerald-100]="state.options.tone === 'primary'"
            >
              <lucide-icon
                [name]="state.options.icon || (state.options.tone === 'danger' ? 'alert-triangle' : 'shield')"
                size="24"
              />
            </div>

            <div class="flex-1 min-w-0">
              <h3 id="dialog-title" class="text-base font-bold text-slate-900 leading-snug">
                {{ state.options.title }}
              </h3>
              <p class="mt-1.5 text-sm text-slate-600 leading-relaxed">
                {{ state.options.message }}
              </p>
              @if (state.options.description) {
                <p class="mt-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-2.5 border border-slate-100 font-mono">
                  {{ state.options.description }}
                </p>
              }
            </div>
          </div>

          <!-- Action buttons -->
          <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              (click)="dialogService.cancel()"
              [disabled]="state.isSubmitting"
              class="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {{ state.options.cancelText || 'Annuler' }}
            </button>

            <button
              type="button"
              (click)="dialogService.submit()"
              [disabled]="state.isSubmitting"
              class="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              [class.bg-rose-600]="state.options.tone === 'danger'"
              [class.hover:bg-rose-700]="state.options.tone === 'danger'"
              [class.text-white]="true"
              [class.bg-amber-600]="state.options.tone === 'warning'"
              [class.hover:bg-amber-700]="state.options.tone === 'warning'"
              [class.bg-blue-600]="state.options.tone === 'info'"
              [class.hover:bg-blue-700]="state.options.tone === 'info'"
              [class.bg-primary]="state.options.tone === 'primary'"
              [class.hover:bg-primary/90]="state.options.tone === 'primary'"
            >
              @if (state.isSubmitting) {
                <lucide-icon name="loader-2" size="18" class="animate-spin" />
                <span>Traitement...</span>
              } @else {
                <span>{{ state.options.confirmText || 'Confirmer' }}</span>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  protected readonly dialogService = inject(ConfirmDialogService);

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (!this.dialogService.activeDialog()?.isSubmitting) {
      this.dialogService.cancel();
    }
  }

  onBackdropClick(): void {
    if (!this.dialogService.activeDialog()?.isSubmitting) {
      this.dialogService.cancel();
    }
  }
}
