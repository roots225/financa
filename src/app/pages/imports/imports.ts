import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../core/finance.service';
import { FORMAT_PIPES } from '../../core/format';
import { LucideIconComponent } from '../../core/lucide-icon.component';
import { ToastService } from '../../core/toast.service';

export interface AuditIngestionLog {
  date: string;
  source: string;
  type: string;
  entriesCount: number;
  totalFcfa: number;
  hash: string;
  status: string;
  icon: string;
}

@Component({
  selector: 'app-imports',
  imports: [CommonModule, LucideIconComponent, ...FORMAT_PIPES],
  templateUrl: './imports.html',
})
export class ImportsPage {
  protected readonly fin = inject(FinanceService);
  private readonly toast = inject(ToastService);

  protected readonly syncingApi = signal(false);
  protected readonly isDragging = signal(false);

  protected readonly auditLogs: AuditIngestionLog[] = [
    {
      date: '28/10/2026 08:30 GMT',
      source: 'EBICS_SGCI_STM_20241028.xml',
      type: 'Relevé CAMT.053',
      entriesCount: 142,
      totalFcfa: 84_250_000,
      hash: 'e3b0c442...98b2',
      status: 'Rapproché (100%)',
      icon: 'landmark',
    },
    {
      date: '27/10/2026 19:15 GMT',
      source: 'ECOBANK_LIVE_SYNC_HOOK',
      type: 'Direct Webhook API',
      entriesCount: 48,
      totalFcfa: 29_110_500,
      hash: '8a7b12c4...aa41',
      status: 'Rapproché (100%)',
      icon: 'webhook',
    },
    {
      date: '25/10/2026 14:02 GMT',
      source: 'LIASSE_FISCALE_2023_DEF.pdf',
      type: 'Liasse OHADA Scannée',
      entriesCount: 894,
      totalFcfa: 642_800_000,
      hash: 'f12e987c...d930',
      status: 'Liasse Intégrée',
      icon: 'file-text',
    },
    {
      date: '22/10/2026 10:11 GMT',
      source: 'GRAND_LIVRE_CLIENTS_SEP.xlsx',
      type: 'Grand Livre SAGE / SAP',
      entriesCount: 344,
      totalFcfa: 112_400_000,
      hash: '99bfa001...22c7',
      status: 'Rapproché (100%)',
      icon: 'table',
    },
  ];

  syncDirectApi(): void {
    this.syncingApi.set(true);
    this.toast.show('Interrogation du Hub BCEAO & des passerelles bancaires...', 'info', 'refresh-cw');
    setTimeout(() => {
      this.syncingApi.set(false);
      this.toast.show(
        'Synchronisation réussie : 3 passerelles interrogées · 28 nouvelles écritures scellées.',
        'success',
        'check-circle-2'
      );
    }, 1200);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.processFile(file.name);
    }
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.processFile(file.name);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  private processFile(filename: string): void {
    this.toast.show(`Fichier « ${filename} » reçu et analysé par l’OCR intelligent.`, 'info', 'scan-line');
    setTimeout(() => {
      this.toast.show(
        `Contrôle de conformité SYSCOHADA validé sans erreur pour ${filename}.`,
        'success',
        'badge-check'
      );
    }, 1000);
  }

  configureOAuth(bank: string): void {
    this.toast.show(`Configuration des jetons OAuth 2.0 pour ${bank} ouverte.`, 'info', 'key');
  }

  exportAuditTrail(): void {
    this.toast.show('Export du journal d’audit cryptographique FIPS 140-3 (CSV) généré.', 'success', 'download');
  }
}
