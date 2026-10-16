/**
 * Raw mock dataset for the active entity.
 *
 * Every amount is in FCFA (XOF). Only *source* figures live here — all ratios,
 * subtotals and indicators are derived in `FinanceService` so the screens can
 * never contradict each other.
 */

export interface Entity {
  name: string;
  shortName: string;
  country: string;
  framework: string;
  closedYear: number;
  openYear: number;
  openPeriodLabel: string; // e.g. "M10 - Octobre"
  openPeriodShort: string; // e.g. "M10"
  currency: string;
}

/** Balance sheet line with gross / depreciation (actif) or net only (passif). */
export interface AssetLine {
  label: string;
  detail: string;
  gross: number;
  depreciation: number;
}

export interface LiabilityLine {
  label: string;
  detail: string;
  amount: number;
  highlight?: boolean;
}

export interface BalanceSheet {
  fixedAssets: { intangible: AssetLine; tangible: AssetLine; financial: AssetLine };
  currentAssets: { inventories: AssetLine; receivables: AssetLine; tradeReceivablesNet: number };
  cashAssets: { banks: AssetLine; cashOnHand: AssetLine };
  equity: { capital: LiabilityLine; reserves: LiabilityLine; netIncome: LiabilityLine; retainedReserves: number };
  provisions: LiabilityLine;
  financialDebt: LiabilityLine;
  currentLiabilities: { suppliers: LiabilityLine; taxSocialOther: LiabilityLine; tradePayables: number };
  cashLiabilities: LiabilityLine;
}

/** Income statement source items (charges are negative). */
export interface IncomeStatement {
  sales: number; // 701
  purchases: number; // 601 + 6031 variation de stocks
  externalServices: number; // 61-63
  taxes: number; // 64
  personnel: number; // 66
  depreciation: number; // 681 dotations
  financialResult: number; // 67/77
  incomeTaxRate: number;
}

export interface DebtService {
  annualPrincipal: number;
  annualInterest: number;
  variableRateShare: number; // share of financial debt indexed on BCEAO rates
}

export interface CreditModel {
  score: number;
  scoreDeltaVsPrior: number;
  probabilityOfDefault: number; // %
  sectorPd: number; // %
  modelVersion: string;
  r2: number;
  mape: number;
  lastRun: string;
  preNegotiatedRate: number; // annual, decimal
  maxLeverage: number; // dette nette / CAF ceiling (years)
  minDscr: number;
  referenceTenorMonths: number;
  dimensions: RiskDimensionScore[];
}

export type RiskDimensionKey = 'liquidity' | 'solvency' | 'dscr' | 'collection' | 'margin';

export interface RiskDimensionScore {
  key: RiskDimensionKey;
  score: number; // 0-100
}

export type BankStatus = 'Accord' | 'En revue' | 'Refus';

export interface PartnerBank {
  code: string;
  name: string;
  offer: string;
  amount: number;
  status: BankStatus;
  tone: 'navy' | 'blue' | 'slate';
}

export interface AgingBucket {
  label: string;
  amount: number;
  tone: 'ok' | 'watch' | 'late' | 'critical';
}

export type JournalCode = 'BQ' | 'VT' | 'AC' | 'CA' | 'OD';

export type EntryStatus =
  | 'Rapproché'
  | 'Lettré'
  | 'Comptabilisé'
  | 'À payer'
  | 'À échoir'
  | 'Validé';

export interface JournalLine {
  date: string; // ISO
  entry: string;
  journal: JournalCode;
  account: string;
  accountLabel: string;
  label: string;
  reference: string;
  debit: number;
  credit: number;
  status: EntryStatus;
  attachment: { icon: string; title: string };
  counterpart?: boolean;
}

export interface BankAccount {
  account: string;
  bank: string;
  label: string;
  statementBalance: number;
  statementDate: string;
  outstandingCheques: number;
  depositsInTransit: number;
}

export interface PendingFlow {
  id: string;
  date: string;
  amount: number; // signed, + = inflow
  label: string;
  bankRef: string;
  document: string;
  tag: string;
  confidence?: number;
  bankAccount: string;
  debitAccount: { code: string; label: string };
  creditAccount: { code: string; label: string };
  journal: JournalCode;
  actionLabel: string;
}

export interface MonthlyBookkeepingStats {
  entriesByJournal: Record<JournalCode, number>;
  attachmentRate: number; // %
  autoMatched: number;
  scoreImpact: number;
  lastBankSync: string;
}

