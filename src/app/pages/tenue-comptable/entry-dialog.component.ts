import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanceService } from '../../core/finance.service';
import { ToastService } from '../../core/toast.service';
import { LucideIconComponent } from '../../core/lucide-icon.component';
import { AmountInputComponent } from '../../core/amount-input.component';
import { JournalCode } from '../../core/finance-data';

export interface OperationSuggestion {
  label: string;
  category: string;
  journal: JournalCode;
  debit: { code: string; label: string };
  credit: { code: string; label: string };
  defaultAmount?: number;
}

const PRESET_SUGGESTIONS: OperationSuggestion[] = [
  {
    label: 'Fournisseur IvoirePack SARL — Achats emballages & matières',
    category: 'Achats Fournisseurs',
    journal: 'AC',
    debit: { code: '602100', label: 'Achats matières & fournitures' },
    credit: { code: '401100', label: 'Fournisseurs locaux' },
    defaultAmount: 2450000,
  },
  {
    label: 'Règlement client SODECI — Encaissement virement bancaire',
    category: 'Clients / Encaissements',
    journal: 'BQ',
    debit: { code: '521100', label: 'Ecobank compte courant' },
    credit: { code: '411001', label: 'SODECI Distr. Abidjan' },
    defaultAmount: 3850000,
  },
  {
    label: 'Facture CIE — Consommation électricité & force motrice',
    category: 'Charges Externes',
    journal: 'AC',
    debit: { code: '605100', label: 'Électricité & Énergie' },
    credit: { code: '401100', label: 'Fournisseurs locaux' },
    defaultAmount: 840000,
  },
  {
    label: 'Facture SODECI — Eau & consommations fluides industriels',
    category: 'Charges Externes',
    journal: 'AC',
    debit: { code: '605200', label: 'Eau & fluides' },
    credit: { code: '401100', label: 'Fournisseurs locaux' },
    defaultAmount: 320000,
  },
  {
    label: 'TOTAL ÉNERGIES — Carburant flotte camions & livraison',
    category: 'Carburant & Transport',
    journal: 'AC',
    debit: { code: '605300', label: 'Carburants & lubrifiants' },
    credit: { code: '401100', label: 'Fournisseurs locaux' },
    defaultAmount: 1650000,
  },
  {
    label: 'Orange Côte d’Ivoire — Télécoms & Fibre optique dédiée',
    category: 'Télécommunications',
    journal: 'AC',
    debit: { code: '628100', label: 'Télécommunications & Internet' },
    credit: { code: '401100', label: 'Fournisseurs locaux' },
    defaultAmount: 480000,
  },
  {
    label: 'Compagnie Distr. Ouest (CDO) — Vente produits alimentaires',
    category: 'Chiffre d’Affaires',
    journal: 'VT',
    debit: { code: '411002', label: 'Compagnie Distr. Ouest' },
    credit: { code: '701100', label: 'Ventes de marchandises' },
    defaultAmount: 7200000,
  },
  {
    label: 'Échéance trimestrielle BOAD — Remboursement principal emprunt',
    category: 'Dette & Emprunts',
    journal: 'BQ',
    debit: { code: '162000', label: 'Emprunts établ. de crédit' },
    credit: { code: '521100', label: 'Ecobank compte courant' },
    defaultAmount: 1875000,
  },
  {
    label: 'Intérêts financiers emprunt bancaire — Prélèvement trimestriel',
    category: 'Charges Financières',
    journal: 'BQ',
    debit: { code: '671200', label: 'Intérêts emprunts bancaires' },
    credit: { code: '521100', label: 'Ecobank compte courant' },
    defaultAmount: 487500,
  },
  {
    label: 'Virement des salaires du personnel — Paie mensuelle nette',
    category: 'Rémunérations',
    journal: 'BQ',
    debit: { code: '661100', label: 'Rémunération du personnel' },
    credit: { code: '521100', label: 'Ecobank compte courant' },
    defaultAmount: 5600000,
  },
  {
    label: 'Paiement cotisations CNPS — Charges sociales du mois',
    category: 'Organismes Sociaux',
    journal: 'BQ',
    debit: { code: '431100', label: 'Sécurité sociale CNPS' },
    credit: { code: '521100', label: 'Ecobank compte courant' },
    defaultAmount: 1420000,
  },
  {
    label: 'DGI — Acompte d’Impôt sur les Sociétés (BIC)',
    category: 'Fiscalité SYSCOHADA',
    journal: 'BQ',
    debit: { code: '444100', label: 'État, impôts et taxes' },
    credit: { code: '521100', label: 'Ecobank compte courant' },
    defaultAmount: 2100000,
  },
  {
    label: 'Honoraires Cabinet d’Expertise Comptable ONECCA',
    category: 'Services Extérieurs',
    journal: 'AC',
    debit: { code: '632400', label: 'Honoraires juridiques & comptables' },
    credit: { code: '401100', label: 'Fournisseurs locaux' },
    defaultAmount: 950000,
  },
  {
    label: 'Frais de tenue de compte & commissions bancaires Ecobank',
    category: 'Services Bancaires',
    journal: 'BQ',
    debit: { code: '631100', label: 'Frais bancaires & commissions' },
    credit: { code: '521100', label: 'Ecobank compte courant' },
    defaultAmount: 115000,
  },
  {
    label: 'Alimentation de la caisse par retrait bancaire Ecobank',
    category: 'Trésorerie & Caisse',
    journal: 'CA',
    debit: { code: '571100', label: 'Caisse centrale' },
    credit: { code: '521100', label: 'Ecobank compte courant' },
    defaultAmount: 500000,
  },
];

