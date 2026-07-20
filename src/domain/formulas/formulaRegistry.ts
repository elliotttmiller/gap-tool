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
    description: "Projects annual net income need and calculates the percentage supported by entered coverage resources.",
    formulaText: "coveragePct = min(1, availableResources / PV(projectedNeedStream)); annualGap = max(0, projectedNeed - projectedNeed * coveragePct)",
    assumptions: ["incomeGrowthRate", "incomeReplacementRatio", "deathBenefitDiscountRate"],
    disclosure: "Death benefit needed is estimated from the present value of modeled annual income gaps.",
  },
  {
    id: "life-coverage-runway-withdrawal",
    module: "life",
    label: "Coverage Runway Withdrawal",
    description: "Grows the entered resource pool at the selected return, then attempts to fund each year's full projected net income need.",
    formulaText: "balance = balance * (1 + returnRate); annualWithdrawal = min(balance, projectedIncomeNeed); annualGap = max(0, projectedIncomeNeed - annualWithdrawal)",
    assumptions: ["coverageResources", "assetReturnRate", "projectionEndAge", "incomeGrowthRate"],
    disclosure: "This is an illustrative resource drawdown scenario; actual returns and available withdrawals will vary.",
  },
  {
    id: "disability-net-income-gap",
    module: "disability",
    label: "Net Disability Income Gap",
    description: "Compares projected net earned income with net group LTD and individual disability benefits. Individual DI is treated as COLA-included by default unless COLA is removed.",
    formulaText: "individualDIBenefit = monthlyIDI * 12 * COLAFactor; annualGap = max(0, annualIncome * 70% - netGroupLTD - individualDIBenefit)",
    assumptions: ["incomeGrowthRateAnnual", "ltdCoveragePercent", "ltdMonthlyCap", "ltdTaxable", "colaRate"],
  },
  {
    id: "disability-cola-removal",
    module: "disability",
    label: "Without COLA",
    description: "Shows the tradeoff without COLA: modeled premium is reduced by 20%, while projected individual DI benefit growth is excluded.",
    formulaText: "noColaPremium = enteredPremium * 80%; premiumSavings = enteredPremium * 20%; benefitGivenUp = projectedIDIWithCOLA - projectedIDIWithoutCOLA",
    assumptions: ["colaRate", "privateDiMonthlyPremium", "privateDiBenefitMonthly"],
  },
  {
    id: "disability-group-ltd",
    module: "disability",
    label: "Group LTD Benefit",
    description: "Applies the entered coverage percentage and monthly cap, then adjusts employer-paid taxable benefits to 70% net.",
    formulaText: "grossMonthlyLTD = min(annualIncome * coveragePct / 12, monthlyCap); netMonthlyLTD = taxable ? grossMonthlyLTD * 70% : grossMonthlyLTD",
    assumptions: ["ltdCoveragePercent", "ltdMonthlyCap", "ltdTaxable"],
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
    label: "Needed Umbrella",
    description: "Rounds the remaining coverage gap up to a purchasable umbrella policy block.",
    formulaText: "neededUmbrella = coverageGap > 0 ? ceil(coverageGap / umbrellaBlockSize) * umbrellaBlockSize : 0",
    assumptions: ["umbrellaBlockSize"],
  },
  {
    id: "unemployment-income-concentration-reserve",
    module: "unemployment",
    label: "Reserve Replacement Target",
    description: "Calculates the monthly expense replacement need after remaining household income, then compares current reserves against a 3-month minimum and 6-month ideal target.",
    formulaText: "monthlyGap = max(0, monthlyExpenses - remainingNetMonthlyIncome); minimumReserveTarget = monthlyGap * 3; idealReserveTarget = monthlyGap * 6",
    assumptions: ["netIncomeRatio", "minimumReserveMonths", "idealReserveMonths"],
  },
]
