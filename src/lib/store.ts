import { create } from 'zustand'
import { LifeInputs, LifeAssumptions } from '@/features/risk-modules/life/types'
import { DisabilityInputs, DisabilityAssumptions } from '@/features/risk-modules/disability/types'
import { UnemploymentInputs } from '@/features/risk-modules/unemployment/types'
import { LiabilityInputs } from '@/features/risk-modules/liability/types'

interface ScenarioState {
  lifeInputs: LifeInputs;
  lifeAssumptions: LifeAssumptions;
  disabilityInputs: DisabilityInputs;
  disabilityAssumptions: DisabilityAssumptions;
  unemploymentInputs: UnemploymentInputs;
  liabilityInputs: LiabilityInputs;
  setLifeInputs: (inputs: LifeInputs) => void;
  setLifeAssumptions: (assumptions: LifeAssumptions) => void;
  setDisabilityInputs: (inputs: DisabilityInputs) => void;
  setDisabilityAssumptions: (assumptions: DisabilityAssumptions) => void;
  setUnemploymentInputs: (inputs: UnemploymentInputs) => void;
  setLiabilityInputs: (inputs: LiabilityInputs) => void;
}

export const useScenarioStore = create<ScenarioState>((set) => ({
  lifeInputs: {
    currentAge: 40,
    retirementAge: 65,
    annualIncome: 120000,
    spouseAnnualIncome: 0,
    incomeReplacementYears: 25,
    incomeReplacementRatio: 1.0,
    groupLifeCoverage: 50000,
    privateLifeCoverage: 0,
    debtsTotal: 250000,
    educationGoal: 100000,
    finalExpenses: 25000,
    liquidAssetsAllocated: 0,
  },
  lifeAssumptions: {
    inflationRateAnnual: 0.03,
    discountRateAnnual: 0.04,
    incomeGrowthRateAnnual: 0.03,
    usePresentValue: false,
    includeLiquidAssetsOffset: false,
    deathBenefitTaxTreatment: "generally_income_tax_free",
  },
  disabilityInputs: {
    annualEarnedIncome: 150000,
    monthlyExpenses: 8000,
    emergencySavings: 25000,
    spouseMonthlyIncome: 5000,
    stdBenefitMonthly: 0,
    stdWaitingPeriodDays: 14,
    stdDurationMonths: 6,
    stdTaxable: true,
    ltdBenefitMonthly: 5000,
    ltdWaitingPeriodDays: 90,
    ltdDurationMonths: 60,
    ltdTaxable: true,
    privateDiBenefitMonthly: 0,
    privateDiWaitingPeriodDays: 90,
    privateDiDurationMonths: 60,
    privateDiTaxable: false,
    stateBenefitMonthly: 0,
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
  },
  disabilityAssumptions: {
    scenarioType: "total",
    effectiveTaxRate: 0.22,
    useAfterTaxBenefits: true,
    benefitTimingMode: "monthly",
    expenseInflationRateAnnual: 0.03,
    ssdiModelingMode: "excluded",
  },
  unemploymentInputs: {
    annualIncome: 150000,
    monthlyExpenses: 8500,
    emergencySavings: 40000,
    severanceMonths: 2,
    unemploymentBenefitMonthly: 2000,
    unemploymentBenefitDurationMonths: 6,
    estimatedJobSearchMonths: 9,
    spouseIncome: 60000,
  },
  liabilityInputs: {
    homeValue: 800000,
    mortgageBalance: 500000,
    investmentAssets: 350000,
    savingsAssets: 50000,
    autoLiabilityLimit: 250000,
    homeLiabilityLimit: 300000,
    umbrellaCoverage: 0,
    estimatedLawsuitExposure: 1500000,
  },
  setLifeInputs: (inputs) => set({ lifeInputs: inputs }),
  setLifeAssumptions: (assumptions) => set({ lifeAssumptions: assumptions }),
  setDisabilityInputs: (inputs) => set({ disabilityInputs: inputs }),
  setDisabilityAssumptions: (assumptions) => set({ disabilityAssumptions: assumptions }),
  setUnemploymentInputs: (inputs) => set({ unemploymentInputs: inputs }),
  setLiabilityInputs: (inputs) => set({ liabilityInputs: inputs }),
}))
