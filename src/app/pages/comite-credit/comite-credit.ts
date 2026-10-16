import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../core/finance.service';
import { FORMAT_PIPES } from '../../core/format';
import { ToastService } from '../../core/toast.service';
import { LucideIconComponent } from '../../core/lucide-icon.component';

@Component({
  selector: 'app-comite-credit',
  standalone: true,
  imports: [CommonModule, FormsModule, ...FORMAT_PIPES],
  templateUrl: './comite-credit.html',
})
export class ComiteCreditPage {
  protected readonly fin = inject(FinanceService);
  private readonly toast = inject(ToastService);

  readonly showVoteModal = signal(false);
  readonly selectedDecision = signal<'accord' | 'conditionnel' | 'rejet'>('accord');
  voteComment = 'Maintien du ratio DSCR > 1.30x audité chaque semestre par le CAC.';
  readonly isSubmittingVote = signal(false);
  readonly voteSubmittedSuccess = signal(false);

  // Simulator inputs
  quotite = 80000000;
  taux = 6.5;
  duree = 36; // months

  readonly annuite = computed(() => {
    const q = this.quotite || 0;
    const r = (this.taux || 0) / 100;
    const years = (this.duree || 12) / 12;
    if (q <= 0 || years <= 0) return 0;
    const annualInterest = q * r;
    const annualCapital = q / years;
    return Math.round(annualCapital + annualInterest);
  });

  readonly pni = computed(() => {
    const q = this.quotite || 0;
    const r = (this.taux || 0) / 100;
    const years = (this.duree || 12) / 12;
    return Math.round(q * r * years);
  });

  openVoteModal(): void {
    this.showVoteModal.set(true);
  }

  closeVoteModal(): void {
    this.showVoteModal.set(false);
    this.voteSubmittedSuccess.set(false);
  }

  submitVote(): void {
    if (this.isSubmittingVote()) return;
    this.isSubmittingVote.set(true);

    setTimeout(() => {
      this.isSubmittingVote.set(false);
      this.voteSubmittedSuccess.set(true);

      setTimeout(() => {
        this.closeVoteModal();
        this.toast.show(
          'Procès-verbal de délibération signé et déposé au greffe du pool bancaire (eIDAS SHA-256).',
          'success',
          'check-circle'
        );
      }, 700);
    }, 600);
  }

  downloadPdfScelle(): void {
    this.toast.show(
      'Téléchargement du Mémorandum & Dossier de Crédit scellé SHA-256 (PDF eIDAS)...',
      'info',
      'download'
    );
  }

  askComplement(): void {
    this.toast.show(
      'Notification envoyée à West Distribution SA pour demande de pièces complémentaires.',
      'info',
      'bell-plus'
    );
  }

  applyConditions(): void {
    this.toast.show(
      'Conditions de prêt (taux, quotité, maturité) appliquées au projet de protocole.',
      'success',
      'check-circle'
    );
  }

  adjudgeQuotite(): void {
    this.toast.show(
      'Votre quotité a été adjugée avec succès au tour de table de syndication.',
      'success',
      'check-circle'
    );
  }

  viewBankSheet(bank: string): void {
    this.toast.show(
      `Consultation de la fiche d'engagement et des visas légaux : ${bank}`,
      'info',
      'file-text'
    );
  }

  downloadDoc(name: string): void {
    this.toast.show(`Téléchargement de : ${name} (Certifié Mazars / DGI)`, 'info', 'download');
  }
}
