Northstar Gap Tool — Comprehensive Calculation Accuracy Report

Module-by-Module Independent Verification
Life Insurance Core
Output	Expected	Verified	Status
Replacement Years	25	25	✅
Annual Replacement Need	$100,000	$100,000	✅
Future Income Lost	$2,500,000	$2,500,000	✅
Base Protection Need	$2,705,000	$2,705,000	✅
Existing Coverage Total	$800,000	$800,000	✅
Available Resources	$800,000	$800,000	✅
Cumulative Survivor Gap	$4,134,320	$4,134,320	✅
Coverage Offset %	29.57%	29.57%	✅
Projected Income to Retirement	$5,468,890	$5,468,890	✅
Group Life Annual Income	$21,286	$21,286	✅
Private Life Annual Income	$40,121	$40,121	✅
Lifetime Income Uncovered %	75.60%	75.60%	✅
Yearly breakdown (age 40)	survivorGap=$88,593	$88,593	✅
Yearly breakdown (age 50)	survivorGap=$140,180	$140,180	✅
Yearly breakdown (age 60)	privateCovered=$0 (term expired)	$0	✅
Yearly breakdown (age 64, last)	survivorGap=$283,633	$283,633	✅
Count of yearly rows	25	25	✅
Formula logic confirmed: annualReplacementNeed = income × ratio − spouseIncome ($100K), futureIncomeLost = need × years (no PV), baseProtectionNeed = FIL + debts + education + finalExpenses, cumulative survivor gap computed annually using annuity payment formula at 5% yield.

Life Income Gap — Module 1 (Safe Withdrawal Rate)
Output	Expected	Verified	Status
Projected Net Income to Age 65	$3,645,926	$3,645,926	✅
Safe W/D per Year ($500K × 4%)	$20,000	$20,000	✅
Total Income Replaced	$500,000	$500,000	✅
Survivor Gap	$3,145,926	$3,145,926	✅
Death Benefit Needed (PV annuity @ 5%)	$1,773,541	$1,773,541	✅
Life Income Gap — Module 2 (Max Withdrawal Rate)
Output	Expected	Verified	Status
Projected Net Income to Age 65	$3,645,926	$3,645,926	✅
Years of Max Withdrawal	5 years	5 years	✅
Coverage Range	Ages 40–44	Ages 40–44	✅
Total Income Replaced	$530,914	$530,914	✅
Survivor Gap	$3,115,012	$3,115,012	✅
Death Benefit Needed	$1,756,113	$1,756,113	✅
Formula logic confirmed: Asset base ($500K) compounds at 6% annually and funds each year's projected need until exhausted. With $500K × 1.06 = $530K in year 1 vs. need $100K → covered; continues 5 years before balance can't keep up with growing need. PV annuity formula correctly distributes the gap across 25 years.

Disability Core
Output	Expected	Verified	Status
LTD Computed Monthly Benefit	$7,500	$7,500	✅
LTD Net Monthly (×0.70 taxable)	$5,250	$5,250	✅
Private DI Monthly Benefit	$4,000	$4,000	✅
Total Net Monthly Benefit	$9,250	$9,250	✅
Income Loss Net	−$500/mo	−$500/mo	✅
Projected Income at Retirement	$219,847	$219,847	✅
Total Projected Income (net)	$4,048,072	$4,048,072	✅
Total Group LTD Coverage	$1,740,327	$1,740,327	✅
Total Individual DI Coverage	$1,248,000	$1,248,000	✅
Total Coverage	$2,988,327	$2,988,327	✅
Total Gap	$1,074,391	$1,074,391	✅
Average Coverage Rate	73.82%	73.82%	✅
Lifetime IDI Expense	$75,000	$75,000	✅
Projection count	26 rows (age 40–65)	26	✅
Rounding note: Python's round() uses banker's rounding at .5, which differs from JavaScript's Math.round() (always rounds .5 up). When correctly mirroring JS rounding, the totals match exactly at $4,048,072 and $1,074,391. This is not a bug — it is expected language-level behavior.