export interface ClosingControl {
  title: string;
  label: string;
  detail: string;
  icon: string;
}

export const ENTITY: Entity = {
  name: 'West Distribution SA',
  shortName: 'WDSA',
  country: "Côte d'Ivoire",
  framework: 'SYSCOHADA Révisé',
  closedYear: 2025,
  openYear: 2026,
  openPeriodLabel: 'M10 - Octobre',
  openPeriodShort: 'M10',
  currency: 'FCFA',
};

export const BALANCE_SHEET: BalanceSheet = {
  fixedAssets: {
    intangible: {
      label: 'Immobilisations incorporelles',
      detail: 'Logiciels, brevets, fonds commercial',
      gross: 41_700_000,
      depreciation: 10_600_000,
    },
    tangible: {
      label: 'Immobilisations corporelles',
      detail: 'Entrepôts, matériel logistique, flotte',
      gross: 320_550_000,
      depreciation: 110_700_000,
    },
    financial: {
      label: 'Immobilisations financières',
      detail: 'Titres de participation (28M), prêts (12M), dépôts (3,5M)',
      gross: 43_500_000,
      depreciation: 0,
    },
  },
  currentAssets: {
    inventories: {
      label: "Stocks & en-cours",
      detail: 'Marchandises (18,5M), matières (24M), produits finis (15,6M), en-cours (8M)',
      gross: 66_100_000,
      depreciation: 1_200_000,
    },
    receivables: {
      label: 'Créances & emplois assimilés',
      detail: 'Clients (48M brut), fournisseurs débiteurs (3M)',
      gross: 51_000_000,
      depreciation: 2_500_000,
    },
    tradeReceivablesNet: 45_500_000,
  },
  cashAssets: {
    banks: {
      label: 'Banques & établissements financiers',
      detail: 'Ecobank CI, Société Générale CI, BOA Côte d’Ivoire',
      gross: 42_000_000,
      depreciation: 0,
    },
    cashOnHand: {
      label: "Caisse & valeurs à l'encaissement",
      detail: 'Espèces (3,8M) • effets à l’encaissement (1,5M)',
      gross: 5_300_000,
      depreciation: 0,
    },
  },
  equity: {
    capital: {
      label: 'Capital social',
      detail: '15 000 actions de valeur nominale 10 000 FCFA',
      amount: 150_000_000,
    },
    reserves: {
      label: 'Réserves & report à nouveau',
      detail: 'Légale (15M), statutaires (12M), libres (80M), report (16,5M)',
      amount: 123_499_000,
    },
    netIncome: {
      label: "Résultat net de l'exercice",
      detail: 'Bénéfice certifié, proposé en réserves et dividendes',
      amount: 18_651_000,
      highlight: true,
    },
    retainedReserves: 13_851_000, // part du résultat mise en réserve (dividende 4,8M)
  },
  provisions: {
    label: 'Provisions pour risques & charges',
    detail: 'Litiges commerciaux et garanties données',
    amount: 7_500_000,
  },
  financialDebt: {
    label: 'Dettes financières MT/LT',
    detail: 'BOAD (30M), Ecobank (10M), crédit-bail (12,5M), avances associés (7,5M)',
    amount: 60_000_000,
  },
  currentLiabilities: {
    suppliers: {
      label: 'Fournisseurs & comptes rattachés',
      detail: 'Exploitation (38M) • fournisseurs d’immobilisations (4,2M)',
      amount: 42_200_000,
    },
    taxSocialOther: {
      label: 'Dettes fiscales, sociales & autres',
      detail: 'Personnel (9,4M), CNPS & impôts (14,5M), associés (6M), divers (6,1M)',
      amount: 36_000_000,
    },
    tradePayables: 38_000_000,
  },
  cashLiabilities: {
    label: 'Crédits de trésorerie & découverts',
    detail: 'Facilités de caisse autorisées par le pool bancaire',
    amount: 7_300_000,
  },
};

/** Closed year (N) and prior year (N-1). */
export const INCOME_STATEMENT: { current: IncomeStatement; prior: IncomeStatement } = {
  current: {
    sales: 335_000_000,
    purchases: -201_000_000,
    externalServices: -28_400_000,
    taxes: -4_100_000,
    personnel: -55_982_000,
    depreciation: -16_750_000,
    financialResult: -3_900_000,
    incomeTaxRate: 0.25,
  },
  prior: {
    sales: 293_350_000,
    purchases: -179_450_000,
    externalServices: -25_600_000,
    taxes: -3_800_000,
    personnel: -51_400_000,
    depreciation: -15_900_000,
    financialResult: -4_300_000,
    incomeTaxRate: 0.25,
  },
};

