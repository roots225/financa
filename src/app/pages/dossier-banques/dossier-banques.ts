import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '../../core/finance.service';
import { FORMAT_PIPES } from '../../core/format';
import { LucideIconComponent } from '../../core/lucide-icon.component';
import { ToastService } from '../../core/toast.service';

export interface DataRoomDoc {
  id: string;
  title: string;
  detail: string;
  icon: string;
  auditor: string;
  auditorIcon: string;
  authorizedBanks: string[];
  allBanks: boolean;
  date: string;
}

export interface BankOfferDetail {
  code: string;
  name: string;
  fullName: string;
  role: string;
  type: string;
  amount: number;
  share: number;
  tenor: string;
  rate: string;
  status: string;
  decisionRef: string;
  collateral: string;
  covenant: string;
  primaryAction: string;
  secondaryAction: string;
  tone: 'primary' | 'secondary' | 'slate';
}

@Component({
  selector: 'app-dossier-banques',
  imports: [CommonModule, LucideIconComponent, ...FORMAT_PIPES],
  templateUrl: './dossier-banques.html',
})
export class DossierBanquesPage {
  protected readonly fin = inject(FinanceService);
  private readonly toast = inject(ToastService);

  /** Toggle for the full official printable Convention de Pool Bancaire modal */
  protected readonly showConventionModal = signal(false);

  /** Active protocol signing state */
  protected readonly signingState = signal<'idle' | 'signing' | 'signed'>('idle');

  protected readonly bankOffers: BankOfferDetail[] = [
    {
      code: 'BOAD',
      name: 'BOAD',
      fullName: 'Banque Ouest Africaine de Développement',
      role: 'Institution Multilatérale',
      type: 'Financement Moyen Terme (Équipement & Transition Logistique)',
      amount: 80_000_000,
      share: 33.3,
      tenor: '36 mois (Amort. lin.)',
      rate: '6.25% Fixe (Bonus Vert)',
      status: 'Accord Ferme',
      decisionRef: 'Décision Comité N° 2024-BOAD-09 / Lomé',
      collateral: 'Nantissement matériel frigorifique (couverture 110%)',
      covenant: 'Reporting semestriel ESG certifié',
      primaryAction: 'Signer le Protocole',
      secondaryAction: "Demander réaménagement de l'amortissement",
      tone: 'primary',
    },
    {
      code: 'ECO',
      name: 'Ecobank CI',
      fullName: "Ecobank Côte d'Ivoire (Plateau, Abidjan)",
      role: 'Chef de File Commercial',
      type: 'Ligne Campagne, Crédit Documentaire & BFR',
      amount: 120_000_000,
      share: 50.0,
      tenor: '12 mois (Renouvelable)',
      rate: '6.75% (TBB + 1.25%)',
      status: 'Accord Ferme',
      decisionRef: 'Offre indicative validée par Risques Entreprises',
      collateral: 'Cession Dailly créances SODECI & Hypermarchés',
      covenant: 'Domiciliation de 40% des recettes commerciales',
      primaryAction: 'Confirmer Covenants',
      secondaryAction: 'Connecter compte bancaire API Ecobank',
      tone: 'secondary',
    },
    {
      code: 'SGCI',
      name: 'Société Générale CI',
      fullName: 'Direction des Grandes Entreprises',
      role: 'Banque Partenaire',
      type: 'Ligne Spot, Trésorerie Découvert & Cautions Marchés',
      amount: 40_000_000,
      share: 16.7,
      tenor: '12 mois (Revue ann.)',
      rate: '7.10% (Indice UEMOA)',
      status: 'En Délibération',
      decisionRef: 'Passage en comité de crédit prévu à J+2',
      collateral: 'Caution solidaire dirigeant limitée à 50%',
      covenant: 'Ratio Fonds de Roulement Net Global > 0',
      primaryAction: 'Fournir Avis Complémentaire',
      secondaryAction: 'Rapport de solvabilité certifié transmis',
      tone: 'slate',
    },
  ];