Disability Display (Net/Gross Bar Chart Views)
Output	Expected	Verified	Status
Net: Income Gap #1 (proj − group LTD)	$2,307,745	$2,307,745	✅
Net: Income Gap #2 (proj − total cov)	$1,059,745	$1,059,745	✅
Net: Gap Difference	$1,248,000	$1,248,000	✅
Gross: Projected Income	$5,782,956	$5,782,956	✅
Gross: Group LTD	$2,486,181	$2,486,181	✅
Gross: Total Income Replaced	$3,734,181	$3,734,181	✅
Gross: Income Gap #1	$3,296,775	$3,296,775	✅
Gross: Income Gap #2	$2,048,775	$2,048,775	✅
Gross: Gap Difference	$1,248,000	$1,248,000	✅
Disability Break-Even (Premium vs. Self-Insured)
Output	Expected	Verified	Status
Benefits Received (VLOOKUP, min 80 mo)	$48,000	$48,000	✅
Break-Even Months (NPER formula)	134.9251	134.9251	✅
Break-Even Years	11.2438	11.2438	✅
Rounded Break-Even Month	135	135	✅
Total Premiums to Break-Even	$33,731.27	$33,731.27	✅
Investment at Month 135	$48,276.81	$48,276.81	✅
Schedule[Month 1].Balance	$251.25	$251.25	✅
Schedule[Month 12].Balance	$3,099.31	$3,099.31	✅
Schedule[Month 240].Balance	$116,087.77	$116,087.77	✅
Schedule[Month 300].Balance	$174,114.73	$174,114.73	✅
Invested FV to Retirement (25 yr)	$173,248.49	$173,248.49	✅
Months of Disability Funded	43.31 months	43.31	✅
Years of Disability Funded	3.61 years	3.61	✅
Year-One Fund (month 12 balance)	$3,099.31	$3,099.31	✅
Formula confirmed: NPER derivation = log((pmt + fv×r)/pmt) / log(1+r) with PV=0, FV=−$48,000, PMT=$250, r=0.005. The schedule uses balance = (balance + pmt) × (1+r) per month. Exactly mirrors the Excel workbook formula.

Job Comparison
Output	Expected	Verified	Status
Job A: Group LTD Annual	$90,000	$90,000	✅
Job A: Income Gap	$60,000	$60,000	✅
Job B: Group LTD Annual	$90,000	$90,000	✅
Job B: IDI Annual	$48,000	$48,000	✅
Job B: Annual Premium	$3,000	$3,000	✅
Job B: Income Gap	$9,000	$9,000	✅
Income Difference	$3,000	$3,000	✅
Gap Difference	$51,000	$51,000	✅
Benefit Tax Calculator (2025 Tax Law)
Output	Expected	Verified	Status
Annual Gross Benefit	$90,000	$90,000	✅
Federal Taxable Benefit	$90,000	$90,000	✅
Federal Tax on Benefit	$6,723	$6,723	✅
State Tax on Benefit (4.95%)	$4,455	$4,455	✅
Total Tax on Benefit	$11,178	$11,178	✅
Net Monthly Benefit	$6,568.50	$6,568.50	✅
Net Annual Benefit	$78,822	$78,822	✅
Effective Tax Rate	12.42%	12.42%	✅
Marginal Federal Rate	12%	12%	✅
Pre-Disability After-Tax Annual	$126,347	$126,347	✅
Gross Replacement Rate	60%	60%	✅
Net Replacement Rate	62.385%	62.385%	✅
Tax math confirmed independently: $150K gross − $30K MFJ deduction = $120K taxable; federal tax = 10%×$23,850 + 12%×$96,150 = $2,385 + $13,938 = $16,323; state = $150K × 4.95% = $7,425; after-tax = $150K − $16,323 − $7,425 = $126,252. Wait — the code computes $126,347. Let me reconcile: 10%×$23,850 = $2,385; 12%×($96,950−$23,850) = 12%×$73,100 = $8,772; 22%×($120,000−$96,950) = 22%×$23,050 = $5,071 → total = $16,228, after-tax = $150,000 − $16,228 − $7,425 = $126,347. ✅ Correct; my first pass missed the bracket boundary.

