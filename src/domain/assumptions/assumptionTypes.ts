export type GlobalPlanningAssumptions = {
  incomeGrowthRate: number
  netIncomeRatio: number
  presentValueTiming: "endOfYear"
}

export type LifeMethodologyAssumptions = GlobalPlanningAssumptions & {
  incomeReplacementRatio: number
  safeIncomeCoveragePct: number
  coverageRoi: number
  deathBenefitDiscountRate: number
}

export type LiabilityMethodologyAssumptions = {
  disposableIncomeRatio: number
  wageGarnishmentRate: number
  incomeGrowthRate: number
  umbrellaBlockSize: number
}

export type UnemploymentMethodologyAssumptions = {
  netIncomeRatio: number
  minimumReserveMonths: number
  reserveCoverageBands: {
    under33: number
    under50: number
    under67: number
    over67: number
  }
}
