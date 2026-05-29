import type { WealthAccumulationInputs } from "@/lib/store-types"

// ── Derived Constants ─────────────────────────────────────────────────────────

export interface WealthDerivedConstants {
  yearsToRetirement: number
  monthsToRetirement: number
  monthlyRate: number
  realRate: number
  annualGuaranteedIncome: number
}

export function deriveWealthConstants(inp: WealthAccumulationInputs): WealthDerivedConstants {
  const yearsToRetirement = Math.max(0, inp.retirementAge - inp.currentAge)
  const monthsToRetirement = yearsToRetirement * 12
  const monthlyRate = inp.expectedAnnualReturn / 12
  const realRate =
    inp.useInflationAdjustment
      ? (1 + inp.expectedAnnualReturn) / (1 + inp.inflationRate) - 1
      : inp.expectedAnnualReturn
  const annualGuaranteedIncome =
    (inp.socialSecurityMonthly + inp.pensionMonthly + inp.otherGuaranteedMonthly) * 12
  return { yearsToRetirement, monthsToRetirement, monthlyRate, realRate, annualGuaranteedIncome }
}

// ── Chart data point ──────────────────────────────────────────────────────────

export interface WealthYearPoint {
  age: number
  year: number
  portfolioBalance: number
  wealthTarget: number
  scenarioHalf: number
  scenarioClosed: number
}

// ── Full outputs ──────────────────────────────────────────────────────────────

export interface WealthAccumulationOutputs {
  // Derived constants
  derived: WealthDerivedConstants

  // F1.01
  baseTargetIncome: number
  // F1.02
  inflationAdjustedTarget: number
  // F1.03
  netIncomeNeed: number
  // F1.04
  wealthNeeded: number
  // F1.05
  portfolioFV: number
  // F1.06
  contributionsFV: number
  // F1.07
  projectedWealthAtRetirement: number
  // F1.08
  wealthAccumulationGap: number
  // F1.09
  wealthSurplus: number
  // F1.10
  fundingRatio: number
  // F1.11
  sustainableAnnualIncome: number
  // F1.12
  retirementIncomeGap: number
  // F1.13
  additionalMonthlyNeeded: number
  // F1.14
  totalMonthlyRequired: number
  // F1.15
  currentSavingsRate: number
  // F1.16
  requiredSavingsRate: number
  // F1.17
  costOfDelay: number

  // Chart data
  timelineData: WealthYearPoint[]

  // Warnings
  shortHorizonWarning: boolean
  guaranteedFullyCoveredWarning: boolean
}

// ── FV helpers ────────────────────────────────────────────────────────────────

function fvPortfolio(pv: number, rate: number, years: number): number {
  if (rate === 0) return pv
  return pv * Math.pow(1 + rate, years)
}

function fvAnnuity(monthlyPmt: number, monthlyRate: number, months: number): number {
  if (months <= 0) return 0
  if (monthlyRate === 0) return monthlyPmt * months
  return monthlyPmt * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate
}

function pmtToFV(targetFV: number, monthlyRate: number, months: number): number {
  if (targetFV <= 0 || months <= 0) return 0
  if (monthlyRate === 0) return targetFV / months
  return (targetFV * monthlyRate) / (Math.pow(1 + monthlyRate, months) - 1)
}

// ── Main calculator ───────────────────────────────────────────────────────────

