import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FinanceService, IncomeStatementView, variation } from '../../core/finance.service';
import { FORMAT_PIPES } from '../../core/format';
import { ToastService } from '../../core/toast.service';
import { LucideIconComponent } from '../../core/lucide-icon.component';

interface PnlRow {
  label: string;
  key: keyof IncomeStatementView;
  kind: 'line' | 'subtotal' | 'result';
  dot?: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, LucideIconComponent, ...FORMAT_PIPES],
  templateUrl: './dashboard.html',
})
export class DashboardPage {
  protected readonly fin = inject(FinanceService);
  private readonly toast = inject(ToastService);

  // --- Score gauge ---
  protected readonly gaugeCircumference = 2 * Math.PI * 50;
  protected readonly gaugeOffset = this.gaugeCircumference * (1 - this.fin.model.score / 1000);

  // --- P&L toggle ---
  protected readonly period = signal<'month' | 'year'>('year');
  protected readonly pnlRows: PnlRow[] = [
    { label: 'Ventes de marchandises (701)', key: 'sales', kind: 'line', dot: 'bg-primary' },
    { label: 'Achats de marchandises (601)', key: 'purchases', kind: 'line', dot: 'bg-secondary' },
    { label: 'Marge commerciale', key: 'grossMargin', kind: 'subtotal' },
    { label: 'Charges de personnel (66)', key: 'personnel', kind: 'line', dot: 'bg-secondary' },
    { label: 'Excédent brut d’exploitation (EBE)', key: 'ebitda', kind: 'line', dot: 'bg-primary-container' },
    { label: "Résultat d'exploitation (REX)", key: 'operatingIncome', kind: 'line', dot: 'bg-success-container' },
    { label: "Résultat net de l'exercice", key: 'netIncome', kind: 'result' },
  ];
  protected readonly pnlColumns = computed(() => {
    const year = this.period() === 'year';
    const e = this.fin.entity;
    return {
      current: year ? this.fin.pnl : this.fin.pnlMonth,
      prior: year ? this.fin.pnlPrior : this.fin.pnlMonthPrior,
      currentLabel: year ? `Exercice ${e.closedYear}` : `${e.openPeriodShort} ${e.openYear}`,
      priorLabel: year ? `Exercice ${e.closedYear - 1}` : `${e.openPeriodShort} ${e.openYear - 1}`,
    };
  });
  protected variation = variation;

  // --- Aging bar styles ---
  protected readonly agingTone: Record<string, string> = {
    ok: 'bg-primary',
    watch: 'bg-brand-blue/60',
    late: 'bg-secondary',
    critical: 'bg-error',
  };
  protected readonly payablesTone: Record<string, string> = {
    ok: 'bg-secondary',
    watch: 'bg-secondary-container',
    late: 'bg-secondary',
    critical: 'bg-error',
  };
  protected pct(amount: number, total: number): number {
    return (amount / total) * 100;
  }

  // --- Export dossier ---
  protected readonly exportState = signal<'idle' | 'running' | 'done'>('idle');
  exportDossier(): void {
    if (this.exportState() !== 'idle') return;
    this.exportState.set('running');
    setTimeout(() => {
      this.exportState.set('done');
      this.toast.show('Dossier de crédit certifié généré (horodatage SHA-256).');
      setTimeout(() => this.exportState.set('idle'), 3500);
    }, 1200);
  }

  // --- FEC import ---
  private readonly fecInput = viewChild.required<ElementRef<HTMLInputElement>>('fecInput');
  openFecPicker(): void {
    this.fecInput().nativeElement.click();
  }
  onFecSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.toast.show(`Grand livre « ${file.name} » chargé. Recalcul SYSCOHADA en cours…`, 'info', 'upload');
    }
    (event.target as HTMLInputElement).value = '';
  }

  // --- Loan simulator ---
  private readonly simDialog = viewChild.required<ElementRef<HTMLDialogElement>>('simDialog');
  protected readonly loanAmount = signal(40_000_000);
  protected readonly loanMonths = signal(60);
  protected readonly durations = [24, 36, 48, 60, 84];
  protected readonly loan = computed(() => this.fin.simulateLoan(this.loanAmount(), this.loanMonths()));

  openSimulator(): void {
    this.simDialog().nativeElement.showModal();
  }
  closeSimulator(): void {
    this.simDialog().nativeElement.close();
  }
  onAmountInput(event: Event): void {
    const v = Number((event.target as HTMLInputElement).value);
    this.loanAmount.set(Number.isFinite(v) && v > 0 ? v : 0);
  }
  onMonthsChange(event: Event): void {
    this.loanMonths.set(Number((event.target as HTMLSelectElement).value));
  }
  submitLoan(): void {
    const l = this.loan();
    if (!l.dscrOk || !l.withinCapacity) return;
    this.closeSimulator();
    this.toast.show(`Demande transmise aux ${this.fin.bankOffersAvailable} banques partenaires avec accord.`);
  }
}