  protected readonly dataRoomDocs: DataRoomDoc[] = [
    {
      id: 'doc-1',
      title: 'Liasses Fiscales SYSCOHADA (2022-2024)',
      detail: 'Bilans, Comptes de Résultat & TFT certifiés',
      icon: 'folder-archive',
      auditor: 'CAC Mazars CI',
      auditorIcon: 'check-check',
      authorizedBanks: ['BOAD', 'Ecobank', 'SGBCI'],
      allBanks: false,
      date: 'Clôturé 2024',
    },
    {
      id: 'doc-2',
      title: 'Rapprochements Bancaires Réconciliés M10',
      detail: 'Soldes clôture comptes Banque Centrale & Locaux',
      icon: 'landmark',
      auditor: 'Direction Trésorerie',
      auditorIcon: 'check',
      authorizedBanks: ['Ecobank', 'SGBCI'],
      allBanks: false,
      date: '28/10/2026',
    },
    {
      id: 'doc-3',
      title: 'Budget Prévisionnel & Modèle BFR 2025',
      detail: 'Hypothèses validées sous intervalle confiance 95%',
      icon: 'line-chart',
      auditor: 'Finança Analytics',
      auditorIcon: 'check-check',
      authorizedBanks: ['Pool Entier (3)'],
      allBanks: true,
      date: 'Exercice 2025',
    },
    {
      id: 'doc-4',
      title: 'Attestations Régularité Fiscale & CNSS',
      detail: 'Quitus DGI Abidjan Nord 2024 & CNPS à jour',
      icon: 'badge-check',
      auditor: 'DGI / CNPS CI',
      auditorIcon: 'check',
      authorizedBanks: ['Pool Entier (3)'],
      allBanks: true,
      date: 'À jour 2026',
    },
  ];

  protected readonly auditTrail = [
    {
      analyst: 'M. Traoré (Analyste Risques Ecobank)',
      action: 'A téléchargé Liasse SYSCOHADA 2024',
      time: "Aujourd'hui à 10:14 (IP Abidjan)",
      icon: 'fingerprint',
    },
    {
      analyst: 'Mme. Diallo (Pôle Structuration BOAD)',
      action: 'Consultation Modèle BFR & Cash Flow 2025',
      time: 'Hier à 17:42 (IP Lomé)',
      icon: 'eye',
    },
    {
      analyst: 'Comité Crédit SGBCI',
      action: 'Extraction rapport notation financière A-',
      time: 'Hier à 14:05 (IP Abidjan)',
      icon: 'download',
    },
  ];

  openConventionModal(): void {
    this.showConventionModal.set(true);
  }

  closeConventionModal(): void {
    this.showConventionModal.set(false);
  }

  downloadCertifiedDossier(): void {
    this.toast.show(
      'Génération du dossier de syndication certifié (PDF horodaté SHA-256 eIDAS)…',
      'info',
      'download'
    );
  }

  inviteLender(): void {
    this.toast.show(
      'Invitation sécurisée générée avec lien crypté à usage unique pour analyste bancaire.',
      'info',
      'user-plus'
    );
  }

  validateSyndication(): void {
    this.toast.show(
      'Syndication validée ! Notification transmise à Ecobank CI (Chef de File) et à la BOAD.',
      'success',
      'check-circle-2'
    );
  }

  signProtocol(): void {
    this.signingState.set('signing');
    this.toast.show('Authentification OTP Dirigeant en cours pour scellement...', 'info', 'key');
    setTimeout(() => {
      this.signingState.set('signed');
      this.toast.show(
        'Protocole d’accord signé avec succès sous certificat eIDAS / OHADA (OTP validé).',
        'success',
        'shield-check'
      );
    }, 1200);
  }

  printConvention(): void {
    window.print();
  }
}