/** Open period month (M10) vs same month prior year. */
export const MONTHLY_INCOME_STATEMENT: { current: IncomeStatement; prior: IncomeStatement } = {
  current: {
    sales: 31_200_000,
    purchases: -18_700_000,
    externalServices: -2_500_000,
    taxes: -350_000,
    personnel: -4_800_000,
    depreciation: -1_450_000,
    financialResult: -330_000,
    incomeTaxRate: 0.25,
  },
  prior: {
    sales: 27_000_000,
    purchases: -16_400_000,
    externalServices: -2_300_000,
    taxes: -320_000,
    personnel: -4_500_000,
    depreciation: -1_380_000,
    financialResult: -360_000,
    incomeTaxRate: 0.25,
  },
};

export const SALES_BUDGET = 320_000_000;
export const SECTOR_OPERATING_MARGIN = 7.0; // %, distribution UEMOA

export const DEBT_SERVICE: DebtService = {
  annualPrincipal: 12_000_000,
  annualInterest: 3_900_000,
  variableRateShare: 0.6,
};

export const CREDIT_MODEL: CreditModel = {
  score: 820,
  scoreDeltaVsPrior: 25,
  probabilityOfDefault: 1.8,
  sectorPd: 7.4,
  modelVersion: 'v3.4',
  r2: 0.921,
  mape: 3.8,
  lastRun: "Aujourd'hui, 08:30 GMT",
  preNegotiatedRate: 0.0675,
  maxLeverage: 3.5,
  minDscr: 1.3,
  referenceTenorMonths: 84,
  dimensions: [
    { key: 'liquidity', score: 95 },
    { key: 'solvency', score: 92 },
    { key: 'dscr', score: 90 },
    { key: 'collection', score: 82 },
    { key: 'margin', score: 78 },
  ],
};

export const PARTNER_BANKS: PartnerBank[] = [
  { code: 'B', name: 'BOAD', offer: 'Ligne MT', amount: 50_000_000, status: 'Accord', tone: 'navy' },
  { code: 'E', name: 'Ecobank', offer: 'Ligne MT', amount: 80_000_000, status: 'Accord', tone: 'blue' },
  { code: 'S', name: 'SocGen', offer: 'Spot CT', amount: 30_000_000, status: 'En revue', tone: 'slate' },
];

export const RECEIVABLES_AGING: AgingBucket[] = [
  { label: '< 30j', amount: 26_000_000, tone: 'ok' },
  { label: '30-60j', amount: 9_400_000, tone: 'watch' },
  { label: '60-90j', amount: 3_900_000, tone: 'late' },
  { label: '> 90j', amount: 1_900_000, tone: 'critical' },
];

export const PAYABLES_AGING: AgingBucket[] = [
  { label: 'Échéance normale', amount: 22_800_000, tone: 'ok' },
  { label: 'Échéance < 15j', amount: 6_100_000, tone: 'watch' },
  { label: 'Échues en retard', amount: 1_500_000, tone: 'critical' },
];

export const BOOKKEEPING_STATS: MonthlyBookkeepingStats = {
  entriesByJournal: { BQ: 412, VT: 534, AC: 318, CA: 86, OD: 78 },
  attachmentRate: 99.2,
  autoMatched: 1351,
  scoreImpact: 15,
  lastBankSync: "Aujourd'hui, 08:32",
};

export const JOURNAL_LABELS: Record<JournalCode, string> = {
  BQ: 'Banque',
  VT: 'Ventes',
  AC: 'Achats',
  CA: 'Caisse',
  OD: 'Opér. diverses',
};

