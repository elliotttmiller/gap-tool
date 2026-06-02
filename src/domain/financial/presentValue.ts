/**
 * Present value of an annual cash-flow stream using end-of-year timing.
 * The first cash flow is discounted by one period.
 */
export function presentValueOfAnnualStream(cashFlows: number[], annualRate: number): number {
  const rate = Number.isFinite(annualRate) ? Math.max(annualRate, 0) : 0
  return cashFlows.reduce((pv, cashFlow, index) => {
    const safeCashFlow = Number.isFinite(cashFlow) ? Math.max(cashFlow, 0) : 0
    return pv + safeCashFlow / Math.pow(1 + rate, index + 1)
  }, 0)
}
