import type {
  GlobalPlanningAssumptions,
  LiabilityMethodologyAssumptions,
  LifeMethodologyAssumptions,
  UnemploymentMethodologyAssumptions,
} from "./assumptionTypes"

export const defaultGlobalPlanningAssumptions: GlobalPlanningAssumptions = {
  incomeGrowthRate: 0.03,
  netIncomeRatio: 0.65,
  presentValueTiming: "endOfYear",
}

export const defaultLifeMethodologyAssumptions: LifeMethodologyAssumptions = {
  ...defaultGlobalPlanningAssumptions,
  incomeReplacementRatio: 0.7,
  targetIncomeSupportPct: 0.85,
  coverageRoi: 0.06,
  deathBenefitDiscountRate: 0.05,
}

export const defaultLiabilityMethodologyAssumptions: LiabilityMethodologyAssumptions = {
  disposableIncomeRatio: 0.65,
  wageGarnishmentRate: 0.25,
  incomeGrowthRate: 0.03,
  umbrellaBlockSize: 1_000_000,
}

export const defaultUnemploymentMethodologyAssumptions: UnemploymentMethodologyAssumptions = {
  netIncomeRatio: 0.65,
  minimumReserveMonths: 3,
  reserveCoverageBands: {
    under33: 6,
    under50: 6,
    under67: 6,
    over67: 6,
  },
}
