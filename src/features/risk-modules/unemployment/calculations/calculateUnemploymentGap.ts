import { UnemploymentInputs, UnemploymentOutputs } from "../types";

export function calculateUnemploymentGap(inputs: UnemploymentInputs): UnemploymentOutputs {
  const monthlySalary = inputs.annualIncome / 12;
  const spouseMonthly = inputs.spouseIncome / 12;
  const expenses = inputs.monthlyExpenses;
  
  const severanceTotal = monthlySalary * inputs.severanceMonths;
  let currentSavings = inputs.emergencySavings + severanceTotal;
  
  let depletionMonth = -1;
  let totalShortfall = 0;
  
  const timeline = [];
  
  for (let month = 1; month <= inputs.estimatedJobSearchMonths; month++) {
    let availableIncome = spouseMonthly;
    
    if (month <= inputs.unemploymentBenefitDurationMonths) {
      availableIncome += inputs.unemploymentBenefitMonthly;
    }
    
    const gap = expenses - availableIncome;
    let shortfall = 0;
    
    if (gap > 0) {
      if (currentSavings >= gap) {
        currentSavings -= gap;
      } else {
        shortfall = gap - currentSavings;
        if (depletionMonth === -1) {
          depletionMonth = month;
        }
        currentSavings = 0;
      }
    } else {
      currentSavings += Math.abs(gap);
    }
    
    totalShortfall += shortfall;
    
    timeline.push({
      month,
      availableIncome,
      expenses,
      reserveBalance: currentSavings,
      shortfall,
    });
  }

  if (depletionMonth === -1) {
    let checkMonth = inputs.estimatedJobSearchMonths + 1;
    let simSavings = currentSavings;
    while (simSavings > 0 && checkMonth < 120) {
      let simIncome = spouseMonthly;
      if (checkMonth <= inputs.unemploymentBenefitDurationMonths) {
        simIncome += inputs.unemploymentBenefitMonthly;
      }
      const gap = expenses - simIncome;
      if (gap > 0) {
        if (simSavings >= gap) {
          simSavings -= gap;
        } else {
          depletionMonth = checkMonth;
          break;
        }
      } else {
        break;
      }
      checkMonth++;
    }
  }

  return {
    monthlyBurnRate: expenses,
    monthlyAvailableIncomeBase: spouseMonthly,
    monthlyIncome: monthlySalary,
    severanceTotal,
    reserveDepletionMonth: depletionMonth,
    totalUncoveredShortfall: totalShortfall,
    currentReserveLevel: inputs.emergencySavings,
    optimalReserveTarget: monthlySalary * 6,
    minimumReserveTarget: monthlySalary * 3,
    annualIncomeAtRisk: inputs.annualIncome,
    reserveMonthsCurrent: monthlySalary > 0 ? inputs.emergencySavings / monthlySalary : 0,
    timeline,
  };
}
