import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../core/finance.service';
import { FORMAT_PIPES } from '../../core/format';
import { ToastService } from '../../core/toast.service';
import { LucideIconComponent } from '../../core/lucide-icon.component';
import { JournalCode, JournalLine } from '../../core/finance-data';

@Component({
  selector: 'app-tenue-comptable',
  imports: [FormsModule, LucideIconComponent, ...FORMAT_PIPES],
  templateUrl: './tenue-comptable.html',
})
export class TenueComptablePage {
  protected readonly fin = inject(FinanceService);
  private readonly toast = inject(ToastService);

  // Filtres
  protected readonly selectedJournal = signal<JournalCode | 'ALL'>('ALL');
  protected readonly searchQuery = signal('');
  protected readonly selectedPeriod = signal('M10');
  protected readonly selectedStatus = signal('ALL');

  // Compte bancaire sélectionné pour le rapprochement
  protected readonly selectedBankAccount = signal('521100');
  protected readonly bankReconciliation = computed(() =>
    this.fin.reconciliation(this.selectedBankAccount())
  );

  // Journal filtré
  protected readonly filteredJournal = computed(() => {
    const list = this.fin.journal();
    const jnl = this.selectedJournal();
    const query = this.searchQuery().toLowerCase().trim();
    const status = this.selectedStatus();

    return list.filter((item) => {
      if (jnl !== 'ALL' && item.journal !== jnl) return false;
      if (status === 'MATCHED' && !item.status.includes('Rapproché') && !item.status.includes('Lettré')) return false;
      if (status === 'PENDING' && (item.status === 'Rapproché' || item.status === 'Lettré')) return false;
      if (query) {
        const matchesQuery =
          item.account.toLowerCase().includes(query) ||
          item.accountLabel.toLowerCase().includes(query) ||
          item.label.toLowerCase().includes(query) ||
          item.reference.toLowerCase().includes(query) ||
          item.entry.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }
      return true;
    });
  });

  // Modal Saisie Manuelle
  private readonly entryDialog = viewChild.required<ElementRef<HTMLDialogElement>>('entryDialog');
  protected newEntryJournal: JournalLine['journal'] = 'BQ';
  protected newEntryDate = '2026-10-28';
  protected newEntryDebitAccount = '';
  protected newEntryCreditAccount = '';
  protected newEntryAmount = 0;
  protected newEntryLabel = '';

  openEntryModal(): void {
    this.entryDialog().nativeElement.showModal();
  }

  closeEntryModal(): void {
    this.entryDialog().nativeElement.close();
  }

  submitNewEntry(): void {
    const success = this.fin.addManualEntry({
      journal: this.newEntryJournal,
      date: this.newEntryDate,
      debitAccount: this.newEntryDebitAccount,
      creditAccount: this.newEntryCreditAccount,
      amount: this.newEntryAmount,
      label: this.newEntryLabel,
    });

    if (success) {
      this.closeEntryModal();
      this.toast.show(
        `Écriture enregistrée avec succès dans le Journal ${this.newEntryJournal} !`,
        'success',
        'list-checks'
      );
      this.newEntryDebitAccount = '';
      this.newEntryCreditAccount = '';
      this.newEntryAmount = 0;
      this.newEntryLabel = '';
    } else {
      this.toast.show(
        'Veuillez renseigner des comptes valides (chiffres) et un montant strictement positif.',
        'error',
        'alert-triangle'
      );
    }
  }

  // Import Relevé Bancaire
  private readonly bankFileInput = viewChild.required<ElementRef<HTMLInputElement>>('bankFileInput');
  openBankFilePicker(): void {
    this.bankFileInput().nativeElement.click();
  }

  onBankFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.toast.show(
        `Relevé bancaire « ${file.name} » importé. 3 flux rapprochés automatiquement.`,
        'success',
        'receipt'
      );
    }
    (event.target as HTMLInputElement).value = '';
  }

  validateFlow(id: string): void {
    const validated = this.fin.validateFlow(id);
    if (validated) {
      this.toast.show(
        `Flux de ${validated.label} imputé au Grand Livre avec succès !`,
        'success',
        'wand-2'
      );
    }
  }

  autoMatchAll(): void {
    const count = this.fin.pendingFlows().length;
    if (count === 0) {
      this.toast.show('Tous les flux ont déjà été validés.', 'info');
      return;
    }
    const flows = [...this.fin.pendingFlows()];
    for (const f of flows) {
      this.fin.validateFlow(f.id);
    }
    this.toast.show(
      `${count} flux validés et imputés au Grand Livre en écriture double !`,
      'success',
      'check-circle-2'
    );
  }

  exportJournalFEC(): void {
    this.toast.show(
      'Export Grand Livre (format FEC / Excel conforme SYSCOHADA) généré.',
      'info',
      'download'
    );
  }
}
