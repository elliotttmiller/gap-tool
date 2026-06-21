/**
 * advisorSafeCopy.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of advisor-reviewed, compliance-sensitive UI copy used across
 * all risk modules. Components should reference strings from this file instead
 * of writing ad-hoc language.
 *
 * This tool is an illustrative gap-analysis system, not a recommendation engine.
 */

export const advisorSafeCopy = {
  illustrativeOnly:
    "This is an illustrative gap analysis and is not a formal financial recommendation. Results are based on assumptions entered and should be reviewed with a qualified financial professional.",

  life: {
    safeIncomeCoverage:
      "Safe Income Coverage models a target percentage of projected net income need, then calculates how much of that target is supported by entered death benefit/resources.",
    deathBenefitNeeded:
      "Additional Death Benefit Needed is the modeled target death benefit need minus entered resources. Present-value figures may be shown as reference items, but they do not drive the main fully-covered status.",
    netIncomeNote:
      "Income figures reflect modeled net income need after applying the income replacement ratio and any spouse income offset. Life insurance death benefits are generally income-tax-free; no gross-to-net conversion is applied to benefit amounts.",
    fullyCoveredNote:
      "Entered coverage resources appear sufficient to fund the modeled target income support stream. Review whenever income, coverage, or family circumstances change.",
  },

  liability: {
    wageGarnishmentDisclosure:
      "Wage Garnishment Risk uses a simplified disposable-earnings proxy: garnishment is applied to an estimated 65% of gross income. Actual garnishable earnings and garnishment limits vary by jurisdiction and case type. This figure is illustrative only.",
    umbrellaBlocks:
      "Umbrella coverage is commonly issued in $1M increments. Needed Umbrella rounds the remaining modeled coverage gap to the next whole $1M block.",
    illustrativeUmbrellaLabel:
      "Needed Umbrella",
    illustrativeUmbrellaDescription:
      "Remaining modeled coverage gap rounded to the next $1M umbrella policy block.",
    umbrellaNeededDescription:
      "Coverage gap rounded up to a $1M block.",
    notRecommendation:
      "Umbrella coverage levels shown are illustrative. Consult a licensed insurance professional for actual coverage guidance.",
  },

  unemployment: {
    dynamicTarget:
      "The ideal reserve target is 3–6 multiples of the monthly gap after remaining household income. The specific target depends on how much income would continue if the highest earner lost their job.",
    reserveBandExplanation: (months: number, coveragePct: number): string => {
      const pct = Math.round(coveragePct * 100)
      return `With remaining household income covering approximately ${pct}% of monthly expenses, an ideal emergency reserve of ${months} months is modeled.`
    },
    aboveTarget:
      "Reserves exceed the ideal target for this household's income concentration. Amounts above the ideal target may be candidates for higher-yielding accounts.",
    netIncomeProxy:
      "Remaining income is estimated using a 65% net income proxy. Actual net income varies by jurisdiction and tax situation.",
    minimumNote:
      "Three times the monthly gap is the baseline reserve threshold regardless of household income structure.",
    reserveDisclosure:
      "Reserve targets and search-period shortfall are illustrative estimates. Actual needs vary based on benefit eligibility, severance terms, and local cost of living.",
  },
} as const