@Component({
  selector: 'app-entry-dialog',
  standalone: true,
  imports: [FormsModule, DecimalPipe, LucideIconComponent, AmountInputComponent],
  templateUrl: './entry-dialog.component.html',
})
export class EntryDialogComponent {
  private readonly fin = inject(FinanceService);
  private readonly toast = inject(ToastService);
  private readonly elementRef = inject(ElementRef);

  private readonly dialogRef = viewChild.required<ElementRef<HTMLDialogElement>>('dialogRef');
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly entrySubmitted = output<void>();

  // Form Fields
  readonly newEntryLabel = signal('');
  readonly newEntryAmount = signal<number | null>(null);
  readonly newEntryDate = signal(new Date().toISOString().substring(0, 10));

  // Autocomplete UI state
  readonly autocompleteOpen = signal(false);

  // File Attachment & Drag-and-drop state
  readonly isDragging = signal(false);
  readonly attachedFile = signal<{ name: string; size: string; type: string } | null>(null);
  readonly isAnalyzingFile = signal(false);
  readonly processingStep = signal<string>('');
  readonly processingProgress = signal<number>(0);
  readonly extractedFromInvoice = signal(false);
  readonly extractedInvoiceData = signal<{
    vendor: string;
    invoiceRef: string;
    detectedDate: string;
    detectedAmount: number;
    description: string;
  } | null>(null);

  private analysisTimeouts: ReturnType<typeof setTimeout>[] = [];

  /**
   * Filtered suggestions list based on user's query in newEntryLabel
   */
  readonly filteredSuggestions = computed(() => {
    const query = this.newEntryLabel().trim().toLowerCase();
    if (!query) {
      return PRESET_SUGGESTIONS.slice(0, 6);
    }
    return PRESET_SUGGESTIONS.filter((s) =>
      s.label.toLowerCase().includes(query) || s.category.toLowerCase().includes(query)
    ).slice(0, 7);
  });