export const JOURNAL_LINES: JournalLine[] = [
  // EC-8941 — encaissement client SODECI
  {
    date: '2026-10-28', entry: 'EC-8941', journal: 'BQ', account: '521100', accountLabel: 'Ecobank compte courant',
    label: 'Règlement client SODECI', reference: 'VIR-ECOB-90218', debit: 3_850_000, credit: 0, status: 'Rapproché',
    attachment: { icon: 'clipboard-check', title: 'Bordereau de virement (OCR certifié)' },
  },
  {
    date: '2026-10-28', entry: 'EC-8941', journal: 'BQ', account: '411001', accountLabel: 'SODECI Distr. Abidjan',
    label: 'Lettrage FAC-2026-118', reference: 'Lettrage auto [L-71]', debit: 0, credit: 3_850_000, status: 'Lettré',
    attachment: { icon: 'receipt', title: 'Facture de vente liée' }, counterpart: true,
  },
  // EC-8940 — achat matières IvoirePack (TVA 18 % récupérable)
  {
    date: '2026-10-27', entry: 'EC-8940', journal: 'AC', account: '602100', accountLabel: 'Achats matières & fournitures',
    label: 'Fournisseur IvoirePack SARL', reference: 'FAC-IVP-9044', debit: 2_450_000, credit: 0, status: 'Comptabilisé',
    attachment: { icon: 'paperclip', title: "Facture d'achat validée" },
  },
  {
    date: '2026-10-27', entry: 'EC-8940', journal: 'AC', account: '445200', accountLabel: 'TVA récupérable sur achats',
    label: 'TVA 18 % déductible', reference: 'FAC-IVP-9044', debit: 441_000, credit: 0, status: 'Comptabilisé',
    attachment: { icon: 'paperclip', title: "Facture d'achat validée" }, counterpart: true,
  },
  {
    date: '2026-10-27', entry: 'EC-8940', journal: 'AC', account: '401100', accountLabel: 'Fournisseurs locaux',
    label: 'Échéance : 26/11/2026', reference: 'BR-26-811', debit: 0, credit: 2_891_000, status: 'À payer',
    attachment: { icon: 'badge-check', title: 'Bon de réception contrôlé' }, counterpart: true,
  },
  // EC-8939 — échéance trimestrielle BOAD
  {
    date: '2026-10-26', entry: 'EC-8939', journal: 'BQ', account: '162000', accountLabel: 'Emprunts établ. de crédit',
    label: 'Échéance BOAD — principal T4', reference: 'AVIS-DEBIT-5510', debit: 1_875_000, credit: 0, status: 'Rapproché',
    attachment: { icon: 'clipboard-check', title: "Avis d'opéré bancaire validé" },
  },
  {
    date: '2026-10-26', entry: 'EC-8939', journal: 'BQ', account: '671200', accountLabel: 'Intérêts emprunts BOAD',
    label: 'Intérêts T4 (6,5 % l’an)', reference: 'EMP-2022-9', debit: 487_500, credit: 0, status: 'Rapproché',
    attachment: { icon: 'clipboard-check', title: 'Échéancier contractuel' }, counterpart: true,
  },
  {
    date: '2026-10-26', entry: 'EC-8939', journal: 'BQ', account: '521100', accountLabel: 'Ecobank compte courant',
    label: 'Prélèvement total BOAD', reference: 'PR-BOAD-2026', debit: 0, credit: 2_362_500, status: 'Rapproché',
    attachment: { icon: 'landmark', title: 'Extrait bancaire rapproché' }, counterpart: true,
  },
  // EC-8938 — vente CDO (TVA 18 % collectée)
  {
    date: '2026-10-25', entry: 'EC-8938', journal: 'VT', account: '411002', accountLabel: 'Compagnie Distr. Ouest',
    label: 'Vente produits alimentaires', reference: 'FAC-2026-119', debit: 8_496_000, credit: 0, status: 'À échoir',
    attachment: { icon: 'badge-check', title: 'Facture normalisée DGI' },
  },
  {
    date: '2026-10-25', entry: 'EC-8938', journal: 'VT', account: '701100', accountLabel: 'Ventes de marchandises',
    label: "Chiffre d'affaires HT", reference: 'FAC-2026-119', debit: 0, credit: 7_200_000, status: 'Validé',
    attachment: { icon: 'truck', title: "Bordereau d'expédition" }, counterpart: true,
  },
  {
    date: '2026-10-25', entry: 'EC-8938', journal: 'VT', account: '443100', accountLabel: 'TVA facturée sur ventes',
    label: 'TVA 18 % collectée', reference: 'FAC-2026-119', debit: 0, credit: 1_296_000, status: 'Validé',
    attachment: { icon: 'receipt', title: 'Facture normalisée DGI' }, counterpart: true,
  },
  // EC-8937 — caisse
  {
    date: '2026-10-24', entry: 'EC-8937', journal: 'CA', account: '605200', accountLabel: 'Fournitures non stockables',
    label: 'Carburant flotte livraison', reference: 'TK-CA-2210', debit: 185_000, credit: 0, status: 'Comptabilisé',
    attachment: { icon: 'receipt', title: 'Ticket station' },
  },
  {
    date: '2026-10-24', entry: 'EC-8937', journal: 'CA', account: '571000', accountLabel: 'Caisse siège',
    label: 'Sortie de caisse', reference: 'BC-0418', debit: 0, credit: 185_000, status: 'Rapproché',
    attachment: { icon: 'clipboard-check', title: 'Brouillard de caisse' }, counterpart: true,
  },
  // EC-8936 — OD dotation mensuelle
  {
    date: '2026-10-23', entry: 'EC-8936', journal: 'OD', account: '681300', accountLabel: 'Dotations amort. corporelles',
    label: 'Dotation mensuelle M10', reference: 'TAB-AMORT-26', debit: 1_450_000, credit: 0, status: 'Validé',
    attachment: { icon: 'table', title: "Tableau d'amortissement" },
  },
  {
    date: '2026-10-23', entry: 'EC-8936', journal: 'OD', account: '284000', accountLabel: 'Amort. matériel',
    label: 'Amortissements cumulés', reference: 'TAB-AMORT-26', debit: 0, credit: 1_450_000, status: 'Validé',
    attachment: { icon: 'table', title: "Tableau d'amortissement" }, counterpart: true,
  },
];

