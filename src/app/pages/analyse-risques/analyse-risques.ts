import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../core/finance.service';
import { FORMAT_PIPES } from '../../core/format';
import { LucideIconComponent } from '../../core/lucide-icon.component';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-analyse-risques',
  imports: [FormsModule, LucideIconComponent, ...FORMAT_PIPES],
  templateUrl: './analyse-risques.html',
})
export class AnalyseRisquesPage {
  protected readonly fin = inject(FinanceService);
  private readonly toast = inject(ToastService);

  // Stress-test sliders (reactive signals)
  protected readonly salesShock = signal(-10);
  protected readonly rateShock = signal(150);
  protected readonly dsoShock = signal(15);

  protected readonly stressResult = computed(() =>
    this.fin.stressTest({
      salesShockPct: this.salesShock(),
      rateShockBps: this.rateShock(),
      dsoShockDays: this.dsoShock(),
    })
  );

  resetStressTest(): void {
    this.salesShock.set(-10);
    this.rateShock.set(150);
    this.dsoShock.set(15);
    this.toast.show('Paramètres de stress test réinitialisés.', 'info');
  }

  transmitAttestation(): void {
    this.toast.show(
      "Attestation de solvabilité et rapport prudentiel transmis aux 3 banques partenaires.",
      'success',
      'shield-check'
    );
  }

  downloadReport(): void {
    this.toast.show(
      'Génération du rapport de solvabilité certifié (format PDF Bâle III / BCEAO)…',
      'info',
      'download'
    );
  }
}