  /**
   * Intelligent Automatic Detection of SYSCOHADA Accounts & Journal
   * based on the input label and/or attached physical invoice
   */
  readonly detectedAccountInfo = computed(() => {
    const raw = this.newEntryLabel().trim().toLowerCase();
    const fileName = this.attachedFile()?.name.toLowerCase() ?? '';
    const text = `${raw} ${fileName}`;

    if (!text.trim()) {
      return {
        journal: 'AC' as JournalCode,
        journalLabel: 'Achats (AC)',
        debit: { code: '601100', label: 'Achats de marchandises' },
        credit: { code: '401100', label: 'Fournisseurs locaux' },
        confidence: 90,
        explanation: 'En attente de libellé ou facture pour affiner l’imputation.',
      };
    }

    // 1. Direct suggestion exact match
    const directMatch = PRESET_SUGGESTIONS.find((s) => s.label.toLowerCase() === raw);
    if (directMatch) {
      return {
        journal: directMatch.journal,
        journalLabel: this.getJournalLabel(directMatch.journal),
        debit: directMatch.debit,
        credit: directMatch.credit,
        confidence: 99,
        explanation: `Modèle identifié : ${directMatch.category}`,
      };
    }

    // 2. Ventes / Facturation client
    if (
      text.includes('vente') ||
      text.includes('client') ||
      text.includes('chiffre d') ||
      text.includes('prestation') ||
      text.includes('facture client') ||
      text.includes('cdo')
    ) {
      return {
        journal: 'VT' as JournalCode,
        journalLabel: 'Ventes (VT)',
        debit: { code: '411100', label: 'Clients ordinaires' },
        credit: { code: '701100', label: 'Ventes de marchandises' },
        confidence: 97,
        explanation: 'Reconnaissance flux commercial : Créance client (411) / Vente HT (701)',
      };
    }

    // 3. Électricité / Eau / Énergie
    if (text.includes('cie') || text.includes('électricité') || text.includes('energie') || text.includes('courant')) {
      return {
        journal: 'AC' as JournalCode,
        journalLabel: 'Achats (AC)',
        debit: { code: '605100', label: 'Électricité & Énergie' },
        credit: { code: '401100', label: 'Fournisseurs locaux' },
        confidence: 98,
        explanation: 'Charge d’exploitation SYSCOHADA : Fournitures non stockables Énergie',
      };
    }
    if (text.includes('sodeci') && (text.includes('eau') || text.includes('fluide'))) {
      return {
        journal: 'AC' as JournalCode,
        journalLabel: 'Achats (AC)',
        debit: { code: '605200', label: 'Eau & fluides' },
        credit: { code: '401100', label: 'Fournisseurs locaux' },
        confidence: 98,
        explanation: 'Charge d’exploitation SYSCOHADA : Eau & fluides industriels',
      };
    }

    // 4. Carburant / Transport / Total
    if (text.includes('total') || text.includes('carburant') || text.includes('essence') || text.includes('gasoil')) {
      return {
        journal: 'AC' as JournalCode,
        journalLabel: 'Achats (AC)',
        debit: { code: '605300', label: 'Carburants & lubrifiants' },
        credit: { code: '401100', label: 'Fournisseurs locaux' },
        confidence: 98,
        explanation: 'Charge d’exploitation SYSCOHADA : Carburants flotte & transport',
      };
    }

    // 5. Télécoms / Orange / MTN / Moov / Internet
    if (
      text.includes('orange') ||
      text.includes('mtn') ||
      text.includes('moov') ||
      text.includes('télécom') ||
      text.includes('internet') ||
      text.includes('fibre')
    ) {
      return {
        journal: 'AC' as JournalCode,
        journalLabel: 'Achats (AC)',
        debit: { code: '628100', label: 'Frais de télécommunications' },
        credit: { code: '401100', label: 'Fournisseurs locaux' },
        confidence: 98,
        explanation: 'Services extérieurs SYSCOHADA : Télécoms & abonnements',
      };
    }

    // 6. Rémunérations / Salaires / Personnel
    if (text.includes('salaire') || text.includes('paie') || text.includes('personnel') || text.includes('prime')) {
      return {
        journal: 'BQ' as JournalCode,
        journalLabel: 'Banque (BQ)',
        debit: { code: '661100', label: 'Rémunération du personnel' },
        credit: { code: '521100', label: 'Ecobank compte courant' },
        confidence: 96,
        explanation: 'Flux de trésorerie décaissé : Salaires nets virés',
      };
    }

    // 7. CNPS / Charges sociales
    if (text.includes('cnps') || text.includes('social') || text.includes('cotisation')) {
      return {
        journal: 'BQ' as JournalCode,
        journalLabel: 'Banque (BQ)',
        debit: { code: '431100', label: 'Sécurité sociale CNPS' },
        credit: { code: '521100', label: 'Ecobank compte courant' },
        confidence: 97,
        explanation: 'Paiement organisme social : Règlement dettes sociales',
      };
    }

    // 8. Fiscalité / Impôts / DGI / TVA / BIC
    if (text.includes('dgi') || text.includes('impot') || text.includes('impôt') || text.includes('tva') || text.includes('bic')) {
      return {
        journal: 'BQ' as JournalCode,
        journalLabel: 'Banque (BQ)',
        debit: { code: '444100', label: 'État, impôts sur les bénéfices' },
        credit: { code: '521100', label: 'Ecobank compte courant' },
        confidence: 96,
        explanation: 'Paiement fiscal au Trésor Public : Décaissement DGI',
      };
    }

    // 9. Emprunt / Financement / BOAD / Banque
    if (
      text.includes('boad') ||
      text.includes('emprunt') ||
      text.includes('remboursement') ||
      text.includes('échéance') ||
      text.includes('credit') ||
      text.includes('prêt')
    ) {
      return {
        journal: 'BQ' as JournalCode,
        journalLabel: 'Banque (BQ)',
        debit: { code: '162000', label: 'Emprunts établ. de crédit' },
        credit: { code: '521100', label: 'Ecobank compte courant' },
        confidence: 97,
        explanation: 'Service de la dette : Remboursement principal d’emprunt',
      };
    }

    // 10. Frais bancaires / Agios
    if (text.includes('frais bancaire') || text.includes('commission') || text.includes('agios') || text.includes('tenue de compte')) {
      return {
        journal: 'BQ' as JournalCode,
        journalLabel: 'Banque (BQ)',
        debit: { code: '631100', label: 'Frais bancaires' },
        credit: { code: '521100', label: 'Ecobank compte courant' },
        confidence: 98,
        explanation: 'Services financiers bancaires débités',
      };
    }

    // 11. Caisse / Espèces
    if (text.includes('caisse') || text.includes('espece') || text.includes('espèces') || text.includes('retrait')) {
      return {
        journal: 'CA' as JournalCode,
        journalLabel: 'Caisse (CA)',
        debit: { code: '571100', label: 'Caisse centrale' },
        credit: { code: '521100', label: 'Ecobank compte courant' },
        confidence: 95,
        explanation: 'Alimentation de trésorerie liquide par retrait bancaire',
      };
    }

    // 12. Fournisseurs / Achats divers par défaut
    return {
      journal: 'AC' as JournalCode,
      journalLabel: 'Achats (AC)',
      debit: { code: '601100', label: 'Achats & charges d’exploitation' },
      credit: { code: '401100', label: 'Fournisseurs locaux' },
      confidence: 92,
      explanation: 'Détection standard : Achat d’exploitation contre tiers fournisseur',
    };
  });

