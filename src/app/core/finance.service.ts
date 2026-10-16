import { Injectable, computed, signal } from '@angular/core';
import {
  BALANCE_SHEET,
  BANK_ACCOUNTS,
  BOOKKEEPING_STATS,
  CLOSING_CONTROLS,
  CREDIT_MODEL,
  DEBT_SERVICE,
  ENTITY,
  INCOME_STATEMENT,
  IncomeStatement,
  JOURNAL_LINES,
  JournalLine,
  MONTHLY_INCOME_STATEMENT,
  PARTNER_BANKS,
  PAYABLES_AGING,
  PENDING_FLOWS,
  PendingFlow,
  RECEIVABLES_AGING,
  RiskDimensionKey,
  SALES_BUDGET,
  SECTOR_OPERATING_MARGIN,
  AssetLine,
} from './finance-data';

export const VAT_RATE = 0.18;

export interface IncomeStatementView {
  sales: number;
  purchases: number;
  grossMargin: number;
  externalServices: number;
  taxes: number;
  personnel: number;
  ebitda: number; // EBE
  depreciation: number;
  operatingIncome: number; // REX
  financialResult: number;
  ordinaryIncome: number; // RAO
  incomeTax: number;
  netIncome: number;
}

export interface StressInput {
  salesShockPct: number;
  rateShockBps: number;
  dsoShockDays: number;
}

export interface StressResult {
  score: number;
  scoreDelta: number;
  grade: string;
  residualCash: number;
  liquidityBreakpointPct: number;
  resilience: 'Élevée' | 'Modérée' | 'Faible';
}

export interface LoanSimulation {
  monthlyPayment: number;
  annualPayment: number;
  projectedDscr: number;
  withinCapacity: boolean;
  dscrOk: boolean;
}

export function computeIncomeStatement(src: IncomeStatement): IncomeStatementView {
  const grossMargin = src.sales + src.purchases;
  const ebitda = grossMargin + src.externalServices + src.taxes + src.personnel;
  const operatingIncome = ebitda + src.depreciation;
  const ordinaryIncome = operatingIncome + src.financialResult;
  const incomeTax = ordinaryIncome > 0 ? Math.round(ordinaryIncome * src.incomeTaxRate) : 0;
  return {
    sales: src.sales,
    purchases: src.purchases,
    grossMargin,
    externalServices: src.externalServices,
    taxes: src.taxes,
    personnel: src.personnel,
    ebitda,
    depreciation: src.depreciation,
    operatingIncome,
    financialResult: src.financialResult,
    ordinaryIncome,
    incomeTax,
    netIncome: ordinaryIncome - incomeTax,
  };
}

