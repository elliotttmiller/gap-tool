export type FormulaDefinition = {
  id: string
  module: "life" | "liability" | "unemployment" | "disability"
  label: string
  description: string
  formulaText: string
  assumptions: string[]
  disclosure?: string
}

export const advisorFormulaRegistry: FormulaDefinition[] = [
  {
    id: "life-annual-income-gap",
    module: "life",
    label: "Annual Income Gap Schedule",
    description: "Projects annual net income need to the selected end age and calculates modeled annual gaps.",
    formulaText: "annualGap = max(0, projectedNeed - availableCoverage)",
    assumptions: ["incomeGrowthRate", "incomeReplacementRatio", "safeIncomeCoveragePct", "deathBenefitDiscountRate"],
    disclosure: "Death benefit needed is estimated from the present value of modeled annual income gaps.",
  },
  {
    id: "liability-disposable-income-garnishment",
    module: "liability",
    label: "Wage Garnishment Exposure",
    description: "Projects potential wage exposure using a disposable-income proxy rather than gross income.",
    formulaText: "garnishableIncome = grossIncome * disposableIncomeRatio * wageGarnishmentRate",
    assumptions: ["disposableIncomeRatio", "wageGarnishmentRate", "incomeGrowthRate"],
  },
  {
    id: "liability-umbrella-blocks",
    module: "liability",
    label: "Illustrative Umbrella Coverage Level",
    description: "Rounds the modeled exposure level to common umbrella policy blocks.",
    formulaText: "coverageLevel = ceil(rawIllustrativeNeed / umbrellaBlockSize) * umbrellaBlockSize",
    assumptions: ["umbrellaBlockSize"],
  },
  {
    id: "unemployment-income-concentration-reserve",
    module: "unemployment",
    label: "Income Concentration Reserve Target",
    description: "Maps remaining household income coverage to a 3-6 month ideal reserve target.",
    formulaText: "remainingIncomeCoveragePct = remainingNetMonthlyIncome / monthlyExpenses",
    assumptions: ["netIncomeRatio", "minimumReserveMonths", "reserveCoverageBands"],
  },
]
