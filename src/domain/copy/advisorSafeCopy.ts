/**
 * advisorSafeCopy.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of advisor-reviewed, compliance-sensitive UI copy used across
 * all risk modules. Components must reference strings from this file instead of
 * writing ad-hoc language.
 *
 * This tool is an illustrative gap-analysis system, NOT a recommendation engine.
 * Every user-facing string in this file must reflect that framing.
 */

export const advisorSafeCopy = {
  // ── Tool-level ──────────────────────────────────────────────────────────────
  illustrativeOnly:
    "This is an illustrative gap analysis and is not a formal financial recommendation. Results are based on assumptions entered and should be reviewed with a qualified financial professional.",

  // ── Life Insurance ──────────────────────────────────────────────────────────
  life: {
    safeIncomeCoverage:
      "Safe Income Coverage models the present value of income needed at the selected coverage percentage, growing at the income growth rate. The Death Benefit Needed is the additional coverage required beyond existing resources.",
    deathBenefitNeeded:
      "Death Benefit Needed is estimated from the present value of modeled annual income gaps discounted at the selected ROI. This is an illustrative capital-needs figure, not a formal recommendation.",
    netIncomeNote:
      "Income figures reflect net income need after applying the income replacement ratio and any spouse income offset. Life insurance death benefits are tax-free by law; no gross-to-net conversion is applied to benefit amounts.",
    fullyCoveredNote:
      "Existing coverage resources appear sufficient to fund the modeled income coverage target. Review whenever income, coverage, or family circumstances change.",
  },

  // ── Liability / Lawsuit ─────────────────────────────────────────────────────
  liability: {
    wageGarnishmentDisclosure:
      "Wage Garnishment Risk uses a simplified disposable-earnings proxy: garnishment is applied to an estimated 65% of gross income (approximating take-home pay after FICA and taxes). Actual garnishable earnings and garnishment limits vary by jurisdiction and case type. This figure is illustrative only.",
    umbrellaBlocks:
      "Umbrella coverage is commonly issued in $1M increments. This illustrative level rounds the modeled exposure gap to the next whole $1M block.",
    illustrativeUmbrellaLabel:
      "Illustrative Umbrella Coverage Level",
    illustrativeUmbrellaDescription:
      "Rounded to the next $1M umbrella policy block based on modeled household liability exposure.",
    umbrellaNeededDescription:
      "Illustrative Umbrella Coverage Level minus existing umbrella coverage. Umbrella policies are typically available in $1M blocks.",
    notRecommendation:
      "Umbrella coverage levels shown are illustrative. Consult a licensed insurance professional for actual coverage recommendations.",
  },

  // ── Unemployment ─────────────────────────────────────────────────────────────
  unemployment: {
    dynamicTarget:
      "The ideal reserve target is 3–6 months of household expenses. The specific target depends on how much remaining household income would continue if the highest earner lost their job.",
    reserveBandExplanation: (months: number, coveragePct: number): string => {
      const pct = Math.round(coveragePct * 100)
      return `With remaining household income covering approximately ${pct}% of monthly expenses, an ideal emergency reserve of ${months} months is modeled.`
    },
    aboveTarget:
      "Reserves exceed the ideal target for this household's income concentration. Amounts above the ideal target may be candidates for higher-yielding accounts.",
    netIncomeProxy:
      "Remaining income is estimated using a 65% net income proxy (approximate take-home pay after taxes and FICA). Actual net income varies by jurisdiction and tax situation.",
    minimumNote:
      "A minimum of 3 months of household expenses is the baseline reserve threshold regardless of household income structure.",
    reserveDisclosure:
      "Reserve targets and search-period shortfall are illustrative estimates. Actual needs vary based on benefit eligibility, severance terms, and local cost of living.",
  },
} as const