/** Constant-payment loan instalment. `annualRate` as a decimal. */
export function monthlyInstalment(principal: number, months: number, annualRate: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

export function gradeFor(score: number): string {
  if (score >= 880) return 'A+';
  if (score >= 840) return 'A';
  if (score >= 800) return 'A-';
  if (score >= 750) return 'B+';
  if (score >= 700) return 'B';
  if (score >= 650) return 'B-';
  if (score >= 600) return 'C+';
  return 'C';
}

export function variation(current: number, prior: number): number {
  if (prior === 0) return 0;
  return ((current - prior) / Math.abs(prior)) * 100;
}

const net = (l: AssetLine) => l.gross - l.depreciation;

const DIMENSION_META: Record<RiskDimensionKey, { label: string; short: string; icon: string; verdict: string }> = {
  liquidity: { label: 'Risque de liquidité générale', short: 'Liquidité', icon: 'droplets', verdict: 'Excellent' },
  solvency: { label: 'Structure financière & autonomie', short: 'Solvabilité', icon: 'landmark', verdict: 'Solide' },
  dscr: { label: 'Capacité de remboursement (DSCR)', short: 'DSCR', icon: 'shield-alert', verdict: 'Très élevé' },
  collection: { label: 'Risque de contrepartie (DSO)', short: 'Recouvrement', icon: 'receipt', verdict: 'Maîtrisé' },
  margin: { label: 'Marge opérationnelle (REX / CA)', short: 'Marge expl.', icon: 'bar-chart-3', verdict: 'Robuste' },
};

/**
 * Single source of truth for every figure shown in the app.
 * Raw data comes from `finance-data.ts`; everything else is derived here.
 */
@Injectable({ providedIn: 'root' })
export class FinanceService {
  readonly entity = ENTITY;
  readonly bs = BALANCE_SHEET;
  readonly model = CREDIT_MODEL;
  readonly debtService = DEBT_SERVICE;
  readonly partnerBanks = PARTNER_BANKS;
  readonly receivablesAging = RECEIVABLES_AGING;
  readonly payablesAging = PAYABLES_AGING;
  readonly bankAccounts = BANK_ACCOUNTS;
  readonly closingControls = CLOSING_CONTROLS;
  readonly bookkeeping = BOOKKEEPING_STATS;
  readonly salesBudget = SALES_BUDGET;
  readonly sectorOperatingMargin = SECTOR_OPERATING_MARGIN;

  // ---------- Compte de résultat ----------
  readonly pnl = computeIncomeStatement(INCOME_STATEMENT.current);
  readonly pnlPrior = computeIncomeStatement(INCOME_STATEMENT.prior);
  readonly pnlMonth = computeIncomeStatement(MONTHLY_INCOME_STATEMENT.current);
  readonly pnlMonthPrior = computeIncomeStatement(MONTHLY_INCOME_STATEMENT.prior);

  // ---------- Bilan ----------
  readonly fixedAssetsNet =
    net(this.bs.fixedAssets.intangible) + net(this.bs.fixedAssets.tangible) + net(this.bs.fixedAssets.financial);
  readonly currentAssetsNet = net(this.bs.currentAssets.inventories) + net(this.bs.currentAssets.receivables);
  readonly cashAssetsNet = net(this.bs.cashAssets.banks) + net(this.bs.cashAssets.cashOnHand);
  readonly assetLines: AssetLine[] = [
    this.bs.fixedAssets.intangible,
    this.bs.fixedAssets.tangible,
    this.bs.fixedAssets.financial,
    this.bs.currentAssets.inventories,
    this.bs.currentAssets.receivables,
    this.bs.cashAssets.banks,
    this.bs.cashAssets.cashOnHand,
  ];
  readonly totalAssetsGross = this.assetLines.reduce((s, l) => s + l.gross, 0);
  readonly totalDepreciation = this.assetLines.reduce((s, l) => s + l.depreciation, 0);
  readonly totalAssets = this.fixedAssetsNet + this.currentAssetsNet + this.cashAssetsNet;

  readonly equity = this.bs.equity.capital.amount + this.bs.equity.reserves.amount + this.bs.equity.netIncome.amount;
  readonly stableResources = this.equity + this.bs.provisions.amount + this.bs.financialDebt.amount;
  readonly currentLiabilities =
    this.bs.currentLiabilities.suppliers.amount + this.bs.currentLiabilities.taxSocialOther.amount;
  readonly cashLiabilities = this.bs.cashLiabilities.amount;
  readonly totalLiabilities = this.stableResources + this.currentLiabilities + this.cashLiabilities;
  readonly balanceGap = this.totalAssets - this.totalLiabilities;

  // ---------- Équilibre financier ----------
  readonly frng = this.stableResources - this.fixedAssetsNet;
  readonly bfr = this.currentAssetsNet - this.currentLiabilities;
  readonly netCash = this.cashAssetsNet - this.cashLiabilities;

  // ---------- Ratios ----------
  readonly currentRatio = (this.currentAssetsNet + this.cashAssetsNet) / (this.currentLiabilities + this.cashLiabilities);
  readonly autonomy = (this.equity / this.totalAssets) * 100;
  readonly bfrCoverage = this.frng / this.bfr;
  readonly caf = this.pnl.netIncome - this.pnl.depreciation; // depreciation is negative
  readonly cafPrior = this.pnlPrior.netIncome - this.pnlPrior.depreciation;
  readonly netDebt = this.bs.financialDebt.amount - this.netCash;
  readonly leverageYears = this.netDebt / this.caf;
  readonly currentDebtService = this.debtService.annualPrincipal + this.debtService.annualInterest;
  readonly cashFlowAvailable = this.pnl.ebitda - this.pnl.incomeTax;
  readonly dscr = this.cashFlowAvailable / this.currentDebtService;
  readonly operatingMargin = (this.pnl.operatingIncome / this.pnl.sales) * 100;
  readonly operatingMarginPrior = (this.pnlPrior.operatingIncome / this.pnlPrior.sales) * 100;
  readonly roe = (this.pnl.netIncome / this.equity) * 100;
  readonly retainedShare = (this.bs.equity.retainedReserves / this.bs.equity.netIncome.amount) * 100;
  readonly salesGrowth = variation(this.pnl.sales, this.pnlPrior.sales);
  readonly cafToSales = (this.caf / this.pnl.sales) * 100;
  readonly dso = (this.bs.currentAssets.tradeReceivablesNet / (this.pnl.sales * (1 + VAT_RATE))) * 365;
  readonly dpo = (this.bs.currentLiabilities.tradePayables / (-this.pnl.purchases * (1 + VAT_RATE))) * 365;
  readonly cashOutflowsPerDay =
    -(this.pnl.purchases + this.pnl.externalServices + this.pnl.taxes + this.pnl.personnel) / 365;
  readonly cashCoverageDays = this.netCash / this.cashOutflowsPerDay;
  readonly equityToLiabilities = this.equity / (this.totalLiabilities - this.equity);

  /** Altman Z''-Score (EM version), adapted to SYSCOHADA aggregates. */
  readonly altmanEm =
    3.25 +
    6.56 * ((this.currentAssetsNet + this.cashAssetsNet - this.currentLiabilities - this.cashLiabilities) / this.totalAssets) +
    3.26 * (this.bs.equity.reserves.amount / this.totalAssets) +
    6.72 * (this.pnl.operatingIncome / this.totalAssets) +
    1.05 * this.equityToLiabilities;

  // ---------- Balance âgée ----------
  readonly receivablesTotal = this.receivablesAging.reduce((s, b) => s + b.amount, 0);
  readonly payablesTotal = this.payablesAging.reduce((s, b) => s + b.amount, 0);
  readonly overdue90Rate =
    (this.receivablesAging.filter((b) => b.tone === 'critical').reduce((s, b) => s + b.amount, 0) /
      this.receivablesTotal) *
    100;

  // ---------- Score & capacité d'emprunt ----------
  readonly grade = gradeFor(this.model.score);
  readonly leverageCapacity = this.model.maxLeverage * this.caf - this.netDebt;
  readonly dscrCapacity =
    (this.cashFlowAvailable / this.model.minDscr - this.currentDebtService) /
    (12 * monthlyInstalment(1, this.model.referenceTenorMonths, this.model.preNegotiatedRate));
  readonly borrowingCapacity = Math.max(0, Math.min(this.leverageCapacity, this.dscrCapacity));
  readonly bankOffersAvailable = this.partnerBanks.filter((b) => b.status === 'Accord').length;

  readonly riskDimensions = this.model.dimensions.map((d) => {
    const meta = DIMENSION_META[d.key];
    return { ...d, ...meta, ...this.dimensionFacts(d.key) };
  });
  readonly weightedScore =
    this.riskDimensions.reduce((s, d) => s + d.score, 0) / this.riskDimensions.length;

  // ---------- Tenue comptable (état mutable) ----------
  private readonly _journal = signal<JournalLine[]>(JOURNAL_LINES);
  private readonly _pending = signal<PendingFlow[]>(PENDING_FLOWS);
  private entrySeq = 8941;

  readonly journal = this._journal.asReadonly();
  readonly pendingFlows = this._pending.asReadonly();
  readonly journalTotals = computed(() => {
    const lines = this._journal();
    const debit = lines.reduce((s, l) => s + l.debit, 0);
    const credit = lines.reduce((s, l) => s + l.credit, 0);
    return { debit, credit, gap: debit - credit };
  });
  readonly monthEntries = computed(
    () => Object.values(this.bookkeeping.entriesByJournal).reduce((s, n) => s + n, 0),
  );
  readonly autoMatchRate = computed(() => (this.bookkeeping.autoMatched / this.monthEntries()) * 100);

  reconciliation(account: string) {
    const acc = this.bankAccounts.find((a) => a.account === account) ?? this.bankAccounts[0];
    const bookBalance = acc.statementBalance - acc.outstandingCheques + acc.depositsInTransit;
    return { ...acc, bookBalance };
  }

  readonly reconciledBankTotal = this.bankAccounts.reduce(
    (s, a) => s + this.reconciliation(a.account).bookBalance,
    0,
  );

  /** Posts the AI-suggested entry for a pending bank flow into the journal. */
  validateFlow(id: string): PendingFlow | undefined {
    const flow = this._pending().find((f) => f.id === id);
    if (!flow) return undefined;
    const amount = Math.abs(flow.amount);
    const entry = `EC-${++this.entrySeq}`;
    const base = { date: flow.date, entry, journal: flow.journal, reference: flow.bankRef };
    const lines: JournalLine[] = [
      {
        ...base, account: flow.debitAccount.code, accountLabel: flow.debitAccount.label, label: flow.label,
        debit: amount, credit: 0, status: 'Rapproché', attachment: { icon: 'clipboard-check', title: flow.document },
      },
      {
        ...base, account: flow.creditAccount.code, accountLabel: flow.creditAccount.label, label: flow.document,
        debit: 0, credit: amount, status: flow.amount > 0 ? 'Lettré' : 'Rapproché',
        attachment: { icon: 'landmark', title: 'Extrait bancaire rapproché' }, counterpart: true,
      },
    ];
    this._journal.update((j) => [...lines, ...j]);
    this._pending.update((p) => p.filter((f) => f.id !== id));
    return flow;
  }

  /** Manual double entry. Returns false if the entry is not balanced / invalid. */
  addManualEntry(input: {
    journal: JournalLine['journal'];
    date: string;
    debitAccount: string;
    creditAccount: string;
    amount: number;
    label: string;
  }): boolean {
    const accountOk = (a: string) => /^[1-9]\d{2,7}$/.test(a.trim());
    if (!accountOk(input.debitAccount) || !accountOk(input.creditAccount)) return false;
    if (!(input.amount > 0) || !input.label.trim() || input.debitAccount === input.creditAccount) return false;
    const entry = `EC-${++this.entrySeq}`;
    const base = { date: input.date, entry, journal: input.journal, reference: 'Saisie manuelle', label: input.label.trim() };
    this._journal.update((j) => [
      {
        ...base, account: input.debitAccount.trim(), accountLabel: 'Compte débité', debit: input.amount, credit: 0,
        status: 'Comptabilisé', attachment: { icon: 'file-edit', title: 'Saisie manuelle — pièce à rattacher' },
      },
      {
        ...base, account: input.creditAccount.trim(), accountLabel: 'Compte crédité', debit: 0, credit: input.amount,
        status: 'Comptabilisé', attachment: { icon: 'file-edit', title: 'Saisie manuelle — pièce à rattacher' },
        counterpart: true,
      },
      ...j,
    ]);
    return true;
  }

  // ---------- Simulations ----------
  simulateLoan(amount: number, months: number): LoanSimulation {
    const monthlyPayment = monthlyInstalment(amount, months, this.model.preNegotiatedRate);
    const annualPayment = monthlyPayment * 12;
    const projectedDscr = this.cashFlowAvailable / (this.currentDebtService + annualPayment);
    return {
      monthlyPayment,
      annualPayment,
      projectedDscr,
      withinCapacity: amount <= this.borrowingCapacity,
      dscrOk: projectedDscr >= this.model.minDscr,
    };
  }

  stressTest({ salesShockPct, rateShockBps, dsoShockDays }: StressInput): StressResult {
    const marginRate = this.pnl.grossMargin / this.pnl.sales;
    const ebitdaImpact = this.pnl.sales * (salesShockPct / 100) * marginRate;
    const interestImpact = this.bs.financialDebt.amount * this.debtService.variableRateShare * (rateShockBps / 10_000);
    const bfrImpact = ((this.pnl.sales * (1 + VAT_RATE)) / 365) * dsoShockDays;
    const residualCash = this.netCash + ebitdaImpact - interestImpact - bfrImpact;
    const liquidityBreakpointPct =
      -((this.netCash - interestImpact - bfrImpact) / (this.pnl.sales * marginRate)) * 100;

    const scoreDelta = Math.round(2.5 * salesShockPct - 0.08 * rateShockBps - 1.0 * dsoShockDays);
    const score = Math.max(300, Math.min(1000, this.model.score + scoreDelta));
    const resilience = residualCash > this.netCash * 0.25 ? 'Élevée' : residualCash > 0 ? 'Modérée' : 'Faible';
    return { score, scoreDelta, grade: gradeFor(score), residualCash, liquidityBreakpointPct, resilience };
  }

  private dimensionFacts(key: RiskDimensionKey): { value: string; norm: string; fact: string } {
    const fr = (n: number, d = 2) => n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
    const m = (n: number) => `${fr(n / 1e6, 1)}M FCFA`;
    switch (key) {
      case 'liquidity':
        return { value: `${fr(this.currentRatio)}x`, norm: 'Seuil SYSCOHADA : > 1,20x', fact: `Trésorerie nette : ${m(this.netCash)}` };
      case 'solvency':
        return { value: `${fr(this.autonomy, 1)} %`, norm: 'Capitaux propres / total bilan (min. 33 %)', fact: `Capitaux propres : ${m(this.equity)}` };
      case 'dscr':
        return { value: `${fr(this.dscr)}x`, norm: `Norme bancaire : > ${fr(this.model.minDscr)}x`, fact: `Marge de couverture : +${fr((this.dscr / this.model.minDscr - 1) * 100, 0)} %` };
      case 'collection':
        return { value: `${fr(this.dso, 0)} jours`, norm: 'Délai contractuel max : 60 jours', fact: `Impayés > 90j : ${fr(this.overdue90Rate, 1)} %` };
      case 'margin':
        return { value: `${fr(this.operatingMargin, 1)} %`, norm: `REX ${m(this.pnl.operatingIncome)} sur CA ${m(this.pnl.sales)}`, fact: `Benchmark secteur : ${fr(this.sectorOperatingMargin, 1)} %` };
    }
  }
}
