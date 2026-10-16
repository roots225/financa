import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../core/finance.service';
import { FORMAT_PIPES } from '../../core/format';
import { ToastService } from '../../core/toast.service';
import { LucideIconComponent } from '../../core/lucide-icon.component';

export type TabType = 'cr' | 'sig' | 'tft' | 'mensuel' | 'bilan';

@Component({
  selector: 'app-etats-financiers',
  standalone: true,
  imports: [CommonModule, LucideIconComponent, ...FORMAT_PIPES],
  templateUrl: './etats-financiers.html',
})
export class EtatsFinanciersPage {
  protected readonly fin = inject(FinanceService);
  private readonly toast = inject(ToastService);

  readonly activeTab = signal<TabType>('cr');

  readonly months = [
    { name: 'Jan', prod: 4.8, charges: 3.8, pHeight: '62%', cHeight: '50%' },
    { name: 'Fév', prod: 5.1, charges: 3.6, pHeight: '68%', cHeight: '48%' },
    { name: 'Mar', prod: 5.7, charges: 3.9, pHeight: '75%', cHeight: '52%' },
    { name: 'Avr', prod: 5.3, charges: 4.1, pHeight: '70%', cHeight: '55%' },
    { name: 'Mai', prod: 4.9, charges: 3.8, pHeight: '65%', cHeight: '50%' },
    { name: 'Jun', prod: 6.2, charges: 4.3, pHeight: '82%', cHeight: '58%' },
    { name: 'Jul', prod: 5.8, charges: 4.0, pHeight: '78%', cHeight: '54%' },
    { name: 'Aoû', prod: 5.2, charges: 3.7, pHeight: '70%', cHeight: '49%' },
    { name: 'Sep', prod: 6.4, charges: 4.2, pHeight: '85%', cHeight: '56%' },
    { name: 'Oct', prod: 6.6, charges: 4.5, pHeight: '88%', cHeight: '60%' },
    { name: 'Nov', prod: 6.8, charges: 4.6, pHeight: '90%', cHeight: '62%' },
    { name: 'Déc', prod: 7.2, charges: 5.1, pHeight: '96%', cHeight: '68%' },
  ];

  switchTab(tab: TabType): void {
    this.activeTab.set(tab);
  }

  rapprocherGrandLivre(): void {
    this.toast.show(
      'Rapprochement avec le Grand Livre SYSCOHADA effectué (100% de concordance, 0 écriture divergente).',
      'success',
      'check-circle'
    );
  }

  exporterLiasseFiscale(): void {
    this.toast.show(
      'Génération de la Liasse Fiscale certifiée (PDF scellé SHA-256 / XML DGI e-Impôt).',
      'info',
      'download'
    );
  }
}
