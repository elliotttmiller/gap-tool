import type { FeeDragInputs } from "@/lib/store-types"

// ── Derived constants ─────────────────────────────────────────────────────────

const TRADING_COST_PER_TURNOVER = 0.003 // 30 bps per 100% annual turnover

// ── Chart data ────────────────────────────────────────────────────────────────

export interface FeeDragYearPoint {
  age: number
  year: number
  currentBalance: number
  proposedBalance: number
  cumulativeFeeDrag: number
}

// ── Cost breakdown (Chart 2C) ─────────────────────────────────────────────────

export interface CostBreakdownItem {
  category: string
  current: number
  proposed: number
}

// ── Full outputs ──────────────────────────────────────────────────────────────

export interface FeeDragOutputs {
  // Derived intermediates
  currentTradingCostDrag: number
  proposedTradingCostDrag: number

  // F2.01
  currentEffectiveCost: number
  // F2.02
  proposedEffectiveCost: number
  // F2.03
  currentNetReturn: number
  // F2.04
  proposedNetReturn: number
  // F2.05
  returnDelta: number
  // F2.06
  currentAnnualFeeCost: number
  // F2.07
  proposedAnnualFeeCost: number
  // F2.08
  annualFeeSavings: number
  // F2.09
  currentPortfolioFV: number
  // F2.10
  proposedPortfolioFV: number
  // F2.11
  feeDragCost: number
  // F2.12
  feeDragPercentage: number
  // F2.13
  retirementIncomeLost: number
  // F2.14
  breakEvenYear: number | null
  breakEvenAge: number | null

  // Chart data
  yearlyData: FeeDragYearPoint[]
  costBreakdown: CostBreakdownItem[]

  // Warnings
  costsNotLowerWarning: boolean
  currentNegativeReturnWarning: boolean
  noProposedAdvisorFeeWarning: boolean
  alreadyLowCostNotice: boolean
  shortHorizonWarning: boolean
  switchingCostExceedsDragWarning: boolean
}

// ── FV helpers ────────────────────────────────────────────────────────────────

function fvCombined(pv: number, monthlyPmt: number, netReturn: number, years: number): number {
  const monthlyRate = netReturn / 12
  const months = years * 12
  const pvGrown = pv * Math.pow(1 + netReturn, years)
  if (monthlyRate === 0) return pvGrown + monthlyPmt * months
  const annuityFV = monthlyPmt * (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate
  return pvGrown + annuityFV
}

// ── Main calculator ───────────────────────────────────────────────────────────

export function calculateFeeDrag(inp: FeeDragInputs): FeeDragOutputs {
  const years = Math.max(1, inp.yearsToRetirement)

  // Derived intermediates
  const currentTradingCostDrag = inp.includeTradingCosts
    ? inp.currentTurnoverRate * TRADING_COST_PER_TURNOVER
    : 0
  const proposedTradingCostDrag = inp.includeTradingCosts
    ? inp.proposedTurnoverRate * TRADING_COST_PER_TURNOVER
    : 0

  // F2.01
  const currentEffectiveCost =
    inp.currentExpenseRatio + inp.currentAdvisorFee + currentTradingCostDrag

  // F2.02
  const proposedEffectiveCost =
    inp.proposedExpenseRatio + inp.proposedAdvisorFee + proposedTradingCostDrag

  // F2.03
  const currentNetReturn = inp.grossMarketReturn - currentEffectiveCost

  // F2.04
  const proposedNetReturn = inp.grossMarketReturn - proposedEffectiveCost

  // F2.05
  const returnDelta = proposedNetReturn - currentNetReturn

  // F2.06
  const currentAnnualFeeCost = inp.currentPortfolioValue * currentEffectiveCost

  // F2.07
  const proposedAnnualFeeCost = inp.currentPortfolioValue * proposedEffectiveCost

  // F2.08
  const annualFeeSavings = currentAnnualFeeCost - proposedAnnualFeeCost

  // F2.09
  const currentPortfolioFV = fvCombined(
    inp.currentPortfolioValue, inp.monthlyContribution, currentNetReturn, years,
  )

  // F2.10
  const proposedPortfolioFV = fvCombined(
    inp.currentPortfolioValue, inp.monthlyContribution, proposedNetReturn, years,
  )

  // F2.11
  const feeDragCost = Math.max(0, proposedPortfolioFV - currentPortfolioFV)

  // F2.12
  const feeDragPercentage = proposedPortfolioFV > 0 ? feeDragCost / proposedPortfolioFV : 0

  // F2.13
  const retirementIncomeLost = feeDragCost * inp.safeWithdrawalRate

  // F2.14 — year-by-year and break-even
  const yearlyData: FeeDragYearPoint[] = []
  let breakEvenYear: number | null = inp.switchingCostEstimate <= 0 ? 1 : null
  let breakEvenAge: number | null = inp.switchingCostEstimate <= 0
    ? (inp as { currentAge?: number }).currentAge ?? null
    : null

  const baseAge = (inp as { currentAge?: number }).currentAge ?? 0

  for (let y = 0; y <= years; y++) {
    const currentBalance = fvCombined(inp.currentPortfolioValue, inp.monthlyContribution, currentNetReturn, y)
    const proposedBalance = fvCombined(inp.currentPortfolioValue, inp.monthlyContribution, proposedNetReturn, y)
    const cumulativeDrag = Math.max(0, proposedBalance - currentBalance)
    yearlyData.push({
      age: baseAge + y,
      year: y,
      currentBalance,
      proposedBalance,
      cumulativeFeeDrag: cumulativeDrag,
    })
    if (
      breakEvenYear === null &&
      inp.switchingCostEstimate > 0 &&
      cumulativeDrag >= inp.switchingCostEstimate
    ) {
      breakEvenYear = y
      breakEvenAge = baseAge + y
    }
  }

  // Cost breakdown (Chart 2C — annual dollar on current portfolio value)
  const costBreakdown: CostBreakdownItem[] = [
    {
      category: "Fund Expense Ratio",
      current: inp.currentPortfolioValue * inp.currentExpenseRatio,
      proposed: inp.currentPortfolioValue * inp.proposedExpenseRatio,
    },
    {
      category: "Advisor Fee",
      current: inp.currentPortfolioValue * inp.currentAdvisorFee,
      proposed: inp.currentPortfolioValue * inp.proposedAdvisorFee,
    },
    {
      category: "Trading Cost Drag",
      current: inp.currentPortfolioValue * currentTradingCostDrag,
      proposed: inp.currentPortfolioValue * proposedTradingCostDrag,
    },
  ]

  return {
    currentTradingCostDrag,
    proposedTradingCostDrag,
    currentEffectiveCost,
    proposedEffectiveCost,
    currentNetReturn,
    proposedNetReturn,
    returnDelta,
    currentAnnualFeeCost,
    proposedAnnualFeeCost,
    annualFeeSavings,
    currentPortfolioFV,
    proposedPortfolioFV,
    feeDragCost,
    feeDragPercentage,
    retirementIncomeLost,
    breakEvenYear,
    breakEvenAge,
    yearlyData,
    costBreakdown,
    costsNotLowerWarning: proposedEffectiveCost >= currentEffectiveCost,
    currentNegativeReturnWarning: currentNetReturn <= 0,
    noProposedAdvisorFeeWarning: inp.proposedAdvisorFee === 0,
    alreadyLowCostNotice:
      inp.currentAdvisorFee === 0 && inp.currentExpenseRatio < 0.002,
    shortHorizonWarning: years < 3,
    switchingCostExceedsDragWarning:
      inp.switchingCostEstimate > 0 && breakEvenYear === null,
  }
}