2025 MFJ bracket thresholds ($23,850/$96,950/$206,700) are confirmed as official IRS 2025 figures. Standard deduction $30,000 MFJ confirmed correct.

SSDI Estimator
Output	Expected	Verified	Status
Estimated AIME ($150K ÷ 12)	$12,500	$12,500	✅
PIA Tier 1 (90% × $1,226)	$1,103.40	$1,103.40	✅
PIA Tier 2 (32% × ($7,391−$1,226))	$1,972.80	$1,972.80	✅
PIA Tier 3 (15% × ($12,500−$7,391))	$766.35	$766.35	✅
Raw PIA	$3,842.55	$3,842.55	✅
Estimated PIA (rounded to $0.10)	$3,842.60	$3,842.60	✅
Estimated Monthly Benefit	$3,822	$3,822	✅*
Estimated Annual Benefit	$45,864	$45,864	✅*
Monthly Income at Disability	$12,500	$12,500	✅
Gross Replacement Rate	30.576%	30.576%	✅
Monthly Gap	$8,678	$8,678	✅
Waiting Period Income Loss (5 mo)	$62,500	$62,500	✅
2025 SSA bend points $1,226 / $7,391 confirmed correct from SSA official sources.

⚠️ Finding — Stale SSDI Cap: The code uses MAX_MONTHLY_SSDI = 3_822 labeled as "2025 statutory maximum." However, per the SSA's official 2025 COLA Fact Sheet, the 2024 cap was $3,822 and the 2025 cap is $4,018. For the golden test client, PIA = $3,842.60 exceeds $3,822, so the output is being capped at the 2024 value instead of the correct 2025 value. The correct 2025 output should be $3,843/mo ($45,516/yr — since $3,842.60 rounded to nearest dollar = $3,843, which is below the true 2025 cap of $4,018). All other SSDI calculations are correct; only high-earning clients (AIME > ~$7,680 where PIA > $3,822) are affected.

Savings Bridge
Output	Expected	Verified	Status
Elimination Period Months (90÷30.4375)	2.9569	2.9569	✅
Income Lost During Elimination	$25,872.69	$25,872.69	✅
Monthly Deficit	$8,000	$8,000	✅
Total Savings Needed	$23,655.03	$23,655.03	✅
Savings Cover Period	true	true	✅
Savings Runway Months (30K÷8K)	3.75	3.75	✅
Savings Shortfall	$0	$0	✅
Savings Remaining	$6,344.97	$6,344.97	✅
Daily Burn Rate (8000÷30.4375)	$262.83/day	$262.83	✅
Ongoing Monthly Gap	$0 (LTD $9,250 > expenses $8,000)	$0	✅
Post-Bridge Savings Runway	∞	∞	✅
Unemployment
Output	Expected	Verified	Status
Monthly Burn Rate	$8,000	$8,000	✅
Monthly Available Income Base	$4,166.67	$4,166.67	✅
Monthly Income (primary)	$12,500	$12,500	✅
Severance Total (1 month)	$12,500	$12,500	✅
Reserve Depletion Month	15	15	✅
Total Uncovered Shortfall	$0	$0	✅
Current Reserve Level	$30,000	$30,000	✅
Minimum Reserve Target (3×monthly)	$37,500	$37,500	✅
Optimal Reserve Target (6×monthly)	$75,000	$75,000	✅
Annual Income at Risk	$150,000	$150,000	✅
Reserve Months Current	2.4	2.4	✅
Timeline[month 1].reserveBalance	$41,166.67	$41,166.67	✅
Walk-through confirmed: Months 1–6: spouse ($4,166.67) + UI ($2,500) = $6,666.67 avail, gap = $1,333.33/mo. Months 7–9: spouse only = $4,166.67, gap = $3,833.33/mo. Starting savings = $42,500 ($30K + $12.5K severance). After 9 months: ~$23,000 remaining. Months 10–15 @ $3,833.33/mo gap depletes remainder → depletion at month 15. ✅

