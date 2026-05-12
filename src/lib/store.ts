import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { LifeInputs, LifeAssumptions, LifeOutputs, LifePolicyType } from "@/features/risk-modules/life/types"
import { DisabilityInputs, DisabilityAssumptions, DisabilityOutputs } from "@/features/risk-modules/disability/types"
import { UnemploymentInputs, UnemploymentOutputs } from "@/features/risk-modules/unemployment/types"
import { LiabilityInputs, LiabilityOutputs } from "@/features/risk-modules/liability/types"

export type RiskModuleType = "life" | "disability" | "unemployment" | "liability"
export type ClientStatus = "draft" | "active" | "archived"
export type ProfileCompletionStatus = "missing_required_info" | "ready_basic_analysis" | "ready_full_analysis"
export type ScenarioStatus = "draft" | "inputs_needed" | "calculated" | "ready_for_review" | "presented" | "report_generated" | "archived"
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
  privateDisabilityBenefitMonthly?: number
  stateBenefitEstimateMonthly?: number
  homeValue?: number
  mortgageBalance?: number
  savingsAssets?: number
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

interface LifeModuleRecord { inputs: LifeInputs; assumptions: LifeAssumptions; output: LifeOutputs | null; updatedAt: string; lastCalculatedAt?: string }
interface DisabilityModuleRecord { inputs: DisabilityInputs; assumptions: DisabilityAssumptions; output: DisabilityOutputs | null; updatedAt: string; lastCalculatedAt?: string }
interface UnemploymentModuleRecord { inputs: UnemploymentInputs; output: UnemploymentOutputs | null; updatedAt: string; lastCalculatedAt?: string }
interface LiabilityModuleRecord { inputs: LiabilityInputs; output: LiabilityOutputs | null; updatedAt: string; lastCalculatedAt?: string }

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

interface CreateScenarioPayload { clientId: string; name: string; includedModules: RiskModuleType[]; activeModule: RiskModuleType; notes?: string }

interface AppState {
  clients: ClientRecord[]
  scenarios: ScenarioRecord[]
  moduleRecordsByScenarioId: Record<string, ScenarioModuleRecords>
  globalLifeAssumptions: LifeAssumptions
  globalDisabilityAssumptions: DisabilityAssumptions
  updateGlobalLifeAssumptions: (updates: Partial<LifeAssumptions>) => void
  updateGlobalDisabilityAssumptions: (updates: Partial<DisabilityAssumptions>) => void
  createClient: (payload: CreateClientPayload) => string
  updateClient: (clientId: string, updates: Partial<CreateClientPayload>) => void
  archiveClient: (clientId: string) => void
  createScenario: (payload: CreateScenarioPayload) => string
  setScenarioActiveModule: (scenarioId: string, module: RiskModuleType) => void
  updateLifeInputs: (scenarioId: string, inputs: LifeInputs) => void
  updateDisabilityInputs: (scenarioId: string, inputs: DisabilityInputs) => void
  updateUnemploymentInputs: (scenarioId: string, inputs: UnemploymentInputs) => void
  updateLiabilityInputs: (scenarioId: string, inputs: LiabilityInputs) => void
  saveLifeCalculation: (scenarioId: string, output: LifeOutputs) => void
  saveDisabilityCalculation: (scenarioId: string, output: DisabilityOutputs) => void
  saveUnemploymentCalculation: (scenarioId: string, output: UnemploymentOutputs) => void
  saveLiabilityCalculation: (scenarioId: string, output: LiabilityOutputs) => void
}

const DEFAULT_ADVISOR_ID = "local-advisor"
const DEFAULT_RETIREMENT_AGE = 65
const DEFAULT_LAWSUIT_EXPOSURE = 1_500_000

const defaultLifeAssumptions: LifeAssumptions = {
  inflationRateAnnual: 0.03,
  discountRateAnnual: 0.04,
  incomeGrowthRateAnnual: 0.03,
  usePresentValue: false,
  includeLiquidAssetsOffset: false,
  deathBenefitTaxTreatment: "generally_income_tax_free",
  deathBenefitIncomeYieldAnnual: 0.05,
}

const defaultDisabilityAssumptions: DisabilityAssumptions = {
  scenarioType: "total",
  effectiveTaxRate: 0.22,
  useAfterTaxBenefits: true,
  benefitTimingMode: "monthly",
  expenseInflationRateAnnual: 0.03,
  ssdiModelingMode: "excluded",
}

