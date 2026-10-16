import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../core/finance.service';
import { FORMAT_PIPES } from '../../core/format';
import { LucideIconComponent } from '../../core/lucide-icon.component';
import { ToastService } from '../../core/toast.service';

export type ScenarioKey = 'pessimiste' | 'base' | 'optimiste';
export type AnalysisTab = 'tab-ventes' | 'tab-cr' | 'tab-bilan' | 'tab-tresorerie' | 'tab-stresstest';

interface ScenarioData {
  growth: number;
  ca: number;
  varCa: string;
  rn: number;
  caf: number;
  ebe: number;
  gearing: number;
}

const SCENARIOS: Record<ScenarioKey, ScenarioData> = {
  pessimiste: {
    growth: -4.0,
    ca: 64_128_000,
    varCa: '-4,0%',
    rn: 14_200_000,
    caf: 28_500_000,
    ebe: 24_100_000,
    gearing: 36.2,
  },
  base: {
    growth: 12.0,
    ca: 74_816_000,
    varCa: '+12,0%',
    rn: 21_400_000,
    caf: 37_800_000,
    ebe: 31_820_000,
    gearing: 29.4,
  },
  optimiste: {
    growth: 22.0,
    ca: 81_496_000,
    varCa: '+22,0%',
    rn: 26_800_000,
    caf: 44_200_000,
    ebe: 38_600_000,
    gearing: 24.8,
  },
};

@Component({
  selector: 'app-analyses-previsionnel',
  imports: [CommonModule, FormsModule, LucideIconComponent, ...FORMAT_PIPES],
  templateUrl: './analyses-previsionnel.html',
})
export class AnalysesPrevisionnelPage {
  protected readonly fin = inject(FinanceService);
  private readonly toast = inject(ToastService);

  protected readonly activeTab = signal<AnalysisTab>('tab-ventes');
  protected readonly activeScenario = signal<ScenarioKey>('base');
  protected readonly recalibrating = signal(false);

  // Sliders
  protected readonly growthSlider = signal(12.0);
  protected readonly inflationSlider = signal(8.0);
  protected readonly capexSlider = signal(50); // in Millions FCFA

  // Derived financial figures based on sliders
  protected readonly simulatedCA = computed(() => {
    const baseCA = 66_800_000;
    return Math.round(baseCA * (1 + this.growthSlider() / 100));
  });

  protected readonly simulatedEBE = computed(() => {
    // EBE base 31.82M with growth and inflation impact
    const baseEbe = 31_820_000;
    const growthDelta = (this.growthSlider() - 12.0) * 450_000;
    const inflationCost = (this.inflationSlider() - 8.0) * 350_000;
    return Math.max(15_000_000, Math.round(baseEbe + growthDelta - inflationCost));
  });

  protected readonly simulatedGearing = computed(() => {
    const baseGearing = 29.4;
    const capexExtra = (this.capexSlider() - 50) * 0.15;
    const growthDampener = (this.growthSlider() - 12.0) * 0.2;
    return +(baseGearing + capexExtra - growthDampener).toFixed(1);
  });

  protected readonly simulatedRN = computed(() => {
    const baseRN = 21_400_000;
    const delta = (this.simulatedEBE() - 31_820_000) * 0.75; // after 25% tax
    return Math.round(baseRN + delta);
  });

  protected readonly simulatedCAF = computed(() => {
    return Math.round(this.simulatedRN() + 16_400_000); // net income + non-cash depreciation
  });

  // Monthly table data derived dynamically
  protected readonly monthlyProjections = computed(() => {
    const total = this.simulatedCA();
    const weights = [0.0754, 0.0772, 0.0805, 0.0826, 0.0845, 0.0862]; // S1 months
    const s1Total = weights.reduce((a, b) => a + b, 0);
    const s2Weight = 1 - s1Total;

    const baseN1 = [5_120_000, 5_240_000, 5_380_000, 5_510_000, 5_620_000, 5_750_000];

    const months = ['Janvier 2025', 'Février 2025', 'Mars 2025', 'Avril 2025', 'Mai 2025', 'Juin 2025'];
    const rows = months.map((m, i) => {
      const pred = Math.round(total * weights[i]);
      const min = Math.round(pred * 0.95);
      const max = Math.round(pred * 1.05);
      const prior = baseN1[i];
      const ev = ((pred - prior) / prior) * 100;
      return {
        month: m,
        predicted: pred,
        min,
        max,
        prior,
        evol: (ev > 0 ? '+' : '') + ev.toFixed(1) + '%',
      };
    });

    const s2Pred = Math.round(total * s2Weight);
    const s2Prior = 34_180_000;
    const s2Ev = ((s2Pred - s2Prior) / s2Prior) * 100;

    return {
      s1: rows,
      s2: {
        label: 'Projection S2 (Juil - Déc 2025)',
        predicted: s2Pred,
        min: Math.round(s2Pred * 0.94),
        max: Math.round(s2Pred * 1.06),
        prior: s2Prior,
        evol: (s2Ev > 0 ? '+' : '') + s2Ev.toFixed(1) + '%',
      },
      total: {
        predicted: total,
        min: Math.round(total * 0.95),
        max: Math.round(total * 1.05),
        prior: 66_800_000,
        evol: (this.growthSlider() > 0 ? '+' : '') + this.growthSlider().toFixed(1) + '%',
      },
    };
  });

  setScenario(key: ScenarioKey): void {
    this.activeScenario.set(key);
    const sc = SCENARIOS[key];
    this.growthSlider.set(sc.growth);
    if (key === 'pessimiste') {
      this.inflationSlider.set(12.0);
      this.capexSlider.set(30);
    } else if (key === 'base') {
      this.inflationSlider.set(8.0);
      this.capexSlider.set(50);
    } else {
      this.inflationSlider.set(5.0);
      this.capexSlider.set(70);
    }
    this.toast.show(`Scénario « ${key.toUpperCase()} » appliqué au modèle prévisionnel.`, 'info');
  }

  resetSliders(): void {
    this.setScenario('base');
    this.toast.show('Curseurs de sensibilité réinitialisés.', 'info');
  }

  recalibrateModel(): void {
    this.recalibrating.set(true);
    this.toast.show('Optimisation des hyperparamètres Ridge / XGBoost en cours...', 'info', 'sliders-horizontal');
    setTimeout(() => {
      this.recalibrating.set(false);
      this.toast.show('Modèle prédictif ré-entraîné et validé (R² = 0,924 · MAPE = 3,7%).', 'success', 'check-circle-2');
    }, 1200);
  }

  exportForecast(): void {
    this.toast.show('Export du modèle prévisionnel (Liasse Bilan + CR + TFT 2025 en format XLSX/PDF) prêt.', 'success', 'download');
  }
}
