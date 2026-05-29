import type { LifeInputs, LifeAssumptions, LifeOutputs, LifePolicyType } from "@/features/risk-modules/life/types"
import type { DisabilityInputs, DisabilityAssumptions, DisabilityOutputs, DiBenefitPeriod } from "@/features/risk-modules/disability/types"
import type { UnemploymentInputs, UnemploymentOutputs } from "@/features/risk-modules/unemployment/types"
import type { LiabilityInputs, LiabilityOutputs } from "@/features/risk-modules/liability/types"

export type RiskModuleType = "life" | "disability" | "unemployment" | "liability"
export type ClientStatus = "draft" | "active" | "archived"
export type ProfileCompletionStatus = "missing_required_info" | "ready_basic_analysis" | "ready_full_analysis"
export type ScenarioStatus =
  | "draft"
  | "inputs_needed"
  | "calculated"
  | "ready_for_review"
  | "presented"
  | "report_generated"
  | "archived"
export type ClientType = "individual" | "couple"

export interface ClientFinancialProfile {
  clientId: string
  clientType?: ClientType
  primaryIncomeEarnerName?: string
  currentAge?: number
  expectedRetirementAge?: number
  annualEarnedIncome?: number
  spouseIncomeEarnerName?: string
  spouseCurrentAge?: number
  spouseAnnualIncome?: number
  monthlyHouseholdExpenses?: number
  emergencySavings?: number
  dependents?: number
  debtsTotal?: number
  educationFundingGoal?: number
  finalExpenses?: number
  groupLifeCoverage?: number
  privateLifeCoverage?: number
  privateLifePolicyType?: LifePolicyType
  privateLifeTermYears?: number
  spouseGroupLifeCoverage?: number
  spousePrivateLifeCoverage?: number
  spousePrivateLifePolicyType?: LifePolicyType
  spousePrivateLifeTermYears?: number
  nonQualifiedAssets?: number
  spouseNonQualifiedAssets?: number
  employerStdBenefitMonthly?: number
  employerLtdBenefitMonthly?: number
  ltdCoveragePercent?: number
  ltdMonthlyCap?: number
  ltdTaxable?: boolean
  privateDisabilityBenefitMonthly?: number
  privateDisabilityMonthlyPremium?: number
  privateDisabilityBenefitPeriod?: DiBenefitPeriod | ""
  disabilityBreakEvenRateOfReturn?: number
  disabilityBreakEvenMonthsWithoutIncome?: number
  stateBenefitEstimateMonthly?: number
  homeValue?: number
  mortgageBalance?: number
  savingsAssets?: number
  /** Mirrors nonQualifiedAssets for backward compatibility with the liability calculator's optional field schema. */
  investmentAssets?: number
  autoLiabilityLimit?: number
  homeLiabilityLimit?: number
  umbrellaCoverage?: number
}

export interface ClientRecord {
  id: string
  ownerId: string
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone: string
  status: ClientStatus
  profileCompletionStatus: ProfileCompletionStatus
  createdAt: string
  updatedAt: string
  profile: ClientFinancialProfile
}

export interface ScenarioRecord {
  id: string
  clientId: string
  advisorId: string
  name: string
  notes?: string
  includedModules: RiskModuleType[]
  activeModule: RiskModuleType
  status: ScenarioStatus
  createdAt: string
  updatedAt: string
  lastCalculatedAt?: string
  presentedAt?: string
  reportStatus?: "not_started" | "ready" | "generated"
}

export interface LifeModuleRecord {
  inputs: LifeInputs
  assumptions: LifeAssumptions
  output: LifeOutputs | null
  updatedAt: string
  lastCalculatedAt?: string
}

export interface DisabilityModuleRecord {
  inputs: DisabilityInputs
  assumptions: DisabilityAssumptions
  output: DisabilityOutputs | null
  updatedAt: string
  lastCalculatedAt?: string
}

export interface UnemploymentModuleRecord {
  inputs: UnemploymentInputs
  output: UnemploymentOutputs | null
  updatedAt: string
  lastCalculatedAt?: string
}

