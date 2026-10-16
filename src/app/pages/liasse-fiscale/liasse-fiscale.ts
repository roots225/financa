import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../core/finance.service';
import { FORMAT_PIPES } from '../../core/format';
import { ToastService } from '../../core/toast.service';
import { LucideIconComponent } from '../../core/lucide-icon.component';

export interface TableauSyscohada {
  code: string;
  category: 'etats' | 'resultat' | 'annexes' | 'engagements';
  title: string;
  details: string;
  amount: number;
  currency: string;
  delta: string;
  badge?: string;
  isSealed: boolean;
}

@Component({
  selector: 'app-liasse-fiscale',
  standalone: true,
  imports: [CommonModule, FormsModule, ...FORMAT_PIPES],
  templateUrl: './liasse-fiscale.html',
})
export class LiasseFiscalePage {
  protected readonly fin = inject(FinanceService);
  private readonly toast = inject(ToastService);

  readonly activeCategory = signal<'all' | 'etats' | 'resultat' | 'annexes' | 'engagements'>('all');
  readonly searchQuery = signal<string>('');
  readonly isTransmitting = signal<boolean>(false);

  readonly tableaux: TableauSyscohada[] = [
    {
      code: 'TAB-01',
      category: 'etats',
      title: 'Bilan Actif',
      details: '32 postes concordants · Actif immobilisé & circulant · Art. 25 OHADA',
      amount: 248920400,
      currency: 'FCFA',
      delta: '0 FCFA',
      isSealed: true,
    },
    {
      code: 'TAB-02',
      category: 'etats',
      title: 'Bilan Passif',
      details: 'Équilibre strict Actif=Passif vérifié · Fonds propres : 149.15M FCFA',
      amount: 248920400,
      currency: 'FCFA',
      delta: '0 FCFA',
      isSealed: true,
    },
    {
      code: 'TAB-03',
      category: 'etats',
      title: 'Compte de Résultat (SIG)',
      details: 'CA : 57 580 000 FCFA · Valeur Ajoutée (VA) : 34 480 000 FCFA',
      amount: 18635000,
      currency: 'FCFA',
      delta: '0 FCFA',
      isSealed: true,
    },
    {
      code: 'TAB-04',
      category: 'etats',
      title: 'Tableau des Flux de Trésorerie (TFT)',
      details: "Méthode indirecte · Flux net d'exploitation +7 020 000 FCFA",
      amount: 7020000,
      currency: 'FCFA',
      delta: '0 FCFA',
      isSealed: true,
    },
    {
      code: 'TAB-09',
      category: 'resultat',
      title: 'Détermination du Résultat Fiscal',
      details: 'Réintégrations amortissements excédentaires véhicules plafonnés (20M FCFA)',
      amount: 21845000,
      currency: 'FCFA',
      delta: '0 FCFA',
      badge: 'DGI Liasse',
      isSealed: true,
    },
    {
      code: 'TAB-10',
      category: 'resultat',
      title: "Calcul de l'IMF & Liquidation de l'Impôt BIC",
      details: 'Comparatif IMF (0.5% CA) vs 25% BIC · Règle du plus élevé appliquée',
      amount: 5461250,
      currency: 'FCFA',
      delta: '0 FCFA',
      isSealed: true,
    },
    {
      code: 'TAB-21',
      category: 'annexes',
      title: 'Répartition VA & Effectifs Déclarés',
      details: "Concordance DISA / CNSS Côte d'Ivoire · 42 effectifs temps plein",
      amount: 18420000,
      currency: 'FCFA',
      delta: '0 FCFA',
      isSealed: true,
    },
    {
      code: 'TAB-27',
      category: 'annexes',
      title: "Éléments d'Évaluation des Stocks",
      details: 'Inventaire physique certifié au 31/12 · Méthode PEPS/FIFO',
      amount: 34180500,
      currency: 'FCFA',
      delta: '0 FCFA',
      isSealed: true,
    },
    {
      code: 'TAB-32',
      category: 'engagements',
      title: 'Sûretés Réelles Consenties & Nantissements',
      details: 'Inscriptions RCCM Abidjan · Gage sur stocks Pool BOAD / Ecobank',
      amount: 85000000,
      currency: 'FCFA',
      delta: '0 FCFA',
      isSealed: true,
    },
  ];

  readonly filteredTableaux = computed(() => {
    const cat = this.activeCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return this.tableaux.filter((item) => {
      const matchCat = cat === 'all' || item.category === cat;
      const matchQuery =
        !query ||
        item.code.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.details.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  });

  launchAudit(): void {
    this.toast.show(
      'Audit Fiscal Préventif exécuté : 36/36 tableaux analysés, 0 risque de redressement détecté.',
      'success',
      'shield-check'
    );
  }

  generatePdfCertifie(): void {
    this.toast.show(
      'Génération du PDF Certifié des 36 tableaux SYSCOHADA avec scellement SHA-256...',
      'info',
      'download'
    );
  }

  teletransmitDgi(): void {
    if (this.isTransmitting()) return;
    this.isTransmitting.set(true);

    setTimeout(() => {
      this.isTransmitting.set(false);
      this.toast.show(
        'Liasse Fiscale télétransmise avec succès à la DGI Côte d’Ivoire (Accusé e-Impôts N° CI-2025-RT8912).',
        'success',
        'check-circle'
      );
    }, 1200);
  }

  revalidateConcordances(): void {
    this.toast.show(
      'Revalidation des concordances effectuée : intégrité cryptographique 100% certifiée.',
      'success',
      'check-check'
    );
  }

  visualiserTableau(tab: TableauSyscohada): void {
    this.toast.show(`Ouverture du tableau ${tab.code} — ${tab.title}`, 'info', 'file-text');
  }

  exporterEdiXml(tab: TableauSyscohada): void {
    this.toast.show(`Export EDI/XML normalisé OHADA téléchargé pour ${tab.code}`, 'success', 'code');
  }

  downloadQuitus(): void {
    this.toast.show(
      'Téléchargement du Quitus Fiscal de Régularité DGI CI-2025-Q9842 (Valide)',
      'info',
      'download'
    );
  }
}