function nowIso() { return new Date().toISOString() }
function toDisplayName(firstName: string, lastName: string, displayName?: string) { return displayName?.trim() || `${firstName.trim()} ${lastName.trim()}`.trim() }
function getProfileCompletion(profile: ClientFinancialProfile): ProfileCompletionStatus {
  if (!profile.primaryIncomeEarnerName || !profile.currentAge || !profile.annualEarnedIncome) return "missing_required_info"
  if (profile.groupLifeCoverage !== undefined && profile.privateLifeCoverage !== undefined && profile.autoLiabilityLimit !== undefined) return "ready_full_analysis"
  return "ready_basic_analysis"
}

function buildUpdatedProfile(client: ClientRecord, updates: Partial<CreateClientPayload>, firstName: string, lastName: string): ClientFinancialProfile {
  const nextClientType = updates.clientType ?? client.profile.clientType ?? "individual"
  return {
    ...client.profile,
    clientType: nextClientType,
    primaryIncomeEarnerName: `${firstName} ${lastName}`.trim(),
    currentAge: updates.age ?? client.profile.currentAge,
    annualEarnedIncome: updates.annualIncome ?? client.profile.annualEarnedIncome,
    monthlyHouseholdExpenses: updates.monthlyExpenses ?? client.profile.monthlyHouseholdExpenses,
    spouseIncomeEarnerName: nextClientType === "couple" ? updates.spouseName?.trim() ?? client.profile.spouseIncomeEarnerName : "",
    spouseCurrentAge: nextClientType === "couple" ? updates.spouseAge ?? client.profile.spouseCurrentAge : undefined,
    spouseAnnualIncome: nextClientType === "couple" ? updates.spouseAnnualIncome ?? client.profile.spouseAnnualIncome ?? 0 : 0,
    groupLifeCoverage: updates.groupLifeCoverage ?? client.profile.groupLifeCoverage,
    privateLifeCoverage: updates.privateLifeCoverage ?? client.profile.privateLifeCoverage,
    privateLifePolicyType: updates.privateLifePolicyType ?? client.profile.privateLifePolicyType,
    privateLifeTermYears: updates.privateLifeTermYears ?? client.profile.privateLifeTermYears,
    nonQualifiedAssets: updates.nonQualifiedAssets ?? client.profile.nonQualifiedAssets,
    spouseGroupLifeCoverage: nextClientType === "couple" ? updates.spouseGroupLifeCoverage ?? client.profile.spouseGroupLifeCoverage ?? 0 : 0,
    spousePrivateLifeCoverage: nextClientType === "couple" ? updates.spousePrivateLifeCoverage ?? client.profile.spousePrivateLifeCoverage ?? 0 : 0,
    spousePrivateLifePolicyType: updates.spousePrivateLifePolicyType ?? client.profile.spousePrivateLifePolicyType,
    spousePrivateLifeTermYears: updates.spousePrivateLifeTermYears ?? client.profile.spousePrivateLifeTermYears,
    spouseNonQualifiedAssets: nextClientType === "couple" ? updates.spouseNonQualifiedAssets ?? client.profile.spouseNonQualifiedAssets ?? 0 : 0,
    investmentAssets: updates.nonQualifiedAssets ?? client.profile.investmentAssets ?? client.profile.nonQualifiedAssets ?? 0,
    autoLiabilityLimit: updates.autoLiabilityLimit ?? client.profile.autoLiabilityLimit,
  }
}

function prefillLifeInputs(profile: ClientFinancialProfile, clientId: string, scenarioId: string): LifeInputs {
  const yearsToRetirement = Math.max(0, (profile.expectedRetirementAge ?? DEFAULT_RETIREMENT_AGE) - (profile.currentAge ?? 40))
  return {
    advisorId: DEFAULT_ADVISOR_ID,
    clientId,
    scenarioId,
    earnerName: profile.primaryIncomeEarnerName,
    currentAge: profile.currentAge ?? 40,
    retirementAge: profile.expectedRetirementAge ?? DEFAULT_RETIREMENT_AGE,
    annualIncome: profile.annualEarnedIncome ?? 0,
    spouseAnnualIncome: 0,
    incomeReplacementYears: yearsToRetirement,
    incomeReplacementRatio: 1.0,
    groupLifeCoverage: profile.groupLifeCoverage ?? 0,
    privateLifeCoverage: profile.privateLifeCoverage ?? 0,
    privateLifePolicyType: profile.privateLifePolicyType ?? "term",
    privateLifeTermYears: profile.privateLifeTermYears ?? Math.min(20, yearsToRetirement || 20),
    nonQualifiedAssets: profile.nonQualifiedAssets ?? 0,
    debtsTotal: profile.debtsTotal ?? 0,
    educationGoal: profile.educationFundingGoal ?? 0,
    finalExpenses: profile.finalExpenses ?? 25000,
    liquidAssetsAllocated: profile.savingsAssets ?? 0,
  }
}

