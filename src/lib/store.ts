import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { LifeInputs, LifeAssumptions, LifeOutputs } from "@/features/risk-modules/life/types"
import { DisabilityInputs, DisabilityAssumptions, DisabilityOutputs } from "@/features/risk-modules/disability/types"
import { UnemploymentInputs, UnemploymentOutputs } from "@/features/risk-modules/unemployment/types"
import { LiabilityInputs, LiabilityOutputs } from "@/features/risk-modules/liability/types"

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

export interface ClientFinancialProfile {
  clientId: string
  primaryIncomeEarnerName?: string
  currentAge?: number
  expectedRetirementAge?: number
  annualEarnedIncome?: number
  spouseAnnualIncome?: number
  monthlyHouseholdExpenses?: number
  emergencySavings?: number
  dependents?: number
  debtsTotal?: number
  educationFundingGoal?: number
  finalExpenses?: number
  groupLifeCoverage?: number
  privateLifeCoverage?: number
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

interface LifeModuleRecord {
  inputs: LifeInputs
  assumptions: LifeAssumptions
  output: LifeOutputs | null
  updatedAt: string
  lastCalculatedAt?: string
}

interface DisabilityModuleRecord {
  inputs: DisabilityInputs
  assumptions: DisabilityAssumptions
  output: DisabilityOutputs | null
  updatedAt: string
  lastCalculatedAt?: string
}

interface UnemploymentModuleRecord {
  inputs: UnemploymentInputs
  output: UnemploymentOutputs | null
  updatedAt: string
  lastCalculatedAt?: string
}

interface LiabilityModuleRecord {
  inputs: LiabilityInputs
  output: LiabilityOutputs | null
  updatedAt: string
  lastCalculatedAt?: string
}

interface ScenarioModuleRecords {
  life?: LifeModuleRecord
  disability?: DisabilityModuleRecord
  unemployment?: UnemploymentModuleRecord
  liability?: LiabilityModuleRecord
}

interface CreateClientPayload {
  firstName: string
  lastName: string
  displayName?: string
  email?: string
  phone?: string
  age?: number
  annualIncome?: number
  monthlyExpenses?: number
}

interface CreateScenarioPayload {
  clientId: string
  name: string
  includedModules: RiskModuleType[]
  activeModule: RiskModuleType
  notes?: string
}

interface AppState {
  clients: ClientRecord[]
  scenarios: ScenarioRecord[]
  moduleRecordsByScenarioId: Record<string, ScenarioModuleRecords>
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

const OWNER_ID = "local-advisor"

const defaultLifeAssumptions: LifeAssumptions = {
  inflationRateAnnual: 0.03,
  discountRateAnnual: 0.04,
  incomeGrowthRateAnnual: 0.03,
  usePresentValue: false,
  includeLiquidAssetsOffset: false,
  deathBenefitTaxTreatment: "generally_income_tax_free",
}

const defaultDisabilityAssumptions: DisabilityAssumptions = {
  scenarioType: "total",
  effectiveTaxRate: 0.22,
  useAfterTaxBenefits: true,
  benefitTimingMode: "monthly",
  expenseInflationRateAnnual: 0.03,
  ssdiModelingMode: "excluded",
}

function nowIso() {
  return new Date().toISOString()
}

function toDisplayName(firstName: string, lastName: string, displayName?: string) {
  const explicit = displayName?.trim()
  if (explicit) return explicit
  return `${firstName.trim()} ${lastName.trim()}`.trim()
}

function getProfileCompletion(profile: ClientFinancialProfile): ProfileCompletionStatus {
  if (!profile.primaryIncomeEarnerName) return "missing_required_info"
  if (profile.annualEarnedIncome && profile.monthlyHouseholdExpenses) return "ready_full_analysis"
  return "ready_basic_analysis"
}

function prefillLifeInputs(profile: ClientFinancialProfile, clientId: string, scenarioId: string): LifeInputs {
  return {
    advisorId: OWNER_ID,
    clientId,
    scenarioId,
    currentAge: profile.currentAge ?? 40,
    retirementAge: profile.expectedRetirementAge ?? 65,
    annualIncome: profile.annualEarnedIncome ?? 0,
    spouseAnnualIncome: profile.spouseAnnualIncome ?? 0,
    incomeReplacementYears: 25,
    incomeReplacementRatio: 1.0,
    groupLifeCoverage: profile.groupLifeCoverage ?? 0,
    privateLifeCoverage: profile.privateLifeCoverage ?? 0,
    debtsTotal: profile.debtsTotal ?? 0,
    educationGoal: profile.educationFundingGoal ?? 0,
    finalExpenses: profile.finalExpenses ?? 25000,
    liquidAssetsAllocated: profile.savingsAssets ?? 0,
  }
}

function prefillDisabilityInputs(profile: ClientFinancialProfile, clientId: string, scenarioId: string): DisabilityInputs {
  return {
    advisorId: OWNER_ID,
    clientId,
    scenarioId,
    annualEarnedIncome: profile.annualEarnedIncome ?? 0,
    monthlyExpenses: profile.monthlyHouseholdExpenses ?? 0,
    emergencySavings: profile.emergencySavings ?? 0,
    spouseMonthlyIncome: Math.round((profile.spouseAnnualIncome ?? 0) / 12),
    stdBenefitMonthly: profile.employerStdBenefitMonthly ?? 0,
    stdWaitingPeriodDays: 14,
    stdDurationMonths: 6,
    stdTaxable: true,
    ltdBenefitMonthly: profile.employerLtdBenefitMonthly ?? 0,
    ltdWaitingPeriodDays: 90,
    ltdDurationMonths: 60,
    ltdTaxable: true,
    privateDiBenefitMonthly: profile.privateDisabilityBenefitMonthly ?? 0,
    privateDiWaitingPeriodDays: 90,
    privateDiDurationMonths: 60,
    privateDiTaxable: false,
    stateBenefitMonthly: profile.stateBenefitEstimateMonthly ?? 0,
    stateBenefitStartMonth: 1,
    stateBenefitDurationMonths: 6,
    stateBenefitTaxable: false,
    includeSsdi: false,
    ssdiMonthlyBenefit: 0,
    ssdiStartMonth: 6,
    ssdiTaxable: false,
    partialDisabilityEarnedIncomePercent: 0.5,
    totalDisabilityEarnedIncomePercent: 0,
    modeledDurationMonths: 60,
  }
}

function prefillUnemploymentInputs(profile: ClientFinancialProfile): UnemploymentInputs {
  return {
    annualIncome: profile.annualEarnedIncome ?? 0,
    monthlyExpenses: profile.monthlyHouseholdExpenses ?? 0,
    emergencySavings: profile.emergencySavings ?? 0,
    severanceMonths: 2,
    unemploymentBenefitMonthly: 2000,
    unemploymentBenefitDurationMonths: 6,
    estimatedJobSearchMonths: 9,
    spouseIncome: profile.spouseAnnualIncome ?? 0,
  }
}

function prefillLiabilityInputs(profile: ClientFinancialProfile): LiabilityInputs {
  return {
    homeValue: profile.homeValue ?? 0,
    mortgageBalance: profile.mortgageBalance ?? 0,
    investmentAssets: profile.investmentAssets ?? 0,
    savingsAssets: profile.savingsAssets ?? 0,
    autoLiabilityLimit: profile.autoLiabilityLimit ?? 0,
    homeLiabilityLimit: profile.homeLiabilityLimit ?? 0,
    umbrellaCoverage: profile.umbrellaCoverage ?? 0,
    estimatedLawsuitExposure: 1_500_000,
  }
}

function updateScenarioForSave(scenario: ScenarioRecord, timestamp: string): ScenarioRecord {
  const nextStatus: ScenarioStatus =
    scenario.status === "inputs_needed" || scenario.status === "draft"
      ? "calculated"
      : scenario.status
  return {
    ...scenario,
    status: nextStatus,
    updatedAt: timestamp,
    lastCalculatedAt: timestamp,
  }
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      clients: [],
      scenarios: [],
      moduleRecordsByScenarioId: {},

      createClient: (payload) => {
        const timestamp = nowIso()
        const id = crypto.randomUUID()
        const firstName = payload.firstName.trim()
        const lastName = payload.lastName.trim()
        const profile: ClientFinancialProfile = {
          clientId: id,
          primaryIncomeEarnerName: `${firstName} ${lastName}`.trim(),
          currentAge: payload.age,
          expectedRetirementAge: 65,
          annualEarnedIncome: payload.annualIncome,
          monthlyHouseholdExpenses: payload.monthlyExpenses,
          emergencySavings: 0,
          spouseAnnualIncome: 0,
          dependents: 0,
          debtsTotal: 0,
          educationFundingGoal: 0,
          finalExpenses: 25000,
          groupLifeCoverage: 0,
          privateLifeCoverage: 0,
          employerStdBenefitMonthly: 0,
          employerLtdBenefitMonthly: 0,
          privateDisabilityBenefitMonthly: 0,
          stateBenefitEstimateMonthly: 0,
          homeValue: 0,
          mortgageBalance: 0,
          savingsAssets: 0,
          investmentAssets: 0,
          autoLiabilityLimit: 0,
          homeLiabilityLimit: 0,
          umbrellaCoverage: 0,
        }
        const record: ClientRecord = {
          id,
          ownerId: OWNER_ID,
          firstName,
          lastName,
          displayName: toDisplayName(firstName, lastName, payload.displayName),
          email: payload.email?.trim() ?? "",
          phone: payload.phone?.trim() ?? "",
          status: payload.annualIncome || payload.monthlyExpenses ? "active" : "draft",
          profileCompletionStatus: getProfileCompletion(profile),
          createdAt: timestamp,
          updatedAt: timestamp,
          profile,
        }
        set((state) => ({
          clients: [record, ...state.clients],
        }))
        return id
      },

      updateClient: (clientId, updates) => {
        set((state) => ({
          clients: state.clients.map((client) => {
            if (client.id !== clientId) return client
            const timestamp = nowIso()
            const firstName = updates.firstName?.trim() ?? client.firstName
            const lastName = updates.lastName?.trim() ?? client.lastName
            const profile = {
              ...client.profile,
              currentAge: updates.age ?? client.profile.currentAge,
              annualEarnedIncome: updates.annualIncome ?? client.profile.annualEarnedIncome,
              monthlyHouseholdExpenses:
                updates.monthlyExpenses ?? client.profile.monthlyHouseholdExpenses,
              primaryIncomeEarnerName: `${firstName} ${lastName}`.trim(),
            }
            return {
              ...client,
              firstName,
              lastName,
              displayName: toDisplayName(firstName, lastName, updates.displayName ?? client.displayName),
              email: updates.email?.trim() ?? client.email,
              phone: updates.phone?.trim() ?? client.phone,
              profile,
              profileCompletionStatus: getProfileCompletion(profile),
              updatedAt: timestamp,
            }
          }),
        }))
      },

      archiveClient: (clientId) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === clientId ? { ...client, status: "archived", updatedAt: nowIso() } : client,
          ),
        }))
      },

      createScenario: (payload) => {
        const client = get().clients.find((item) => item.id === payload.clientId)
        if (!client) return ""
        const timestamp = nowIso()
        const scenarioId = crypto.randomUUID()
        const includedModules: RiskModuleType[] = payload.includedModules.length
          ? payload.includedModules
          : ["disability"]
        const activeModule = includedModules.includes(payload.activeModule)
          ? payload.activeModule
          : includedModules[0]
        const scenario: ScenarioRecord = {
          id: scenarioId,
          clientId: payload.clientId,
          advisorId: OWNER_ID,
          name: payload.name.trim() || `${client.lastName} Household Risk Review`,
          notes: payload.notes?.trim(),
          includedModules,
          activeModule,
          status: "inputs_needed",
          createdAt: timestamp,
          updatedAt: timestamp,
          reportStatus: "not_started",
        }
        const moduleRecords: ScenarioModuleRecords = {}
        if (includedModules.includes("life")) {
          moduleRecords.life = {
            inputs: prefillLifeInputs(client.profile, payload.clientId, scenarioId),
            assumptions: { ...defaultLifeAssumptions },
            output: null,
            updatedAt: timestamp,
          }
        }
        if (includedModules.includes("disability")) {
          moduleRecords.disability = {
            inputs: prefillDisabilityInputs(client.profile, payload.clientId, scenarioId),
            assumptions: { ...defaultDisabilityAssumptions },
            output: null,
            updatedAt: timestamp,
          }
        }
        if (includedModules.includes("unemployment")) {
          moduleRecords.unemployment = {
            inputs: prefillUnemploymentInputs(client.profile),
            output: null,
            updatedAt: timestamp,
          }
        }
        if (includedModules.includes("liability")) {
          moduleRecords.liability = {
            inputs: prefillLiabilityInputs(client.profile),
            output: null,
            updatedAt: timestamp,
          }
        }
        set((state) => ({
          scenarios: [scenario, ...state.scenarios],
          moduleRecordsByScenarioId: {
            ...state.moduleRecordsByScenarioId,
            [scenarioId]: moduleRecords,
          },
        }))
        return scenarioId
      },

      setScenarioActiveModule: (scenarioId, module) => {
        set((state) => ({
          scenarios: state.scenarios.map((scenario) =>
            scenario.id === scenarioId
              ? { ...scenario, activeModule: module, updatedAt: nowIso() }
              : scenario,
          ),
        }))
      },

      updateLifeInputs: (scenarioId, inputs) => {
        set((state) => {
          const record = state.moduleRecordsByScenarioId[scenarioId]?.life
          if (!record) return state
          return {
            moduleRecordsByScenarioId: {
              ...state.moduleRecordsByScenarioId,
              [scenarioId]: {
                ...state.moduleRecordsByScenarioId[scenarioId],
                life: { ...record, inputs, updatedAt: nowIso() },
              },
            },
          }
        })
      },

      updateDisabilityInputs: (scenarioId, inputs) => {
        set((state) => {
          const record = state.moduleRecordsByScenarioId[scenarioId]?.disability
          if (!record) return state
          return {
            moduleRecordsByScenarioId: {
              ...state.moduleRecordsByScenarioId,
              [scenarioId]: {
                ...state.moduleRecordsByScenarioId[scenarioId],
                disability: { ...record, inputs, updatedAt: nowIso() },
              },
            },
          }
        })
      },

      updateUnemploymentInputs: (scenarioId, inputs) => {
        set((state) => {
          const record = state.moduleRecordsByScenarioId[scenarioId]?.unemployment
          if (!record) return state
          return {
            moduleRecordsByScenarioId: {
              ...state.moduleRecordsByScenarioId,
              [scenarioId]: {
                ...state.moduleRecordsByScenarioId[scenarioId],
                unemployment: { ...record, inputs, updatedAt: nowIso() },
              },
            },
          }
        })
      },

      updateLiabilityInputs: (scenarioId, inputs) => {
        set((state) => {
          const record = state.moduleRecordsByScenarioId[scenarioId]?.liability
          if (!record) return state
          return {
            moduleRecordsByScenarioId: {
              ...state.moduleRecordsByScenarioId,
              [scenarioId]: {
                ...state.moduleRecordsByScenarioId[scenarioId],
                liability: { ...record, inputs, updatedAt: nowIso() },
              },
            },
          }
        })
      },

      saveLifeCalculation: (scenarioId, output) => {
        const timestamp = nowIso()
        set((state) => {
          const record = state.moduleRecordsByScenarioId[scenarioId]?.life
          if (!record) return state
          return {
            moduleRecordsByScenarioId: {
              ...state.moduleRecordsByScenarioId,
              [scenarioId]: {
                ...state.moduleRecordsByScenarioId[scenarioId],
                life: {
                  ...record,
                  output,
                  updatedAt: timestamp,
                  lastCalculatedAt: timestamp,
                },
              },
            },
            scenarios: state.scenarios.map((scenario) =>
              scenario.id === scenarioId ? updateScenarioForSave(scenario, timestamp) : scenario,
            ),
          }
        })
      },

      saveDisabilityCalculation: (scenarioId, output) => {
        const timestamp = nowIso()
        set((state) => {
          const record = state.moduleRecordsByScenarioId[scenarioId]?.disability
          if (!record) return state
          return {
            moduleRecordsByScenarioId: {
              ...state.moduleRecordsByScenarioId,
              [scenarioId]: {
                ...state.moduleRecordsByScenarioId[scenarioId],
                disability: {
                  ...record,
                  output,
                  updatedAt: timestamp,
                  lastCalculatedAt: timestamp,
                },
              },
            },
            scenarios: state.scenarios.map((scenario) =>
              scenario.id === scenarioId ? updateScenarioForSave(scenario, timestamp) : scenario,
            ),
          }
        })
      },

      saveUnemploymentCalculation: (scenarioId, output) => {
        const timestamp = nowIso()
        set((state) => {
          const record = state.moduleRecordsByScenarioId[scenarioId]?.unemployment
          if (!record) return state
          return {
            moduleRecordsByScenarioId: {
              ...state.moduleRecordsByScenarioId,
              [scenarioId]: {
                ...state.moduleRecordsByScenarioId[scenarioId],
                unemployment: {
                  ...record,
                  output,
                  updatedAt: timestamp,
                  lastCalculatedAt: timestamp,
                },
              },
            },
            scenarios: state.scenarios.map((scenario) =>
              scenario.id === scenarioId ? updateScenarioForSave(scenario, timestamp) : scenario,
            ),
          }
        })
      },

      saveLiabilityCalculation: (scenarioId, output) => {
        const timestamp = nowIso()
        set((state) => {
          const record = state.moduleRecordsByScenarioId[scenarioId]?.liability
          if (!record) return state
          return {
            moduleRecordsByScenarioId: {
              ...state.moduleRecordsByScenarioId,
              [scenarioId]: {
                ...state.moduleRecordsByScenarioId[scenarioId],
                liability: {
                  ...record,
                  output,
                  updatedAt: timestamp,
                  lastCalculatedAt: timestamp,
                },
              },
            },
            scenarios: state.scenarios.map((scenario) =>
              scenario.id === scenarioId ? updateScenarioForSave(scenario, timestamp) : scenario,
            ),
          }
        })
      },
    }),
    {
      name: "gap-tool-app-state-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      partialize: (state) => ({
        clients: state.clients,
        scenarios: state.scenarios,
        moduleRecordsByScenarioId: state.moduleRecordsByScenarioId,
      }),
    },
  ),
)