export function calculateWealthAccumulation(inp: WealthAccumulationInputs): WealthAccumulationOutputs {
  const derived = deriveWealthConstants(inp)
  const { yearsToRetirement, monthsToRetirement, monthlyRate, annualGuaranteedIncome } = derived

  // F1.01
  const baseTargetIncome = inp.useTargetRetirementIncomeOverride && inp.targetRetirementIncome > 0
    ? inp.targetRetirementIncome
    : Math.max(0, inp.currentAnnualIncome) * inp.incomeReplacementRatio

  // F1.02
  const inflationAdjustedTarget = inp.useInflationAdjustment
    ? baseTargetIncome * Math.pow(1 + inp.inflationRate, yearsToRetirement)
    : baseTargetIncome

  // F1.03
  const netIncomeNeed = Math.max(0, inflationAdjustedTarget - annualGuaranteedIncome)

  // F1.04
  const wealthNeeded = inp.useCustomWealthTarget && inp.customWealthTarget > 0
    ? inp.customWealthTarget
    : inp.safeWithdrawalRate > 0 ? netIncomeNeed / inp.safeWithdrawalRate : 0

  // F1.05
  const portfolioFV = fvPortfolio(inp.currentPortfolioValue, inp.expectedAnnualReturn, yearsToRetirement)

  // F1.06
  const contributionsFV = fvAnnuity(inp.monthlyContribution, monthlyRate, monthsToRetirement)

  // F1.07
  const projectedWealthAtRetirement = portfolioFV + contributionsFV

  // F1.08
  const wealthAccumulationGap = Math.max(0, wealthNeeded - projectedWealthAtRetirement)

  // F1.09
  const wealthSurplus = Math.max(0, projectedWealthAtRetirement - wealthNeeded)

  // F1.10
  const fundingRatio = wealthNeeded > 0 ? projectedWealthAtRetirement / wealthNeeded : (projectedWealthAtRetirement > 0 ? Infinity : 1)

  // F1.11
  const sustainableAnnualIncome =
    projectedWealthAtRetirement * inp.safeWithdrawalRate + annualGuaranteedIncome

  // F1.12
  const retirementIncomeGap = Math.max(0, inflationAdjustedTarget - sustainableAnnualIncome)

  // F1.13
  const additionalMonthlyNeeded = pmtToFV(wealthAccumulationGap, monthlyRate, monthsToRetirement)

  // F1.14
  const totalMonthlyRequired = inp.monthlyContribution + additionalMonthlyNeeded

  // F1.15
  const currentSavingsRate =
    inp.currentAnnualIncome > 0 ? (inp.monthlyContribution * 12) / inp.currentAnnualIncome : 0

  // F1.16
  const requiredSavingsRate =
    inp.currentAnnualIncome > 0 ? (totalMonthlyRequired * 12) / inp.currentAnnualIncome : 0

  // F1.17
  const delayedMonths = Math.max(1, monthsToRetirement - 12)
  const delayedMonthlyRate = monthlyRate
  const delayedAdditional =
    wealthAccumulationGap > 0 && delayedMonths > 0
      ? pmtToFV(wealthAccumulationGap, delayedMonthlyRate, delayedMonths)
      : 0
  const costOfDelay = Math.max(0, delayedAdditional - additionalMonthlyNeeded)

  // F1.18 / F1.19 / Chart 1C — year-by-year data
  const timelineData: WealthYearPoint[] = []
  for (let y = 0; y <= yearsToRetirement; y++) {
    const months = y * 12
    const balance =
      fvPortfolio(inp.currentPortfolioValue, inp.expectedAnnualReturn, y) +
      fvAnnuity(inp.monthlyContribution, monthlyRate, months)

    const halfExtra = additionalMonthlyNeeded * 0.5
    const scenarioHalf =
      fvPortfolio(inp.currentPortfolioValue, inp.expectedAnnualReturn, y) +
      fvAnnuity(inp.monthlyContribution + halfExtra, monthlyRate, months)

    const scenarioClosed =
      fvPortfolio(inp.currentPortfolioValue, inp.expectedAnnualReturn, y) +
      fvAnnuity(inp.monthlyContribution + additionalMonthlyNeeded, monthlyRate, months)

    timelineData.push({
      age: inp.currentAge + y,
      year: y,
      portfolioBalance: balance,
      wealthTarget: wealthNeeded,
      scenarioHalf,
      scenarioClosed,
    })
  }

  return {
    derived,
    baseTargetIncome,
    inflationAdjustedTarget,
    netIncomeNeed,
    wealthNeeded,
    portfolioFV,
    contributionsFV,
    projectedWealthAtRetirement,
    wealthAccumulationGap,
    wealthSurplus,
    fundingRatio,
    sustainableAnnualIncome,
    retirementIncomeGap,
    additionalMonthlyNeeded,
    totalMonthlyRequired,
    currentSavingsRate,
    requiredSavingsRate,
    costOfDelay,
    timelineData,
    shortHorizonWarning: yearsToRetirement > 0 && yearsToRetirement < 5,
    guaranteedFullyCoveredWarning: annualGuaranteedIncome >= inflationAdjustedTarget && inflationAdjustedTarget > 0,
  }
}