function prefillDisabilityInputs(profile: ClientFinancialProfile, clientId: string, scenarioId: string): DisabilityInputs {
  return {
    advisorId: DEFAULT_ADVISOR_ID, clientId, scenarioId,
    annualEarnedIncome: profile.annualEarnedIncome ?? 0,
    monthlyExpenses: profile.monthlyHouseholdExpenses ?? 0,
    emergencySavings: profile.emergencySavings ?? 0,
    spouseMonthlyIncome: (profile.spouseAnnualIncome ?? 0) / 12,
    stdBenefitMonthly: profile.employerStdBenefitMonthly ?? 0, stdWaitingPeriodDays: 14, stdDurationMonths: 6, stdTaxable: true,
    ltdBenefitMonthly: profile.employerLtdBenefitMonthly ?? 0, ltdWaitingPeriodDays: 90, ltdDurationMonths: 60, ltdTaxable: true,
    privateDiBenefitMonthly: profile.privateDisabilityBenefitMonthly ?? 0, privateDiWaitingPeriodDays: 90, privateDiDurationMonths: 60, privateDiTaxable: false,
    stateBenefitMonthly: profile.stateBenefitEstimateMonthly ?? 0, stateBenefitStartMonth: 1, stateBenefitDurationMonths: 6, stateBenefitTaxable: false,
    includeSsdi: false, ssdiMonthlyBenefit: 0, ssdiStartMonth: 6, ssdiTaxable: false,
    partialDisabilityEarnedIncomePercent: 0.5, totalDisabilityEarnedIncomePercent: 0, modeledDurationMonths: 60,
  }
}

function prefillUnemploymentInputs(profile: ClientFinancialProfile): UnemploymentInputs {
  return {
    annualIncome: profile.annualEarnedIncome ?? 0,
    monthlyExpenses: profile.monthlyHouseholdExpenses ?? Math.round((profile.annualEarnedIncome ?? 0) / 12),
    emergencySavings: profile.emergencySavings ?? 0,
    severanceMonths: 0,
    unemploymentBenefitMonthly: 0,
    unemploymentBenefitDurationMonths: 0,
    estimatedJobSearchMonths: 6,
    spouseIncome: profile.spouseAnnualIncome ?? 0,
  }
}

function prefillLiabilityInputs(profile: ClientFinancialProfile): LiabilityInputs {
  const nonQualifiedAssets = (profile.nonQualifiedAssets ?? 0) + (profile.spouseNonQualifiedAssets ?? 0)
  return {
    annualIncome: profile.annualEarnedIncome ?? 0,
    spouseAnnualIncome: profile.clientType === "couple" ? profile.spouseAnnualIncome ?? 0 : 0,
    currentAge: profile.currentAge ?? 40,
    spouseCurrentAge: profile.spouseCurrentAge ?? profile.currentAge ?? 40,
    retirementAge: profile.expectedRetirementAge ?? DEFAULT_RETIREMENT_AGE,
    nonQualifiedAssets,
    homeValue: profile.homeValue ?? 0,
    mortgageBalance: profile.mortgageBalance ?? 0,
    investmentAssets: profile.investmentAssets ?? nonQualifiedAssets,
    savingsAssets: profile.savingsAssets ?? 0,
    autoLiabilityLimit: profile.autoLiabilityLimit ?? 0,
    homeLiabilityLimit: profile.homeLiabilityLimit ?? 0,
    umbrellaCoverage: profile.umbrellaCoverage ?? 0,
    estimatedLawsuitExposure: DEFAULT_LAWSUIT_EXPOSURE,
  }
}