Liability
Output	Expected	Verified	Status
Home Equity ($650K − $350K)	$300,000	$300,000	✅
Total At-Risk Assets	$830,000	$830,000	✅
Primary Coverage (max auto/home)	$500,000	$500,000	✅
Total Coverage ($500K + $1M umbrella)	$1,500,000	$1,500,000	✅
Household Wage Garnishment Risk	$1,876,092.83	$1,876,092.83	✅
Non-Qualified Assets at Risk	$500,000	$500,000	✅
Total Household Liability Risk	$2,376,092.83	$2,376,092.83	✅
Household Auto Liability Coverage	$250,000	$250,000	✅
Household Liability Gap	$2,126,092.83	$2,126,092.83	✅
Exposure Gap (lawsuit vs coverage)	$876,092.83	$876,092.83	✅
Eroded Assets	$830,000	$830,000	✅
Wealth Erosion %	100%	100%	✅
Wage garnishment formula confirmed: 25% of each year's projected income (growing at 3%) for each earner's years remaining to retirement. Jordan: 25% × $150K × Σ(1.03^yr, yr=0..24) = $1,219,168.75. Taylor: 25% × $50K × Σ(1.03^yr, yr=0..26) = $656,924.08. Total = $1,876,092.83. ✅

Scenario Summary & UI Display Snapshots
Output	Expected	Verified	Status
Life Gap	$4,134,320	$4,134,320	✅
Disability Gap	$1,074,391	$1,074,391	✅
Unemployment Gap	$0	$0	✅
Liability Gap	$876,092.83	$876,092.83	✅
Largest Gap	$4,134,320	$4,134,320	✅
Presentation labels: life	"$4,134,320"	"$4,134,320"	✅
Presentation labels: disability	"$1,074,391"	"$1,074,391"	✅
Presentation labels: unemployment	"$0"	"$0"	✅
Presentation labels: liability	"$876,093"	"$876,093"	✅
Unemployment monthly display	"$13K"	"$13K"	✅
Min reserve display	"$38K"	"$38K"	✅
Opt reserve display	"$75K"	"$75K"	✅
Liability coverage% (raw)	10.52% → "11%"	10.52% → "11%"	✅
Surface Coverage Check
All 6 checks pass:

✅ Route coverage in App.tsx (dashboard, client overview, scenarios, all 4 risk module routes, presentation, settings, fallback)
✅ Module tab coverage in ScenarioDetail.tsx, RiskModulePage.tsx, Presentation.tsx for all 4 modules
✅ Page-to-calculator bindings: each module page imports and calls its expected calculator function
✅ Tab-level output coverage: Life has safe/max tabs; Disability has income-gap/premium-vs-self-insured/job-comparison tabs
✅ Formula version registry has entries for all 4 modules (life-v1.0.0, di-v1.0.0, etc.)
✅ Scenario summary gap mapping correctly routes all 4 modules
Summary of Findings
#	Severity	Finding
1	✅ All Clear	All 100+ calculations across all 8 modules match expected outputs exactly
2	✅ All Clear	All automated tests pass cleanly (npm run test:validation)
3	✅ All Clear	2025 federal tax brackets, standard deductions, and SSA bend points are confirmed correct from official IRS/SSA sources
4	⚠️ Minor Bug	MAX_MONTHLY_SSDI is set to 3_822 and labeled "2025 statutory maximum" — but $3,822 was the 2024 cap; the official 2025 cap is $4,018. For the golden client (PIA=$3,842.60 > $3,822), the correct 2025 output would be $3,843/mo instead of $3,822/mo. Only high-earning clients whose PIA exceeds $3,822 are affected.
Verdict: The tool's calculations are 100% internally consistent and correct. The only factual inaccuracy found is the stale SSDI maximum benefit constant (labeled 2025, but using the 2024 value of $3,822 instead of the correct 2025 value of $4,018), which will cause a modest understatement of SSDI monthly benefits for clients with very high career earnings.