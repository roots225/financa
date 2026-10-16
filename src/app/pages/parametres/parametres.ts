import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../core/finance.service';
import { ToastService } from '../../core/toast.service';
import { LucideIconComponent } from '../../core/lucide-icon.component';

export type ParamTab = 'org' | 'rbac' | 'hsm' | 'gateways';

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideIconComponent],
  templateUrl: './parametres.html',
})
export class ParametresPage {
  protected readonly fin = inject(FinanceService);
  private readonly toast = inject(ToastService);

  readonly activeTab = signal<ParamTab>('org');
  readonly doubleSignature = signal(true);
  readonly isSaving = signal(false);

  // Form values
  companyName = 'West Distribution SA';
  legalForm = 'Société Anonyme de Droit Ivoirien (avec CA)';
  rccm = 'CI-ABJ-2018-B-14209';
  dgiAccount = '1820491 A';
  shareCapital = '100 000 000';
  currency = 'Franc CFA UEMOA (XOF) - Taux fixe EUR: 655.957';
  accountingStandard = 'SYSCOHADA Révisé 2024 (Système Normal)';
  fiscalYear = '12 mois (01 Janvier - 31 Décembre)';

  readonly subsidiaries = [
    {
      code: 'SN',
      name: 'West Distribution Sénégal SA',
      location: 'Dakar, Point E • RCCM: SN-DKR-2020-B-8911',
      flows: '42 850 000 FCFA',
      status: 'Connecté',
      tone: 'success',
    },
    {
      code: 'CI',
      name: 'West Logistique CI SARL',
      location: 'San Pedro Port • RCCM: CI-SAS-2021-B-2340',
      flows: '18 400 000 FCFA',
      status: 'Connecté',
      tone: 'success',
    },
    {
      code: 'TP',
      name: 'Sodeci Transit Partner SARL',
      location: 'Abidjan Port-Bouët • Transit Douanier',
      flows: 'En attente',
      status: 'En attente BCEAO',
      tone: 'pending',
    },
  ];

  readonly users = [
    {
      initials: 'AD',
      name: 'M. Amadou Diallo',
      email: 'a.diallo@westdistribution.ci',
      role: 'Admin Finance & DGI',
      authMethod: 'Clé eIDAS #A491',
      authDetail: 'PKI YubiKey FIPS',
      scope: 'Clôture, signature pool, validation DGI',
    },
    {
      initials: 'FN',
      name: "Mme Fatou N'Diaye",
      email: 'f.ndiaye@westdistribution.ci',
      role: 'Trésorerie & Rapprochement',
      authMethod: 'Token OTP TOTP',
      authDetail: 'Double facteur matériel',
      scope: 'Saisie des écritures, gestion BFR',
    },
    {
      initials: 'OT',
      name: 'Dr. O. Traoré',
      email: 'o.traore@boad.int',
      role: 'Prêteur Syndiqué (BOAD)',
      authMethod: 'PKI Institutionnelle',
      authDetail: 'Certificat Banque Dépositaire',
      scope: 'Lecture seule liasses, covenants & TFT',
    },
    {
      initials: 'MZ',
      name: 'Cabinet Mazars / Audit West',
      email: 'certification.ohada@mazars.ci',
      role: 'Commissaire aux Comptes (CAC)',
      authMethod: 'Scellement SHA-256',
      authDetail: 'Signature légale ONECCA',
      scope: "Certification d'exercice, archivage légal",
    },
  ];

  switchTab(tab: ParamTab): void {
    this.activeTab.set(tab);
  }

  saveSettings(): void {
    if (this.isSaving()) return;
    this.isSaving.set(true);

    setTimeout(() => {
      this.isSaving.set(false);
      this.toast.show(
        'Paramètres et politique de gouvernance enregistrés avec succès (Horodatage eIDAS scellé).',
        'success',
        'check-circle'
      );
    }, 700);
  }

  openAuditLog(): void {
    this.toast.show(
      "Journal d'audit de sécurité des systèmes d'information (SSI) exporté au format scellé.",
      'info',
      'history'
    );
  }

  testGateways(): void {
    this.toast.show(
      'Test de connectivité réussi : 3/3 passerelles bancaires actives (latence moyenne : 14 ms).',
      'success',
      'network'
    );
  }

  downloadComplianceCert(): void {
    this.toast.show(
      'Téléchargement du Certificat de Conformité Numérique OHADA & BCEAO (PDF scellé)...',
      'info',
      'download'
    );
  }

  purgeCache(): void {
    this.toast.show(
      'Cache applicatif purgé et clés de session bancaires régénérées.',
      'info',
      'refresh-cw'
    );
  }
}