function syncModuleRecordsForClientUpdate(state: AppState, clientId: string, profile: ClientFinancialProfile, timestamp: string) {
  const updatedRecords = { ...state.moduleRecordsByScenarioId }
  for (const scenario of state.scenarios) {
    if (scenario.clientId !== clientId) continue
    const existing = updatedRecords[scenario.id]
    if (!existing) continue
    updatedRecords[scenario.id] = {
      ...existing,
      life: existing.life ? { ...existing.life, inputs: prefillLifeInputs(profile, clientId, scenario.id), output: null, updatedAt: timestamp, lastCalculatedAt: undefined } : undefined,
      disability: existing.disability ? { ...existing.disability, inputs: prefillDisabilityInputs(profile, clientId, scenario.id), output: null, updatedAt: timestamp, lastCalculatedAt: undefined } : undefined,
      unemployment: existing.unemployment ? { ...existing.unemployment, inputs: prefillUnemploymentInputs(profile), output: null, updatedAt: timestamp, lastCalculatedAt: undefined } : undefined,
      liability: existing.liability ? { ...existing.liability, inputs: prefillLiabilityInputs(profile), output: null, updatedAt: timestamp, lastCalculatedAt: undefined } : undefined,
    }
  }
  return updatedRecords
}

function updateScenarioForSave(scenario: ScenarioRecord, timestamp: string): ScenarioRecord {
  return { ...scenario, status: scenario.status === "inputs_needed" || scenario.status === "draft" ? "calculated" : scenario.status, updatedAt: timestamp, lastCalculatedAt: timestamp }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      clients: [], scenarios: [], moduleRecordsByScenarioId: {},
      globalLifeAssumptions: { ...defaultLifeAssumptions },
      globalDisabilityAssumptions: { ...defaultDisabilityAssumptions },
      updateGlobalLifeAssumptions: (updates) => set((state) => ({ globalLifeAssumptions: { ...state.globalLifeAssumptions, ...updates } })),
      updateGlobalDisabilityAssumptions: (updates) => set((state) => ({ globalDisabilityAssumptions: { ...state.globalDisabilityAssumptions, ...updates } })),
      createClient: (payload) => {
        const timestamp = nowIso(); const id = crypto.randomUUID(); const firstName = payload.firstName.trim(); const lastName = payload.lastName.trim()
        const primaryName = `${firstName} ${lastName}`.trim()
        const profile: ClientFinancialProfile = {
          clientId: id,
          clientType: payload.clientType ?? "individual",
          primaryIncomeEarnerName: primaryName,
          currentAge: payload.age,
          expectedRetirementAge: DEFAULT_RETIREMENT_AGE,
          annualEarnedIncome: payload.annualIncome,
          spouseIncomeEarnerName: payload.spouseName?.trim(),
          spouseCurrentAge: payload.spouseAge,
          spouseAnnualIncome: payload.clientType === "couple" ? payload.spouseAnnualIncome ?? 0 : 0,
          monthlyHouseholdExpenses: payload.monthlyExpenses,
          emergencySavings: 0,
          dependents: 0,
          debtsTotal: 0,
          educationFundingGoal: 0,
          finalExpenses: 25000,
          groupLifeCoverage: payload.groupLifeCoverage ?? 0,
          privateLifeCoverage: payload.privateLifeCoverage ?? 0,
          privateLifePolicyType: payload.privateLifePolicyType ?? "term",
          privateLifeTermYears: payload.privateLifeTermYears ?? 20,
          spouseGroupLifeCoverage: payload.clientType === "couple" ? payload.spouseGroupLifeCoverage ?? 0 : 0,
          spousePrivateLifeCoverage: payload.clientType === "couple" ? payload.spousePrivateLifeCoverage ?? 0 : 0,
          spousePrivateLifePolicyType: payload.spousePrivateLifePolicyType ?? "term",
          spousePrivateLifeTermYears: payload.spousePrivateLifeTermYears ?? 15,
          nonQualifiedAssets: payload.nonQualifiedAssets ?? 0,
          spouseNonQualifiedAssets: payload.clientType === "couple" ? payload.spouseNonQualifiedAssets ?? 0 : 0,
          employerStdBenefitMonthly: 0,
          employerLtdBenefitMonthly: 0,
          privateDisabilityBenefitMonthly: 0,
          stateBenefitEstimateMonthly: 0,
          homeValue: 0,
          mortgageBalance: 0,
          savingsAssets: 0,
          investmentAssets: payload.nonQualifiedAssets ?? 0,
          autoLiabilityLimit: payload.autoLiabilityLimit ?? 0,
          homeLiabilityLimit: 0,
          umbrellaCoverage: 0,
        }
        const record: ClientRecord = { id, ownerId: DEFAULT_ADVISOR_ID, firstName, lastName, displayName: toDisplayName(firstName, lastName, payload.displayName), email: payload.email?.trim() ?? "", phone: payload.phone?.trim() ?? "", status: payload.annualIncome ? "active" : "draft", profileCompletionStatus: getProfileCompletion(profile), createdAt: timestamp, updatedAt: timestamp, profile }
        set((state) => ({ clients: [record, ...state.clients] })); return id
      },
      updateClient: (clientId, updates) => set((state) => {
        const timestamp = nowIso()
        let updatedProfile: ClientFinancialProfile | null = null
        const clients = state.clients.map((client) => {
          if (client.id !== clientId) return client
          const firstName = updates.firstName?.trim() ?? client.firstName
          const lastName = updates.lastName?.trim() ?? client.lastName
          const profile = buildUpdatedProfile(client, updates, firstName, lastName)
          updatedProfile = profile
          return {
            ...client,
            firstName,
            lastName,
            displayName: toDisplayName(firstName, lastName, updates.displayName ?? client.displayName),
            email: updates.email?.trim() ?? client.email,
            phone: updates.phone?.trim() ?? client.phone,
            status: profile.annualEarnedIncome ? "active" : "draft",
            profile,
            profileCompletionStatus: getProfileCompletion(profile),
            updatedAt: timestamp,
          }
        })
        if (!updatedProfile) return state
        return {
          clients,
          scenarios: state.scenarios.map((scenario) => scenario.clientId === clientId ? { ...scenario, status: "inputs_needed", updatedAt: timestamp, lastCalculatedAt: undefined } : scenario),
          moduleRecordsByScenarioId: syncModuleRecordsForClientUpdate(state, clientId, updatedProfile, timestamp),
        }
      }),
      archiveClient: (clientId) => set((state) => ({ clients: state.clients.map((client) => client.id === clientId ? { ...client, status: "archived", updatedAt: nowIso() } : client) })),
      createScenario: (payload) => {
        const client = get().clients.find((item) => item.id === payload.clientId); if (!client) return ""
        const timestamp = nowIso(); const scenarioId = crypto.randomUUID(); const includedModules: RiskModuleType[] = payload.includedModules.length ? payload.includedModules : ["life", "liability", "unemployment"]
        const activeModule = includedModules.includes(payload.activeModule) ? payload.activeModule : includedModules[0]
        const scenario: ScenarioRecord = { id: scenarioId, clientId: payload.clientId, advisorId: DEFAULT_ADVISOR_ID, name: payload.name.trim() || `${client.lastName} Household Risk Review`, notes: payload.notes?.trim(), includedModules, activeModule, status: "inputs_needed", createdAt: timestamp, updatedAt: timestamp, reportStatus: "not_started" }
        const moduleRecords: ScenarioModuleRecords = {}
        if (includedModules.includes("life")) moduleRecords.life = { inputs: prefillLifeInputs(client.profile, payload.clientId, scenarioId), assumptions: { ...get().globalLifeAssumptions }, output: null, updatedAt: timestamp }
        if (includedModules.includes("disability")) moduleRecords.disability = { inputs: prefillDisabilityInputs(client.profile, payload.clientId, scenarioId), assumptions: { ...get().globalDisabilityAssumptions }, output: null, updatedAt: timestamp }
        if (includedModules.includes("unemployment")) moduleRecords.unemployment = { inputs: prefillUnemploymentInputs(client.profile), output: null, updatedAt: timestamp }
        if (includedModules.includes("liability")) moduleRecords.liability = { inputs: prefillLiabilityInputs(client.profile), output: null, updatedAt: timestamp }
        set((state) => ({ scenarios: [scenario, ...state.scenarios], moduleRecordsByScenarioId: { ...state.moduleRecordsByScenarioId, [scenarioId]: moduleRecords } })); return scenarioId
      },
      setScenarioActiveModule: (scenarioId, module) => set((state) => ({ scenarios: state.scenarios.map((scenario) => scenario.id === scenarioId ? { ...scenario, activeModule: module, updatedAt: nowIso() } : scenario) })),
      updateLifeInputs: (scenarioId, inputs) => set((state) => { const record = state.moduleRecordsByScenarioId[scenarioId]?.life; if (!record) return state; return { moduleRecordsByScenarioId: { ...state.moduleRecordsByScenarioId, [scenarioId]: { ...state.moduleRecordsByScenarioId[scenarioId], life: { ...record, inputs, updatedAt: nowIso() } } } } }),
      updateDisabilityInputs: (scenarioId, inputs) => set((state) => { const record = state.moduleRecordsByScenarioId[scenarioId]?.disability; if (!record) return state; return { moduleRecordsByScenarioId: { ...state.moduleRecordsByScenarioId, [scenarioId]: { ...state.moduleRecordsByScenarioId[scenarioId], disability: { ...record, inputs, updatedAt: nowIso() } } } } }),
      updateUnemploymentInputs: (scenarioId, inputs) => set((state) => { const record = state.moduleRecordsByScenarioId[scenarioId]?.unemployment; if (!record) return state; return { moduleRecordsByScenarioId: { ...state.moduleRecordsByScenarioId, [scenarioId]: { ...state.moduleRecordsByScenarioId[scenarioId], unemployment: { ...record, inputs, updatedAt: nowIso() } } } } }),
      updateLiabilityInputs: (scenarioId, inputs) => set((state) => { const record = state.moduleRecordsByScenarioId[scenarioId]?.liability; if (!record) return state; return { moduleRecordsByScenarioId: { ...state.moduleRecordsByScenarioId, [scenarioId]: { ...state.moduleRecordsByScenarioId[scenarioId], liability: { ...record, inputs, updatedAt: nowIso() } } } } }),
      saveLifeCalculation: (scenarioId, output) => { const timestamp = nowIso(); set((state) => { const record = state.moduleRecordsByScenarioId[scenarioId]?.life; if (!record) return state; return { moduleRecordsByScenarioId: { ...state.moduleRecordsByScenarioId, [scenarioId]: { ...state.moduleRecordsByScenarioId[scenarioId], life: { ...record, output, updatedAt: timestamp, lastCalculatedAt: timestamp } } }, scenarios: state.scenarios.map((scenario) => scenario.id === scenarioId ? updateScenarioForSave(scenario, timestamp) : scenario) } }) },
      saveDisabilityCalculation: (scenarioId, output) => { const timestamp = nowIso(); set((state) => { const record = state.moduleRecordsByScenarioId[scenarioId]?.disability; if (!record) return state; return { moduleRecordsByScenarioId: { ...state.moduleRecordsByScenarioId, [scenarioId]: { ...state.moduleRecordsByScenarioId[scenarioId], disability: { ...record, output, updatedAt: timestamp, lastCalculatedAt: timestamp } } }, scenarios: state.scenarios.map((scenario) => scenario.id === scenarioId ? updateScenarioForSave(scenario, timestamp) : scenario) } }) },
      saveUnemploymentCalculation: (scenarioId, output) => { const timestamp = nowIso(); set((state) => { const record = state.moduleRecordsByScenarioId[scenarioId]?.unemployment; if (!record) return state; return { moduleRecordsByScenarioId: { ...state.moduleRecordsByScenarioId, [scenarioId]: { ...state.moduleRecordsByScenarioId[scenarioId], unemployment: { ...record, output, updatedAt: timestamp, lastCalculatedAt: timestamp } } }, scenarios: state.scenarios.map((scenario) => scenario.id === scenarioId ? updateScenarioForSave(scenario, timestamp) : scenario) } }) },
      saveLiabilityCalculation: (scenarioId, output) => { const timestamp = nowIso(); set((state) => { const record = state.moduleRecordsByScenarioId[scenarioId]?.liability; if (!record) return state; return { moduleRecordsByScenarioId: { ...state.moduleRecordsByScenarioId, [scenarioId]: { ...state.moduleRecordsByScenarioId[scenarioId], liability: { ...record, output, updatedAt: timestamp, lastCalculatedAt: timestamp } } }, scenarios: state.scenarios.map((scenario) => scenario.id === scenarioId ? updateScenarioForSave(scenario, timestamp) : scenario) } }) },
    }),
    { name: "gap-tool-app-state-v1", storage: createJSONStorage(() => localStorage), version: 3, partialize: (state) => ({ clients: state.clients, scenarios: state.scenarios, moduleRecordsByScenarioId: state.moduleRecordsByScenarioId, globalLifeAssumptions: state.globalLifeAssumptions, globalDisabilityAssumptions: state.globalDisabilityAssumptions }) },
  ),
)
