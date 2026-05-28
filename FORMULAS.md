# Formula Reference — NorthStar GAP Tool

This document is the authoritative reference for every formula used in metric cards and visualizations across all modules of the NorthStar GAP Tool. Formulas are organized by module, then by metric or visualization. Each entry includes the exact expression used in the code, the name of the metric or visualization it powers, a plain-language description of what it computes, and the module where it appears.

> **Audience:** This document is intended for both technical developers and non-technical advisors and stakeholders who want to understand how every displayed number is derived.

---

## Table of Contents

1. [Life Insurance Module](#1-life-insurance-module)
   - [1.1 Core Gap Calculator](#11-core-gap-calculator-calculatelifeinsurancegapts)
   - [1.2 Income Gap Scenarios](#12-income-gap-scenarios-calculateincomegapscenariorsts)
2. [Disability Insurance Module](#2-disability-insurance-module)
   - [2.1 Core Gap Calculator](#21-core-gap-calculator-calculatedisabilitygapts)
   - [2.2 Break-Even / Premium vs. Self-Insured Calculator](#22-break-even--premium-vs-self-insured-calculator)
   - [2.3 Premium vs. Self-Insured — Retirement Projection Cards](#23-premium-vs-self-insured--retirement-projection-cards)
   - [2.4 Savings Bridge (Elimination Period) Calculator](#24-savings-bridge-elimination-period-calculator)
   - [2.5 SSDI Benefit Estimator](#25-ssdi-benefit-estimator)
   - [2.6 LTD Benefit Taxation Calculator](#26-ltd-benefit-taxation-calculator)
   - [2.7 Job Comparison Module](#27-job-comparison-module)
3. [Liability Module](#3-liability-module)
4. [Unemployment Module](#4-unemployment-module)

---

## 1. Life Insurance Module

### 1.1 Core Gap Calculator (`calculateLifeInsuranceGap.ts`)

This calculator quantifies how much of a family's projected income would be left uncovered if the primary earner died today. It produces the headline metric cards on the Life Insurance output view.

---

#### Years to Retirement

```
yearsToRetirement = retirementAge - currentAge
```

- **Metric / Visualization:** Used as the planning horizon for all life gap projections.
- **Description:** The number of years from the client's current age to their target retirement age. All income and coverage projections are computed over this window.
- **Module:** Life Insurance

---

#### Annual Client Need

```
annualClientNeed = annualIncome × incomeReplacementRatio
```

- **Metric / Visualization:** Annual Income Need (metric card)
- **Description:** Scales the client's gross annual income by the desired income-replacement ratio (e.g. 0.80 = 80%) to produce the yearly dollar amount the survivor family would need to maintain their lifestyle.
- **Module:** Life Insurance

---

#### Annual Replacement Need

```
annualReplacementNeed = max(0, annualClientNeed - spouseAnnualIncome)
```

- **Metric / Visualization:** Annual Replacement Need (metric card)
- **Description:** Offsets the annual client need by the surviving spouse's independent income. This prevents double-counting income that would still exist after the client's death.
- **Module:** Life Insurance

---

#### Future Income Lost (Present Value Mode)

```
futureIncomeLost = Σ_{year=1}^{replacementYears}
    annualReplacementNeed × (1 + incomeGrowthRate)^year
    ─────────────────────────────────────────────────
               (1 + discountRate)^year
```

- **Metric / Visualization:** Future Income Lost (metric card)
- **Description:** When the "use present value" assumption is enabled, each future year's replacement need is grown by the income growth rate and then discounted back to today's dollars using the discount rate. Summing those present values gives a lump-sum equivalent of all future replacement income in today's dollars.
- **Module:** Life Insurance

---

#### Future Income Lost (Simple Mode)

```
futureIncomeLost = annualReplacementNeed × replacementYears
```

- **Metric / Visualization:** Future Income Lost (metric card, simple mode)
- **Description:** When present-value discounting is disabled, the formula simply multiplies the constant annual replacement need by the number of replacement years — equivalent to assuming zero growth and zero discount rate.
- **Module:** Life Insurance

---

#### Base Protection Need

```
baseProtectionNeed = futureIncomeLost
                   + debtsTotal
                   + educationGoal
                   + finalExpenses
```

- **Metric / Visualization:** Base Protection Need / Total Death Benefit Need (metric card)
- **Description:** Adds outstanding debts, education funding goals, and estimated final expenses to the income-replacement component. This is the total lump sum the death benefit must provide to fully protect the household.
- **Module:** Life Insurance

---

#### Existing Coverage Total

```
existingCoverageTotal = groupLifeCoverage + privateLifeCoverage
```

- **Metric / Visualization:** Existing Coverage (metric card)
- **Description:** Sums group life (employer-provided) and privately owned life insurance policies to arrive at the total death benefit the client currently holds.
- **Module:** Life Insurance

---

#### Available Resources

```
availableResources = existingCoverageTotal + liquidAssetOffset
```

- **Metric / Visualization:** Available Resources (metric card)
- **Description:** When the "include liquid assets" assumption is enabled, any liquid assets allocated to life protection are added on top of insurance coverage. This represents the full pool of resources available to the survivor.
- **Module:** Life Insurance

---

#### Remaining Gap

```
remainingGap = max(0, baseProtectionNeed - availableResources)
```

- **Metric / Visualization:** Coverage Gap / Remaining Gap (headline metric card)
- **Description:** The shortfall between what the household needs and what is currently in place. A positive value indicates the family is underinsured; zero means they are fully covered.
- **Module:** Life Insurance

---

#### Coverage Offset Percentage

```
coverageOffsetPercentage = availableResources ÷ baseProtectionNeed
```

- **Metric / Visualization:** Coverage Ratio (metric card)
- **Description:** Expresses what fraction of the total protection need is already funded by existing resources. A value below 1.0 (100%) means a gap exists.
- **Module:** Life Insurance

---

#### Annuity Payment (Death Benefit Income Yield)

```
annuityPayment = presentValue × annualRate
                 ─────────────────────────────
                 1 − (1 + annualRate)^(−years)

  When annualRate = 0:
annuityPayment = presentValue ÷ years
```

- **Metric / Visualization:** Annual Income from Group Life / Annual Income from Private Life (metric cards)
- **Description:** Converts a lump-sum death benefit into the equivalent level annual income stream it can sustain over the coverage period, assuming a given income-yield rate (default 5%). This is the standard ordinary-annuity payment formula (PMT given PV, i, n).
- **Module:** Life Insurance

---

#### Group Life Annual Income

```
groupLifeAnnualIncome = annuityPayment(groupLifeCoverage, incomeYieldRate, groupLifeCoverageYears)
```

- **Metric / Visualization:** Group Life Annual Income (metric card, yearly breakdown chart)
- **Description:** The level annual income stream the group life death benefit could generate for the survivor, computed using the annuity payment formula above.
- **Module:** Life Insurance

---

#### Private Life Annual Income

```
privateLifeAnnualIncome = annuityPayment(privateLifeCoverage, incomeYieldRate, privateLifeCoverageYears)
```

- **Metric / Visualization:** Private Life Annual Income (metric card, yearly breakdown chart)
- **Description:** Same as the group life calculation, but applied to the private (individually owned) policy's death benefit and its term length (or full horizon for permanent policies).
- **Module:** Life Insurance

---

#### Projected Income (per year)

```
projectedIncome[year] = annualIncome × (1 + incomeGrowthRate)^year
```

- **Metric / Visualization:** Yearly Breakdown Chart (income bar)
- **Description:** Projects the client's current income forward year by year using compound growth. Each year's bar height in the income gap chart reflects this growing income need.
- **Module:** Life Insurance

---

#### Survivor Gap (per year)

```
survivorGap[year] = max(0,
    projectedIncome[year] − gliCovered[year] − privateCovered[year])
```

- **Metric / Visualization:** Survivor Gap (yearly breakdown chart, red area)
- **Description:** In each projection year, the portion of the projected income not covered by either the group or private life annuity stream. Uncovered years are shown as the gap bars in the income coverage chart.
- **Module:** Life Insurance

---

#### Cumulative Survivor Gap

```
cumulativeSurvivorGap = Σ survivorGap[year]   (for all years to retirement)
```

- **Metric / Visualization:** Cumulative Survivor Gap (headline metric card)
- **Description:** The total dollar amount of income the survivor would go without over the entire pre-retirement period if no additional coverage is added.
- **Module:** Life Insurance

---

#### Lifetime Income Uncovered Percentage

```
lifetimeIncomeUncoveredPercentage = cumulativeSurvivorGap ÷ projectedIncomeToRetirement
```

- **Metric / Visualization:** % Income Uncovered (metric card)
- **Description:** The fraction of total projected lifetime income (from today to retirement) that would not be replaced by existing coverage. Provides an at-a-glance risk severity indicator.
- **Module:** Life Insurance

---

### 1.2 Income Gap Scenarios (`calculateIncomeGapScenarios.ts`)

This calculator drives the two Income Gap Analysis panels on the Life Insurance page — "Safe Withdrawal Rate" (Module 1) and "Max Withdrawal Rate" (Module 2).

---

#### Coverage Funding Base

```
coverageFundingBase = groupLifeCoverage + privateLifeCoverage + nonQualifiedAssets
```

- **Metric / Visualization:** Both Income Gap modules (funding pool)
- **Description:** The total investable pool of resources available to the survivor: life insurance death benefits plus any non-qualified (taxable) assets the client has designated for this purpose.
- **Module:** Life Insurance — Income Gap Analysis

---

#### Annual Net Income Need

```
annualNetIncomeNeed = max(0, annualIncome × incomeReplacementRatio − spouseAnnualIncome)
```

- **Metric / Visualization:** Projected Income bar in both modules
- **Description:** The survivor's net annual income need after accounting for the spouse's own income. Life insurance death benefits are tax-free by law, so no gross-to-net conversion is applied here.
- **Module:** Life Insurance — Income Gap Analysis

---

#### Projected Net Income (per year)

```
projectedNetIncome[year] = annualNetIncomeNeed × (1 + incomeGrowthRate)^year
```

- **Metric / Visualization:** Income bars in both module charts
- **Description:** Grows the net income need forward at the assumed income growth rate to account for inflation and lifestyle cost increases over time.
- **Module:** Life Insurance — Income Gap Analysis

---

#### Module 1 — Payout Annuity Withdrawal (Safe Withdrawal Rate)

```
annualSafeWD = coverageFundingBase × safeWithdrawalRate
               ─────────────────────────────────────────
               1 − (1 + safeWithdrawalRate)^(−yearsToRetirement)

  When safeWithdrawalRate = 0:
annualSafeWD = coverageFundingBase ÷ yearsToRetirement
```

- **Metric / Visualization:** Module 1 — Annual Safe Withdrawal (flat bars in chart, metric card)
- **Description:** The level annual income the survivor can draw from the coverage funding base over the full retirement horizon, assuming the fund is invested at the safe withdrawal rate and is fully depleted at retirement. This is the standard ordinary-annuity (payout annuity) payment formula.
- **Module:** Life Insurance — Income Gap Analysis (Module 1)

---

#### Module 1 — Total Income Replaced

```
m1TotalReplaced = annualSafeWD × yearsToRetirement
```

- **Metric / Visualization:** Module 1 — Total Income Replaced (metric card)
- **Description:** The aggregate income the survivor would receive under the safe-withdrawal scenario across all years to retirement.
- **Module:** Life Insurance — Income Gap Analysis (Module 1)

---

#### Module 1 — Survivor Gap

```
m1SurvivorGap = max(0, projectedNetIncomeTotal − m1TotalReplaced)
```

- **Metric / Visualization:** Module 1 — Survivor Gap (metric card)
- **Description:** The total income shortfall under Module 1's flat-draw approach — the cumulative amount by which the survivor's actual income need exceeds what the safe-withdrawal annuity provides.
- **Module:** Life Insurance — Income Gap Analysis (Module 1)

---

#### Module 2 — Max Withdrawal (Aggressive Draw-Down)

```
// Each year:
module2Balance = module2Balance × (1 + maxWithdrawalRate)   // grow at ROI
maxCovered     = min(module2Balance, projectedNetIncome)     // cover up to full need
module2Balance = max(0, module2Balance − maxCovered)         // reduce balance
```

- **Metric / Visualization:** Module 2 — Green (covered) / Red (gap) bars in chart
- **Description:** In Module 2 the coverage fund is invested aggressively (at `maxWithdrawalRate` as annual ROI). Each year the fund grows first, then the survivor draws the full projected income need. The fund continues this cycle until it is exhausted. Years fully covered are shown green; years with insufficient balance are shown red.
- **Module:** Life Insurance — Income Gap Analysis (Module 2)

---

#### Present Value of Level Gap (Death Benefit Needed — both modules)

```
annualGap = survivorGap ÷ yearsToRetirement
DB_Needed = annualGap × (1 − (1 + roi)^(−yearsToRetirement))
            ─────────────────────────────────────────────────
                               roi

  When roi = 0:
DB_Needed = survivorGap
```

- **Metric / Visualization:** Death Benefit Needed (Box 5 metric card in both modules)
- **Description:** Converts the cumulative survivor gap into an equivalent level-annual gap and then discounts that annuity back to a present-value lump sum. This is the death benefit the client would need to purchase today to fully eliminate the gap. Equivalent to Excel `PV(rate, nper, payment, 0, 0)`.
- **Module:** Life Insurance — Income Gap Analysis (both modules)

---

## 2. Disability Insurance Module

### 2.1 Core Gap Calculator (`calculateDisabilityGap.ts`)

This calculator drives the headline metric cards and the income projection chart on the Disability output view.

---

#### LTD Monthly Gross Benefit

```
ltdMonthlyGross = min(annualIncome × coveragePercent ÷ 12, monthlyCap)

  When coveragePercent = 0:
ltdMonthlyGross = 0
```

- **Metric / Visualization:** LTD Monthly Benefit (metric card)
- **Description:** Converts the group LTD coverage percentage (e.g. 60%) applied to the client's annual income into a monthly benefit, then applies the policy's monthly benefit cap. This is the gross benefit before any tax adjustment.
- **Module:** Disability Insurance

---

#### LTD Net Monthly Benefit

```
ltdNetMonthly = ltdMonthlyGross × 0.70    (when LTD is taxable)
ltdNetMonthly = ltdMonthlyGross            (when LTD is not taxable)
```

- **Metric / Visualization:** LTD Net Monthly Benefit (metric card)
- **Description:** When employer-paid premiums make LTD benefits taxable, the tool applies a simplified 30% effective tax haircut to approximate the after-tax monthly benefit. This is a conservative estimate; the [LTD Benefit Tax Calculator](#26-ltd-benefit-taxation-calculator) provides a more precise figure.
- **Module:** Disability Insurance

---

#### Total Net Monthly Benefit

```
totalNetMonthly = ltdNetMonthly + privateDiMonthly
```

- **Metric / Visualization:** Total Net Monthly Benefit (metric card)
- **Description:** The combined after-tax monthly benefit the client would receive from both group LTD and their individual disability income (IDI/private DI) policy if disabled today.
- **Module:** Disability Insurance

---

#### Income Loss (Net) at Onset

```
incomeLossNet = (annualIncome × 0.70 ÷ 12) − totalNetMonthly
```

- **Metric / Visualization:** Monthly Income Loss (metric card)
- **Description:** The immediate monthly shortfall the client would face at disability onset — comparing their current after-tax take-home monthly income against the combined net disability benefit. A positive value means they would lose that many dollars per month.
- **Module:** Disability Insurance

---

#### Annual Income at Age (Projection)

```
annualIncomeAtAge[year] = annualIncome × (1 + growthRate)^year
```

- **Metric / Visualization:** Income Projection Chart (total income bar)
- **Description:** Projects the client's income forward year-over-year using compound growth, providing the growing income benchmark against which disability coverage is compared.
- **Module:** Disability Insurance

---

#### Annual Net Income at Age

```
annualIncomeNetAtAge[year] = annualIncomeAtAge[year] × 0.70
```

- **Metric / Visualization:** Income Projection Chart (net income line)
- **Description:** Applies a uniform 30% effective tax rate to produce the projected after-tax ("take-home") income at each age. Disability benefits are compared against this net figure.
- **Module:** Disability Insurance

---

#### LTD Annual Benefit at Age (Projected)

```
ltdGrossAtAge  = min(annualIncomeAtAge × coveragePercent ÷ 12, monthlyCap) × 12
ltdNetAtAge    = ltdGrossAtAge × 0.70    (if taxable)
ltdNetAtAge    = ltdGrossAtAge           (if not taxable)
ltdAnnualBenefit = ltdNetAtAge × 12
```

- **Metric / Visualization:** Income Projection Chart (group LTD coverage band)
- **Description:** Re-applies the LTD formula each year against the grown income, reflecting that group LTD tracks the client's current salary. The annual benefit is the monthly figure annualised.
- **Module:** Disability Insurance

---

#### Individual DI Annual Benefit at Age

```
individualDIAnnualBenefit[year] = privateDiMonthly × 12    (if policy is active)
individualDIAnnualBenefit[year] = 0                         (after policy end age)
```

- **Metric / Visualization:** Income Projection Chart (IDI coverage band)
- **Description:** The individual DI benefit is a fixed monthly dollar amount. It remains constant until the benefit period end age, then drops to zero. This distinguishes IDI from group LTD (which scales with salary).
- **Module:** Disability Insurance

---

#### Annual Income Gap at Age

```
annualGap[year] = max(0, annualIncomeNetAtAge[year] − ltdAnnualBenefit[year] − individualDIAnnualBenefit[year])
```

- **Metric / Visualization:** Income Projection Chart (gap area)
- **Description:** The unprotected portion of net income at each age — what the client would go without if disabled for a full year at that point in their career.
- **Module:** Disability Insurance

---

#### Total Projected Income (to Retirement)

```
totalProjectedIncome = Σ annualIncomeNetAtAge[year]   (all years to retirement)
```

- **Metric / Visualization:** Total Projected Income (metric card)
- **Description:** The aggregate after-tax income the client is expected to earn between now and retirement if they remain healthy. This is the "at-stake" income figure.
- **Module:** Disability Insurance

---

#### Total Group LTD Coverage (Cumulative)

```
totalGroupLTDCoverage = Σ ltdAnnualBenefit[year]   (all years to retirement)
```

- **Metric / Visualization:** Total Group LTD Coverage (metric card)
- **Description:** The sum of all projected annual group LTD benefits across the planning horizon if the client were disabled for the entire period.
- **Module:** Disability Insurance

---

#### Total Individual DI Coverage (Cumulative)

```
totalIndividualDICoverage = Σ individualDIAnnualBenefit[year]   (all years to retirement)
```

- **Metric / Visualization:** Total IDI Coverage (metric card)
- **Description:** Cumulative individual DI benefits over the planning horizon.
- **Module:** Disability Insurance

---

#### Total Coverage

```
totalCoverage = totalGroupLTDCoverage + totalIndividualDICoverage
```

- **Metric / Visualization:** Total Coverage (metric card)
- **Description:** Combined group LTD and IDI coverage across the full planning horizon.
- **Module:** Disability Insurance

---

#### Total Gap (Cumulative)

```
totalGap = Σ annualGap[year]   (all years to retirement)
```

- **Metric / Visualization:** Total Income Gap (headline metric card)
- **Description:** The cumulative unprotected income across the entire working lifetime — the maximum financial exposure from a permanent disability.
- **Module:** Disability Insurance

---

#### Average Coverage Rate

```
averageCoverageRate = totalCoverage ÷ totalProjectedIncome
```

- **Metric / Visualization:** Coverage Rate (metric card)
- **Description:** What fraction of projected lifetime after-tax income is covered by disability benefits, on average. Provides a single-number efficiency metric for the client's disability protection.
- **Module:** Disability Insurance

---

#### Lifetime IDI Expense

```
lifetimeIDIExpense = privateDiMonthlyPremium × (yearsToRetirement × 12)
```

- **Metric / Visualization:** Lifetime IDI Expense (metric card)
- **Description:** The total cost of maintaining the individual DI policy until retirement, calculated as the fixed monthly premium times the number of months remaining to retirement.
- **Module:** Disability Insurance

---

### 2.2 Break-Even / Premium vs. Self-Insured Calculator

Source: `calculateBreakEven.ts` and `BreakEvenCalculator.tsx`

This calculator answers the question: "How long would a client need to invest their premium payments before accumulating an amount equal to the insurance benefit they would receive at disability onset?"

---

#### Monthly Rate of Return

```
monthlyRateOfReturn = annualRateOfReturn ÷ 12
```

- **Metric / Visualization:** Break-Even Analysis inputs
- **Description:** Converts the advisor-entered annual rate of return to a monthly compounding rate used in all schedule and break-even calculations.
- **Module:** Disability — Break-Even Calculator

---

#### Monthly Return Factor

```
monthlyReturnFactor = 1 + monthlyRateOfReturn
```

- **Metric / Visualization:** Investment Schedule (chart)
- **Description:** The multiplicative growth factor applied to the self-insurance fund balance at the end of each month.
- **Module:** Disability — Break-Even Calculator

---

#### Benefits Received (VLOOKUP Equivalent)

```
benefitsReceived = monthlyBenefit × min(monthsWithoutIncome, 80)
```

- **Metric / Visualization:** Benefits Received (metric card)
- **Description:** Mirrors the Excel workbook VLOOKUP against the benefit table (capped at 80 months). Represents the total insurance payout the client would receive for a disability lasting `monthsWithoutIncome` months. The 80-month cap reflects the lookup table boundary.
- **Module:** Disability — Break-Even Calculator

---

#### Self-Insurance Investment Balance (per month)

```
investmentBalance[month] = (investmentBalance[month-1] + monthlyPremium) × monthlyReturnFactor
```

- **Metric / Visualization:** Self-Insurance Fund chart line
- **Description:** Simulates investing each month's premium payment into a side fund that earns the assumed rate of return, compounded monthly. The fund balance at any month represents how much the client would have accumulated through self-insuring.
- **Module:** Disability — Break-Even Calculator

---

#### Break-Even Months (NPER Equivalent)

```
breakEvenMonths = log((monthlyPremium + benefitsReceived × monthlyRateOfReturn)
                      ÷ monthlyPremium)
                  ─────────────────────────────────────────────────────────────
                                   log(1 + monthlyRateOfReturn)

  When monthlyRateOfReturn = 0:
breakEvenMonths = benefitsReceived ÷ monthlyPremium
```

- **Metric / Visualization:** Break-Even Month (headline metric card)
- **Description:** Computes the exact number of months the client would need to self-insure before the accumulated fund matches the insurance benefit. Mirrors the Excel `NPER(rate, pmt, pv, fv)` function. A shorter break-even means insurance is more cost-efficient relative to self-insuring.
- **Module:** Disability — Break-Even Calculator

---

#### Break-Even Years

```
breakEvenYears = breakEvenMonths ÷ 12
```

- **Metric / Visualization:** Break-Even Year (metric card)
- **Description:** Converts the break-even month count to years for more intuitive communication with clients.
- **Module:** Disability — Break-Even Calculator

---

#### Total Premiums to Break-Even

```
totalPremiumsToBreakEven = monthlyPremium × breakEvenMonths
```

- **Metric / Visualization:** Total Premiums Paid (metric card)
- **Description:** The total cumulative premium outlay required for the self-insurance fund to match the insurance benefit — illustrating the "cost" of the self-insured alternative.
- **Module:** Disability — Break-Even Calculator

---

### 2.3 Premium vs. Self-Insured — Retirement Projection Cards

Source: `PremiumVsSelfInsuredModule.tsx`

These three cards show the long-run cost of paying premiums vs. the opportunity cost of investing those premiums instead.

---

#### Future Value of Investing the Premium (FV of Annuity)

```
investedPremiumFV = monthlyPremium × ((1 + r/12)^n − 1)
                    ─────────────────────────────────────
                                  r/12

  Where:
    r = annualRateOfReturn
    n = yearsToRetirement × 12

  When r = 0:
investedPremiumFV = monthlyPremium × n
```

- **Metric / Visualization:** Card A — "What premium investments would be worth at retirement"
- **Description:** Computes the future value of investing each monthly premium payment into a side account compounding at the selected rate of return until retirement. This is the standard future-value of an ordinary annuity (end-of-period payment) formula.
- **Module:** Disability — Premium vs. Self-Insured

---

#### Months of Coverage the Fund Could Purchase

```
monthsOfCoverage = investedPremiumFV ÷ monthlyBenefit
```

- **Metric / Visualization:** Card B — "Months of disability benefit the fund could fund"
- **Description:** Divides the hypothetical future retirement fund by the monthly disability benefit to show how many months of equivalent disability income the self-insured fund could support.
- **Module:** Disability — Premium vs. Self-Insured

---

#### Years of Coverage

```
yearsOfCoverage = monthsOfCoverage ÷ 12
```

- **Metric / Visualization:** Card C — "Years of disability coverage"
- **Description:** Converts the months figure to years for readability.
- **Module:** Disability — Premium vs. Self-Insured

---

### 2.4 Savings Bridge (Elimination Period) Calculator

Source: `calculateSavingsBridge.ts`

Models how quickly a client's liquid savings are depleted during the LTD elimination (waiting) period — the gap between disability onset and the first benefit payment.

---

#### Elimination Period in Months

```
eliminationPeriodMonths = eliminationPeriodDays ÷ 30.4375
```

- **Metric / Visualization:** Elimination Period (display)
- **Description:** Converts the elimination period from calendar days to months using the average days-per-month constant (365.25 ÷ 12 = 30.4375).
- **Module:** Disability — Savings Bridge

---

#### Income Lost During Elimination

```
incomeLostDuringElimination = monthlyTakeHomeIncome × eliminationPeriodMonths
```

- **Metric / Visualization:** Income Lost During Elimination (metric card)
- **Description:** The total after-tax income the client loses during the waiting period before benefits begin.
- **Module:** Disability — Savings Bridge

---

#### Total Savings Needed

```
totalSavingsNeeded = monthlyExpenses × eliminationPeriodMonths
```

- **Metric / Visualization:** Savings Needed to Bridge Gap (metric card)
- **Description:** Since earned income drops to zero during the elimination period, the client must fund all expenses from savings. This is simply the monthly expense burn rate times the length of the waiting period.
- **Module:** Disability — Savings Bridge

---

#### Daily Burn Rate

```
dailyBurnRate = monthlyExpenses ÷ 30.4375
```

- **Metric / Visualization:** Daily Expense Burn Rate (metric card)
- **Description:** Converts monthly expenses to a daily rate, useful for illustrating the real-time depletion speed to clients.
- **Module:** Disability — Savings Bridge

---

#### Savings Shortfall / Savings Remaining

```
savingsRemaining  = max(0, liquidSavings − totalSavingsNeeded)
savingsShortfall  = max(0, totalSavingsNeeded − liquidSavings)
```

- **Metric / Visualization:** Savings Shortfall / Savings Remaining (metric cards)
- **Description:** If savings exceed the total needed to bridge the elimination period, the remainder is available after LTD kicks in. If they fall short, the shortfall represents the gap the client cannot fund.
- **Module:** Disability — Savings Bridge

---

#### Savings Runway (Months)

```
savingsRunwayMonths = liquidSavings ÷ monthlyExpenses
```

- **Metric / Visualization:** Savings Runway (metric card)
- **Description:** How many months the client's liquid savings would last if they had to fund all expenses from savings with no income or benefits.
- **Module:** Disability — Savings Bridge

---

#### Ongoing Monthly Gap (Post-Bridge)

```
ongoingMonthlyGap = max(0, monthlyExpenses − monthlyLtdBenefit)
```

- **Metric / Visualization:** Ongoing Monthly Gap After LTD Begins (metric card)
- **Description:** Once LTD benefits begin, this is the remaining monthly expense shortfall not covered by the LTD benefit — the amount the client would still need to fund from savings or other sources.
- **Module:** Disability — Savings Bridge

---

#### Post-Bridge Savings Runway

```
postBridgeSavingsRunwayMonths = savingsRemaining ÷ ongoingMonthlyGap
  (= ∞ when ongoingMonthlyGap = 0; = 0 when savingsRemaining = 0)
```

- **Metric / Visualization:** Post-Bridge Savings Runway (metric card)
- **Description:** How many additional months the remaining savings (after the bridge) would cover the ongoing post-LTD monthly gap.
- **Module:** Disability — Savings Bridge

---

### 2.5 SSDI Benefit Estimator

Source: `calculateSsdi.ts`

Implements the Social Security Administration's Primary Insurance Amount (PIA) formula using 2025 bend points to estimate what a client would receive from Social Security Disability Insurance.

---

#### Estimated AIME (Proxy)

```
estimatedAime = round(careerAvgAnnualIncome ÷ 12)
```

- **Metric / Visualization:** Estimated AIME (input/display)
- **Description:** The Average Indexed Monthly Earnings (AIME) is the SSA's measure of career earnings. This tool approximates it as the client's career-average annual income divided by 12. The actual SSA calculation uses a full lifetime earnings record.
- **Module:** Disability — SSDI Estimator

---

#### PIA — Tier 1 (90% Tier)

```
tier1 = 0.90 × min(estimatedAime, 1,226)   [2025 first bend point]
```

- **Metric / Visualization:** PIA Breakdown Waterfall (Tier 1 bar)
- **Description:** The first segment of the PIA formula credits 90 cents for each dollar of AIME up to the first bend point ($1,226 in 2025), providing the most generous replacement rate for lower earners.
- **Module:** Disability — SSDI Estimator

---

#### PIA — Tier 2 (32% Tier)

```
tier2 = 0.32 × max(0, min(estimatedAime, 7,391) − 1,226)
  [2025 bend points: $1,226 and $7,391]
```

- **Metric / Visualization:** PIA Breakdown Waterfall (Tier 2 bar)
- **Description:** The middle segment credits 32 cents for each dollar of AIME between the first and second bend points ($1,226–$7,391 in 2025).
- **Module:** Disability — SSDI Estimator

---

#### PIA — Tier 3 (15% Tier)

```
tier3 = 0.15 × max(0, estimatedAime − 7,391)
```

- **Metric / Visualization:** PIA Breakdown Waterfall (Tier 3 bar)
- **Description:** The upper segment credits only 15 cents for each dollar of AIME above the second bend point — the lowest replacement rate, applying to higher earners.
- **Module:** Disability — SSDI Estimator

---

#### Estimated PIA

```
estimatedPia = round(tier1 + tier2 + tier3, nearest $0.10)
```

- **Metric / Visualization:** Estimated PIA (metric card)
- **Description:** Sums the three tier amounts and rounds to the nearest $0.10 per SSA convention, producing the Primary Insurance Amount.
- **Module:** Disability — SSDI Estimator

---

#### Estimated Monthly SSDI Benefit

```
estimatedMonthlyBenefit = min(estimatedPia, 3,822)   [2025 statutory cap]
```

- **Metric / Visualization:** Estimated Monthly SSDI (headline metric card)
- **Description:** Applies the 2025 statutory maximum monthly SSDI benefit cap ($3,822) to the PIA.
- **Module:** Disability — SSDI Estimator

---

#### SSDI Replacement Rate (Gross)

```
replacementRateGross = estimatedMonthlyBenefit ÷ (annualIncomeAtDisability ÷ 12)
```

- **Metric / Visualization:** SSDI Replacement Rate (metric card)
- **Description:** Expresses SSDI as a percentage of the client's gross monthly income at disability onset, showing how much of their income Social Security would actually replace.
- **Module:** Disability — SSDI Estimator

---

#### SSDI Monthly Gap

```
monthlyGap = max(0, monthlyIncomeAtDisability − estimatedMonthlyBenefit)
```

- **Metric / Visualization:** SSDI Monthly Gap (metric card)
- **Description:** The portion of pre-disability monthly income not covered by SSDI — the amount the client would need private disability insurance to protect.
- **Module:** Disability — SSDI Estimator

---

#### SSDI Waiting Period Income Loss

```
waitingPeriodIncomeLoss = (annualIncomeAtDisability ÷ 12) × 5
```

- **Metric / Visualization:** 5-Month Waiting Period Loss (metric card)
- **Description:** The SSA requires a 5-month waiting period before SSDI benefits begin. This formula quantifies the total income lost during that waiting window at the client's current monthly income rate.
- **Module:** Disability — SSDI Estimator

---

### 2.6 LTD Benefit Taxation Calculator

Source: `calculateBenefitTax.ts`

Calculates the real after-tax value of a group LTD benefit using 2025 federal income tax brackets and an optional state tax rate.

---

#### Pre-Disability After-Tax Annual Income

```
preTaxableIncome      = max(0, annualIncome − standardDeduction)
preFederalTax         = piecewise bracket tax on preTaxableIncome
preStateIncomeTax     = annualIncome × stateTaxRate
preTaxAnnualIncome    = annualIncome − preFederalTax − preStateIncomeTax
preTaxMonthlyIncome   = preTaxAnnualIncome ÷ 12
```

- **Metric / Visualization:** Pre-Disability After-Tax Income (comparison metric cards)
- **Description:** Calculates the client's current after-tax take-home pay by applying 2025 federal brackets (after the standard deduction) plus the applicable state tax rate. This is the income baseline used for the net replacement rate.
- **Module:** Disability — LTD Benefit Tax Calculator

---

#### Federal Tax on LTD Benefit

```
ltdTaxableAfterDeduction  = max(0, annualGrossBenefit − standardDeduction)
  (= 0 when employer did NOT pay the premium, i.e. benefits are tax-free)
federalTaxOnBenefit       = piecewise bracket tax on ltdTaxableAfterDeduction
```

- **Metric / Visualization:** Federal Tax on Benefit (metric card)
- **Description:** When the employer pays the LTD premium (the vast majority of group plans), benefits are treated as ordinary income. The tax is computed under the assumption that LTD income is the client's sole income during disability (after the standard deduction).
- **Module:** Disability — LTD Benefit Tax Calculator

---

#### State Tax on LTD Benefit

```
stateTaxOnBenefit = federalTaxableBenefitAnnual × stateTaxRate
```

- **Metric / Visualization:** State Tax on Benefit (metric card)
- **Description:** Applies a flat state income tax rate to the gross benefit amount (0 for states with no income tax).
- **Module:** Disability — LTD Benefit Tax Calculator

---

#### Total Tax on Benefit

```
totalTaxOnBenefit = federalTaxOnBenefit + stateTaxOnBenefit
```

- **Metric / Visualization:** Total Tax on Benefit (metric card)
- **Description:** The combined federal and state tax the client would owe on their LTD benefit income.
- **Module:** Disability — LTD Benefit Tax Calculator

---

#### Net Monthly / Annual LTD Benefit

```
netAnnualBenefit  = annualGrossBenefit − totalTaxOnBenefit
netMonthlyBenefit = netAnnualBenefit ÷ 12
```

- **Metric / Visualization:** Net Monthly LTD Benefit (headline metric card)
- **Description:** The actual after-tax monthly income the client would receive from their LTD policy — what they can actually spend during a disability claim.
- **Module:** Disability — LTD Benefit Tax Calculator

---

#### Effective Tax Rate on Benefit

```
effectiveTaxRateOnBenefit = totalTaxOnBenefit ÷ annualGrossBenefit
```

- **Metric / Visualization:** Effective Tax Rate (metric card)
- **Description:** The blended (effective) percentage of the gross LTD benefit lost to taxes. Communicates the real cost of benefit taxability in a single memorable number.
- **Module:** Disability — LTD Benefit Tax Calculator

---

#### Gross Replacement Rate

```
grossReplacementRate = annualGrossBenefit ÷ annualIncome
```

- **Metric / Visualization:** Gross Replacement Rate (metric card)
- **Description:** The LTD benefit as a percentage of the client's pre-disability gross annual income — the headline figure shown in most group plan documents.
- **Module:** Disability — LTD Benefit Tax Calculator

---

#### Net Replacement Rate

```
netReplacementRate = netAnnualBenefit ÷ preTaxAnnualIncome
```

- **Metric / Visualization:** True Net Replacement Rate (metric card)
- **Description:** The more meaningful metric: compares the after-tax LTD benefit to the client's after-tax pre-disability income. This is what the client actually experiences — often significantly lower than the advertised gross replacement rate.
- **Module:** Disability — LTD Benefit Tax Calculator

---

### 2.7 Job Comparison Module

Source: `JobComparisonModule.tsx`

Compares disability income protection under two job scenarios (Job A vs. Job B) to quantify the income protection value of adding an individual DI policy.

---

#### Group LTD Annual Benefit (per job)

```
uncapped = salary × (groupPct ÷ 100)
groupLTDAnnual = groupCap > 0 ? min(uncapped, groupCap × 12) : uncapped
```

- **Metric / Visualization:** Group LTD bar in stacked chart
- **Description:** Converts the group LTD coverage percentage and monthly cap into an annual benefit. The cap is applied in annual terms (monthly cap × 12) before comparing.
- **Module:** Disability — Job Comparison

---

#### Income Gap per Job

```
// Job A (no IDI):
groupCovered_A = min(groupLTD_A, annualSalary_A)
incomeGap_A    = max(0, annualSalary_A − groupCovered_A)

// Job B (with IDI, premium reduces take-home):
totalBar_B           = max(0, annualSalary_A − annualPremium_B)
groupCovered_B       = min(groupLTD_B, totalBar_B)
idiCapacityAfterPremium = max(0, totalBar_B − groupCovered_B − annualPremium_B)
idiCovered_B         = min(annualIDI_B, idiCapacityAfterPremium)
incomeGap_B          = max(0, totalBar_B − groupCovered_B − idiCovered_B)
```

- **Metric / Visualization:** Stacked bar chart — Group LTD / IDI Benefit / Income Gap segments
- **Description:** For Job A (without IDI), the gap is simply what group LTD does not cover. For Job B (with IDI), the annual premium cost is first subtracted from gross salary to model the real take-home impact, then IDI fills the remaining gap. The chart visually shows how adding IDI shrinks the unprotected income segment.
- **Module:** Disability — Job Comparison

---

#### Income Replacement Gap (Disabled)

```
jobAIncomeIfDisabled       = groupCovered_A
jobBIncomeIfDisabled       = groupCovered_B + idiCovered_B
incomeReplacementGapIfDisabled = jobBIncomeIfDisabled − jobAIncomeIfDisabled
```

- **Metric / Visualization:** Income Replacement Advantage (metric card)
- **Description:** The additional annual disability income available in Job B versus Job A — the dollar value of the IDI policy in a disability scenario, expressed as the improvement in income replacement.
- **Module:** Disability — Job Comparison

---

#### Annual Income Difference (Premium Cost)

```
annualIncomeDifference = annualSalary_A − totalBar_B
                       = annualPremium_B
```

- **Metric / Visualization:** Annual Cost of IDI (metric card)
- **Description:** The annual premium cost that reduces Job B's effective take-home income relative to Job A. This is the "price" of the additional disability protection.
- **Module:** Disability — Job Comparison

---

## 3. Liability Module

Source: `calculateLiabilityGap.ts`

This module assesses a household's exposure to lawsuit judgments, wage garnishment, and asset erosion, then compares it against existing liability coverage.

---

#### Projected Income Risk to Retirement (per earner)

```
incomeRisk = Σ_{year=0}^{yearsToRetirement − 1}
    annualIncome × (1 + incomeGrowthRate)^year × garnishmentRate
```

- **Metric / Visualization:** Wage Garnishment Risk (metric card)
- **Description:** The cumulative income at risk of garnishment over the remaining working career if a judgment is obtained. Each year's projected income is multiplied by the assumed garnishment rate (default 25%, reflecting maximum legal limits) and summed.
- **Module:** Liability

---

#### Household Wage Garnishment Risk

```
householdWageGarnishmentRisk = primaryIncomeRisk + spouseIncomeRisk
```

- **Metric / Visualization:** Household Wage Garnishment Risk (metric card)
- **Description:** Combines both spouses' cumulative garnishment risk for a total household income exposure figure.
- **Module:** Liability

---

#### Non-Qualified Assets at Risk

```
nonQualifiedAssetsAtRisk = max(
    inputs.nonQualifiedAssets,
    investmentAssets + savingsAssets + businessOwnershipValue
)
```

- **Metric / Visualization:** Non-Qualified Assets at Risk (metric card)
- **Description:** The pool of non-retirement, non-protected assets exposed to a judgment: investment accounts, savings, and business ownership value. Qualified retirement accounts (401k, IRA) generally enjoy legal protections and are excluded.
- **Module:** Liability

---

#### Total Household Liability Risk

```
totalHouseholdLiabilityRisk = householdWageGarnishmentRisk + nonQualifiedAssetsAtRisk
```

- **Metric / Visualization:** Total Liability Risk (headline metric card)
- **Description:** The maximum financial damage a successful lawsuit could inflict on the household — combining the ability to garnish future wages with the ability to seize non-qualified assets.
- **Module:** Liability

---

#### Household Total Coverage

```
householdAutoLiabilityCoverage = autoLiabilityLimit
householdUmbrellaCoverage      = umbrellaCoverage
householdTotalCoverage         = householdAutoLiabilityCoverage + householdUmbrellaCoverage
```

- **Metric / Visualization:** Total Liability Coverage (metric card)
- **Description:** The sum of auto liability limits and umbrella policy coverage — the household's total shield against lawsuit judgments.
- **Module:** Liability

---

#### Household Liability Gap

```
householdLiabilityGap = max(0, totalHouseholdLiabilityRisk − householdTotalCoverage)
```

- **Metric / Visualization:** Liability Gap (headline metric card)
- **Description:** The amount by which the household's liability exposure exceeds its coverage — the dollar value that would come out of personal assets if a worst-case judgment were entered.
- **Module:** Liability

---

#### Home Equity

```
homeEquity = max(0, homeValue − mortgageBalance)
```

- **Metric / Visualization:** Home Equity at Risk (metric card)
- **Description:** The client's unencumbered home equity, which may be at risk in many states depending on homestead exemptions.
- **Module:** Liability

---

#### Total At-Risk Assets

```
totalAtRiskAssets = max(
    homeEquity + investmentAssets + savingsAssets + businessOwnershipValue,
    nonQualifiedAssetsAtRisk
)
```

- **Metric / Visualization:** Total At-Risk Assets (metric card)
- **Description:** The broadest measure of household assets exposed to a judgment — home equity added to liquid and investment assets.
- **Module:** Liability

---

#### Primary Coverage

```
primaryCoverage = max(autoLiabilityLimit, homeLiabilityLimit)
```

- **Metric / Visualization:** Primary Coverage (metric card)
- **Description:** The higher of auto and home liability limits is used as the primary protection layer (since umbrella coverage typically requires underlying auto and home coverage).
- **Module:** Liability

---

#### Total Coverage (Exposure Analysis)

```
totalCoverage = primaryCoverage + umbrellaCoverage
```

- **Metric / Visualization:** Total Coverage (exposure analysis metric card)
- **Description:** The combined primary and umbrella coverage available to the client for exposure analysis purposes.
- **Module:** Liability

---

#### Total Exposure

```
totalExposure = max(estimatedLawsuitExposure, totalHouseholdLiabilityRisk)
```

- **Metric / Visualization:** Total Exposure (metric card)
- **Description:** Uses the larger of the advisor's estimated lawsuit exposure and the computed household risk, ensuring the analysis is not artificially limited.
- **Module:** Liability

---

#### Coverage Gap (Exposure Analysis)

```
exposureGap = max(0, totalExposure − totalCoverage)
```

- **Metric / Visualization:** Coverage Gap (metric card)
- **Description:** The dollar amount of exposure the client's coverage leaves unprotected.
- **Module:** Liability

---

#### Eroded Assets

```
erodedAssets = min(exposureGap, totalAtRiskAssets)
```

- **Metric / Visualization:** Assets Eroded by Gap (metric card)
- **Description:** The portion of the coverage gap that would come directly from the client's assets — capped at total at-risk assets because a judgment can only seize what exists.
- **Module:** Liability

---

#### Wealth Erosion Percentage

```
wealthErosionPercentage = erodedAssets ÷ totalAtRiskAssets
```

- **Metric / Visualization:** Wealth Erosion % (metric card)
- **Description:** What fraction of the client's total at-risk assets would be wiped out by the coverage gap in a worst-case judgment scenario.
- **Module:** Liability

---

#### Net Worth at Risk

```
netWorthAtRisk = max(0, nonQualifiedAssetsAtRisk + homeEquity)
```

- **Metric / Visualization:** Net Worth at Risk (metric card)
- **Description:** The household's total exposed net worth — non-qualified assets plus home equity.
- **Module:** Liability

---

#### Recommended Umbrella Coverage

```
incomeMultipleTarget       = annualIncome × 5
recommendedUmbrellaCoverage = max(netWorthAtRisk, incomeMultipleTarget, 1,000,000)
```

- **Metric / Visualization:** Recommended Umbrella Coverage (metric card)
- **Description:** Computes the suggested umbrella policy limit as the greatest of: the client's net worth at risk, 5× their annual income, or a minimum of $1,000,000. This multi-factor approach ensures the recommendation is meaningful for both low- and high-net-worth clients.
- **Module:** Liability

---

#### Umbrella Coverage Shortfall

```
umbrellaCoverageShortfall = max(0, recommendedUmbrellaCoverage − currentUmbrellaCoverage)
```

- **Metric / Visualization:** Umbrella Shortfall (metric card)
- **Description:** How much additional umbrella coverage the client should purchase to meet the recommended level.
- **Module:** Liability

---

## 4. Unemployment Module

Source: `calculateUnemploymentGap.ts`

Models the financial runway available to a client during a job search, quantifying whether savings and offset income (severance + unemployment benefits) are sufficient to cover living expenses.

---

#### Monthly Income

```
monthlyIncome = annualIncome ÷ 12
```

- **Metric / Visualization:** Monthly Income (metric card)
- **Description:** Converts the client's annual income to a monthly figure for cash-flow and runway calculations.
- **Module:** Unemployment

---

#### Monthly Cash Flow

```
monthlyCashFlow = monthlyIncome − monthlyBurnRate
```

- **Metric / Visualization:** Monthly Cash Flow (metric card; positive = green, negative = red)
- **Description:** The client's current surplus or deficit each month when employed. A negative cash flow indicates ongoing structural spending that compounds the risk of unemployment.
- **Module:** Unemployment

---

#### Reserve Targets

```
minimumReserveTarget = monthlyExpenses × 3
optimalReserveTarget = monthlyExpenses × 6
dangerThreshold      = monthlyExpenses × 1.5
```

- **Metric / Visualization:** Emergency Reserve gauge / status indicator
- **Description:** Standard financial planning benchmarks for emergency fund adequacy. 3 months is the minimum; 6 months is optimal. The danger threshold at 1.5 months triggers the red status.
- **Module:** Unemployment

---

#### Months of Runway (Current Savings Only)

```
monthsOfRunwayRaw = emergencySavings ÷ monthlyBurnRate
```

- **Metric / Visualization:** Savings Runway (metric card)
- **Description:** How long the client's liquid savings alone would sustain their current expense level, with no income of any kind. This is the baseline runway before accounting for severance or unemployment benefits.
- **Module:** Unemployment

---

#### Reserve Coverage Percentage

```
reserveCoveragePct = (emergencySavings ÷ optimalReserveTarget) × 100
```

- **Metric / Visualization:** Reserve Coverage % (metric card / progress bar)
- **Description:** What fraction of the optimal 6-month reserve the client currently holds, expressed as a percentage. A reading below 100% means they have not yet hit the optimal target.
- **Module:** Unemployment

---

#### Monthly Offset Income

```
monthlyOffset = severanceMonthly + unemploymentBenefitMonthly
```

- **Metric / Visualization:** Monthly Offset Income (metric card)
- **Description:** The combined non-employment income available during the job search from severance payments and state unemployment benefits.
- **Module:** Unemployment

---

#### Monthly Net Burn (after offsets)

```
monthlyNetBurn = monthlyBurnRate − monthlyOffset
```

- **Metric / Visualization:** Net Monthly Burn Rate (metric card)
- **Description:** The effective monthly deficit after offset income is applied — the amount the client actually draws from savings each month.
- **Module:** Unemployment

---

#### Total Offset Pool

```
severanceTotal          = severanceMonthly × severanceDurationMonths
unemploymentBenefitTotal = unemploymentBenefitMonthly × unemploymentBenefitDurationMonths
totalOffsetPool          = severanceTotal + unemploymentBenefitTotal
```

- **Metric / Visualization:** Total Offset Pool (metric card)
- **Description:** The total dollar amount available from all offset sources (severance + unemployment benefits) over their respective benefit periods.
- **Module:** Unemployment

---

#### Total Expenses During Job Search

```
totalExpensesDuringSearch = monthlyBurnRate × estimatedJobSearchMonths
```

- **Metric / Visualization:** Total Expenses During Search (metric card)
- **Description:** The gross expense obligation over the estimated job-search duration — the total funding requirement.
- **Module:** Unemployment

---

#### Total Offset During Search

```
overlapMonths           = min(unemploymentBenefitDurationMonths, estimatedJobSearchMonths)
totalOffsetDuringSearch = monthlyOffset × overlapMonths
```

- **Metric / Visualization:** Offset Income During Search (metric card)
- **Description:** The offset income actually available during the job search window, limited to the overlap between the benefit duration and the expected search length.
- **Module:** Unemployment

---

#### Net Cash Needed from Savings

```
netCashNeeded = max(0, totalExpensesDuringSearch − totalOffsetDuringSearch)
```

- **Metric / Visualization:** Net Cash Needed from Savings (metric card)
- **Description:** After applying all offset income, this is the amount the client must draw from savings to sustain their expenses through the full job search.
- **Module:** Unemployment

---

#### Covered by Savings

```
coveredBySavings = min(emergencySavings, netCashNeeded)
```

- **Metric / Visualization:** Covered by Savings (breakdown metric)
- **Description:** How much of the net cash need savings can actually cover, bounded by the current savings balance.
- **Module:** Unemployment

---

#### Remaining Shortfall

```
remainingShortfall = max(0, netCashNeeded − emergencySavings)
```

- **Metric / Visualization:** Remaining Shortfall (headline metric card)
- **Description:** The amount the client would fall short if their job search lasted the estimated duration — the gap they cannot fund from any current source.
- **Module:** Unemployment

---

#### Available at Onset

```
availableAtOnset = emergencySavings + totalOffsetPool
```

- **Metric / Visualization:** Total Resources Available (metric card)
- **Description:** The full pool of resources the client can draw on from day one of unemployment: their savings plus the total future value of all offset income.
- **Module:** Unemployment

---

#### Effective Runway (with Offsets)

```
effectiveRunwayMonths = availableAtOnset ÷ monthlyBurnRate
```

- **Metric / Visualization:** Effective Runway (metric card)
- **Description:** The theoretical total runway when savings and all offset income are pooled and divided by the monthly expense rate. This is an upper-bound estimate; actual coverage may be shorter if benefits expire before savings are depleted.
- **Module:** Unemployment

---

#### Month-by-Month Timeline

```
// For each month 1 … estimatedJobSearchMonths:
offsetIncome[m]        = severanceMonthly (if m ≤ severanceDurationMonths)
                       + unemploymentBenefitMonthly (if m ≤ unemploymentBenefitDurationMonths)
requiredFromSavings[m] = max(0, monthlyBurnRate − offsetIncome[m])
coveredByReserve[m]    = min(reserveBalance, requiredFromSavings[m])
shortfall[m]           = max(0, requiredFromSavings[m] − reserveBalance)
reserveBalance[m]      = max(0, reserveBalance[m-1] − requiredFromSavings[m])
```

- **Metric / Visualization:** Month-by-Month Timeline chart / table
- **Description:** Simulates each month of the job search, tracking offset income, savings drawdown, and any monthly shortfall. This granular view shows exactly when (if ever) savings would be depleted and what the monthly shortfall looks like once they are.
- **Module:** Unemployment

---

*Document generated from source code as of May 2026. All formulas reflect the implementation in `src/features/risk-modules/`. For questions about methodology or assumptions, refer to the Assumptions page within the tool or contact the development team.*