export interface LiabilityModuleRecord {
  inputs: LiabilityInputs
  output: LiabilityOutputs | null
  updatedAt: string
  lastCalculatedAt?: string
}

export interface ScenarioModuleRecords {
  life?: LifeModuleRecord
  disability?: DisabilityModuleRecord
  unemployment?: UnemploymentModuleRecord
  liability?: LiabilityModuleRecord
}

export interface CreateClientPayload {
  firstName: string
  lastName: string
  displayName?: string
  email?: string
  phone?: string
  clientType?: ClientType
  age?: number
  annualIncome?: number
  monthlyExpenses?: number
  groupLifeCoverage?: number
  privateLifeCoverage?: number
  privateLifePolicyType?: LifePolicyType
  privateLifeTermYears?: number
  nonQualifiedAssets?: number
  ltdCoveragePercent?: number
  ltdMonthlyCap?: number
  ltdTaxable?: boolean
  privateDisabilityBenefitMonthly?: number
  privateDisabilityMonthlyPremium?: number
  privateDisabilityBenefitPeriod?: DiBenefitPeriod | ""
  disabilityBreakEvenRateOfReturn?: number
  disabilityBreakEvenMonthsWithoutIncome?: number
  spouseName?: string
  spouseAge?: number
  spouseAnnualIncome?: number
  spouseGroupLifeCoverage?: number
  spousePrivateLifeCoverage?: number
  spousePrivateLifePolicyType?: LifePolicyType
  spousePrivateLifeTermYears?: number
  spouseNonQualifiedAssets?: number
  autoLiabilityLimit?: number
}

export interface CreateScenarioPayload {
  clientId: string
  name: string
  includedModules: RiskModuleType[]
  activeModule: RiskModuleType
  notes?: string
}

/** Shape of the data slice persisted to localStorage and used for export/import. */
export interface PersistedAppData {
  clients: ClientRecord[]
  scenarios: ScenarioRecord[]
  moduleRecordsByScenarioId: Record<string, ScenarioModuleRecords>
  globalLifeAssumptions?: import("@/features/risk-modules/life/types").LifeAssumptions
  globalDisabilityAssumptions?: import("@/features/risk-modules/disability/types").DisabilityAssumptions
  offensiveInputsByClientId?: Record<string, OffensiveClientInputs>
}

// ── Offensive Tool Types ──────────────────────────────────────────────────────

/** Module 1 — Retirement Readiness Gap inputs */
export interface WealthAccumulationInputs {
  // Group A — Client Profile
  currentAge: number
  retirementAge: number
  currentAnnualIncome: number
  incomeReplacementRatio: number
  targetRetirementIncome: number
  useTargetRetirementIncomeOverride: boolean

  // Group B — Current Financial Position
  currentPortfolioValue: number
  monthlyContribution: number
  socialSecurityMonthly: number
  pensionMonthly: number
  otherGuaranteedMonthly: number

  // Group C — Growth Assumptions
  expectedAnnualReturn: number
  inflationRate: number
  useInflationAdjustment: boolean
  retirementDurationYears: number

  // Group D — Retirement Income Model
  safeWithdrawalRate: number
  useCustomWealthTarget: boolean
  customWealthTarget: number
}

/** Module 2 — Investment Cost Impact inputs */
export interface FeeDragInputs {
  // Group A — Portfolio Basis (shared with Module 1 or standalone)
  currentPortfolioValue: number
  monthlyContribution: number
  yearsToRetirement: number
  grossMarketReturn: number

  // Group B — Current Cost Structure
  currentExpenseRatio: number
  currentPortfolioLabel: string
  includeTradingCosts: boolean
  currentTurnoverRate: number
  currentAdvisorFee: number

  // Group C — Proposed Cost Structure
  proposedExpenseRatio: number
  proposedPortfolioLabel: string
  proposedTurnoverRate: number
  proposedAdvisorFee: number
  switchingCostEstimate: number
  safeWithdrawalRate: number

  // Integration toggle
  applyFeeOptimizationToWealthGap: boolean
}

/** All offensive inputs for a single client */
export interface OffensiveClientInputs {
  wealthAccumulation: WealthAccumulationInputs
  feeDrag: FeeDragInputs
  updatedAt: string
}