export const BANK_ACCOUNTS: BankAccount[] = [
  {
    account: '521100', bank: 'Ecobank CI', label: 'Compte courant principal',
    statementBalance: 26_750_000, statementDate: '2026-10-28', outstandingCheques: 1_500_000, depositsInTransit: 250_000,
  },
  {
    account: '521200', bank: 'Société Générale CI', label: "Compte d'exploitation",
    statementBalance: 11_640_000, statementDate: '2026-10-28', outstandingCheques: 820_000, depositsInTransit: 380_000,
  },
  {
    account: '521300', bank: "BOA Côte d'Ivoire", label: "Compte d'investissement",
    statementBalance: 5_300_000, statementDate: '2026-10-27', outstandingCheques: 0, depositsInTransit: 0,
  },
];

export const PENDING_FLOWS: PendingFlow[] = [
  {
    id: 'flow-cdo', date: '2026-10-28', amount: 8_496_000, label: 'Virement reçu : CIE DISTRIB OUEST',
    bankRef: 'VIR-BACI-904128', document: 'Facture FAC-2026-119', tag: '99,8 % confiance', confidence: 99.8,
    bankAccount: '521100', journal: 'BQ',
    debitAccount: { code: '521100', label: 'Ecobank compte courant' },
    creditAccount: { code: '411002', label: 'Compagnie Distr. Ouest' },
    actionLabel: 'Valider lettrage 411002',
  },
  {
    id: 'flow-cie', date: '2026-10-27', amount: -1_230_000, label: 'Prélèvement CIE — électricité entrepôt',
    bankRef: 'PRLV-CIE-102026', document: 'Facture CIE n° 88412', tag: 'Périodique',
    bankAccount: '521100', journal: 'BQ',
    debitAccount: { code: '605100', label: 'Fournitures eau & électricité' },
    creditAccount: { code: '521100', label: 'Ecobank compte courant' },
    actionLabel: 'Imputer compte 605100',
  },
  {
    id: 'flow-fees', date: '2026-10-25', amount: -45_000, label: 'Commissions & tenue de compte Ecobank',
    bankRef: 'COMM-MENS-ECOB-10', document: 'Relevé de frais M10', tag: 'Frais bancaires',
    bankAccount: '521100', journal: 'BQ',
    debitAccount: { code: '631100', label: 'Frais bancaires' },
    creditAccount: { code: '521100', label: 'Ecobank compte courant' },
    actionLabel: 'Générer écriture 631100',
  },
];

export const CLOSING_CONTROLS: ClosingControl[] = [
  { title: 'Contrôle 1 — Arithmétique', label: 'Équilibre grand livre & balance', detail: 'Débit = Crédit', icon: 'check-circle-2' },
  { title: 'Contrôle 2 — Tiers', label: 'Justification soldes clients & fournisseurs', detail: 'Balance âgée synchrone au 28/10', icon: 'check-circle-2' },
  { title: 'Contrôle 3 — Trésorerie', label: 'Rapprochement caisses & banques', detail: 'Soldes confirmés avec les relevés', icon: 'check-circle-2' },
  { title: 'Contrôle 4 — Certification', label: 'Signature numérique horodatée', detail: 'Prêt pour dossier de crédit', icon: 'badge-check' },
];