  open(): void {
    this.dialogRef().nativeElement.showModal();
    this.autocompleteOpen.set(false);
  }

  close(): void {
    this.dialogRef().nativeElement.close();
    this.autocompleteOpen.set(false);
    this.resetForm();
  }

  onBackdropClick(event: MouseEvent): void {
    const dialog = this.dialogRef().nativeElement;
    // Only handle click when the direct target is the <dialog> element itself (the backdrop)
    if (event.target !== dialog) {
      return;
    }

    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      this.close();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const autocompleteArea = this.elementRef.nativeElement.querySelector('#autocomplete-container');
    if (autocompleteArea && !autocompleteArea.contains(target)) {
      this.autocompleteOpen.set(false);
    }
  }

  onLabelInput(value: string): void {
    this.newEntryLabel.set(value);
    this.autocompleteOpen.set(true);
  }

  selectSuggestion(item: OperationSuggestion): void {
    this.newEntryLabel.set(item.label);
    if ((!this.newEntryAmount() || this.newEntryAmount() === 0) && item.defaultAmount) {
      this.newEntryAmount.set(item.defaultAmount);
    }
    this.autocompleteOpen.set(false);
  }

  triggerFilePicker(event?: Event): void {
    event?.stopPropagation();
    event?.preventDefault();
    this.fileInput()?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.processUploadedFile(file);
    }
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.processUploadedFile(file);
    }
  }

  removeAttachedFile(event: Event): void {
    event.stopPropagation();
    this.clearAnalysisTimeouts();
    this.attachedFile.set(null);
    this.isAnalyzingFile.set(false);
    this.extractedFromInvoice.set(false);
    this.extractedInvoiceData.set(null);
    this.processingStep.set('');
    this.processingProgress.set(0);
  }

  private clearAnalysisTimeouts(): void {
    for (const t of this.analysisTimeouts) {
      clearTimeout(t);
    }
    this.analysisTimeouts = [];
  }

  private processUploadedFile(file: File): void {
    this.clearAnalysisTimeouts();

    const sizeInKb = Math.round(file.size / 1024);
    const sizeLabel = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} Mo` : `${sizeInKb} Ko`;

    this.isAnalyzingFile.set(true);
    this.extractedFromInvoice.set(false);
    this.extractedInvoiceData.set(null);
    this.processingProgress.set(20);
    this.processingStep.set('1/3 · Téléversement & numérisation haute définition...');

    this.attachedFile.set({
      name: file.name,
      size: sizeLabel,
      type: file.type || 'application/pdf',
    });

    const lower = file.name.toLowerCase();
    let label = '';
    let amount = 0;
    let invoiceRef = '';
    let vendor = '';
    let detectedDate = new Date().toISOString().substring(0, 10);

    if (lower.includes('cie')) {
      vendor = 'CIE Côte d’Ivoire';
      invoiceRef = 'FC-2026-90412';
      label = 'Facture CIE n° FC-2026-90412 — Consommation électricité & énergie';
      amount = 840000;
      detectedDate = '2026-10-22';
    } else if (lower.includes('sodeci')) {
      vendor = 'SODECI';
      invoiceRef = 'EA-2026-4401';
      label = 'Facture SODECI n° EA-2026-4401 — Eau & consommations fluides';
      amount = 320000;
      detectedDate = '2026-10-20';
    } else if (lower.includes('total') || lower.includes('carburant')) {
      vendor = 'TOTAL Énergies CI';
      invoiceRef = 'TE-2026-88231';
      label = 'TOTAL ÉNERGIES n° TE-2026-88231 — Carburant flotte logistique';
      amount = 1650000;
      detectedDate = '2026-10-23';
    } else if (lower.includes('orange') || lower.includes('telecom') || lower.includes('mtn') || lower.includes('moov')) {
      vendor = 'Orange Côte d’Ivoire';
      invoiceRef = 'OCI-2026-0812';
      label = 'Orange Côte d’Ivoire n° OCI-2026-0812 — Fibre optique & télécoms';
      amount = 480000;
      detectedDate = '2026-10-21';
    } else if (lower.includes('ivoirepack') || lower.includes('emballage')) {
      vendor = 'IvoirePack SARL';
      invoiceRef = 'IVP-2026-0045';
      label = 'IvoirePack SARL n° IVP-2026-0045 — Facture d’achat emballages';
      amount = 2450000;
      detectedDate = '2026-10-18';
    } else {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').trim();
      vendor = cleanName || 'Fournisseur Tiers';
      invoiceRef = `FAC-${Math.floor(10000 + Math.random() * 90000)}`;
      label = `Facture ${vendor} n° ${invoiceRef} — Prestation & fournitures`;
      amount = 1250000;
      detectedDate = new Date().toISOString().substring(0, 10);
    }

    // Step 2: OCR scanning
    const t1 = setTimeout(() => {
      this.processingProgress.set(60);
      this.processingStep.set('2/3 · Reconnaissance optique de caractères (OCR IA)...');
    }, 380);

    // Step 3: Semantic analysis & financial entities detection
    const t2 = setTimeout(() => {
      this.processingProgress.set(90);
      this.processingStep.set('3/3 · Analyse sémantique & extraction du montant TTC...');
    }, 780);

    // Step 4: Final API result & auto-filling fields
    const t3 = setTimeout(() => {
      this.processingProgress.set(100);
      this.isAnalyzingFile.set(false);

      // Pre-fill fields automatically from invoice extraction
      this.newEntryLabel.set(label);
      this.newEntryAmount.set(amount);
      this.newEntryDate.set(detectedDate);

      this.extractedInvoiceData.set({
        vendor,
        invoiceRef,
        detectedDate,
        detectedAmount: amount,
        description: label,
      });
      this.extractedFromInvoice.set(true);

      this.toast.show(
        `Facture « ${file.name} » analysée : libellé, montant et date pré-remplis automatiquement.`,
        'success',
        'file-check'
      );
    }, 1200);

    this.analysisTimeouts.push(t1, t2, t3);
  }

  submit(): void {
    const label = this.newEntryLabel().trim();
    const amount = Number(this.newEntryAmount());
    const date = this.newEntryDate();
    const detection = this.detectedAccountInfo();

    if (!label) {
      this.toast.show('Veuillez renseigner le libellé de l’opération.', 'error', 'alert-triangle');
      return;
    }

    if (!amount || amount <= 0) {
      this.toast.show('Veuillez renseigner un montant strictement positif (FCFA).', 'error', 'alert-triangle');
      return;
    }

    const success = this.fin.addManualEntry({
      journal: detection.journal,
      date,
      debitAccount: detection.debit.code,
      creditAccount: detection.credit.code,
      amount,
      label,
    });

    if (success) {
      this.close();
      this.toast.show(
        `Écriture comptabilisée avec succès (Journal ${detection.journal} • ${detection.debit.code} / ${detection.credit.code}) !`,
        'success',
        'list-checks'
      );
      this.entrySubmitted.emit();
    } else {
      this.toast.show(
        'Erreur lors de la validation de l’écriture comptable.',
        'error',
        'alert-triangle'
      );
    }
  }

  private resetForm(): void {
    this.clearAnalysisTimeouts();
    this.newEntryLabel.set('');
    this.newEntryAmount.set(null);
    this.newEntryDate.set(new Date().toISOString().substring(0, 10));
    this.attachedFile.set(null);
    this.isDragging.set(false);
    this.isAnalyzingFile.set(false);
    this.extractedFromInvoice.set(false);
    this.extractedInvoiceData.set(null);
    this.processingStep.set('');
    this.processingProgress.set(0);
  }

  private getJournalLabel(journal: JournalCode): string {
    switch (journal) {
      case 'AC':
        return 'Achats (AC)';
      case 'VT':
        return 'Ventes (VT)';
      case 'BQ':
        return 'Banque (BQ)';
      case 'CA':
        return 'Caisse (CA)';
      case 'OD':
        return 'Opérations Diverses (OD)';
    }
  }
}
