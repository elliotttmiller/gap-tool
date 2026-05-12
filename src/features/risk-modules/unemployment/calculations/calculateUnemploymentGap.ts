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
    // Determine this month's income
    let availableIncome = spouseMonthly;
    
    // Add unemployment benefits if still within duration
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
          depletionMonth = month; // Records the first month we completely run out of cash
        }
        currentSavings = 0;
      }
    } else {
      currentSavings += Math.abs(gap); // Add surplus to savings
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

  // Also calculate depletion assuming we just keep burning indefinitely to find the absolute runway
  if (depletionMonth === -1) {
    // if we haven't depleted in the search window, check if we EVER deplete assuming no job found
    let checkMonth = inputs.estimatedJobSearchMonths + 1;
    let simSavings = currentSavings;
    while(simSavings > 0 && checkMonth < 120) { // arbitrary 10 year cap
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
           break; // we will never deplete
        }
        checkMonth++;
    }
  }

  return {
    monthlyBurnRate: expenses,
    monthlyAvailableIncomeBase: spouseMonthly,
    severanceTotal,
    reserveDepletionMonth: depletionMonth,
    totalUncoveredShortfall: totalShortfall,
    timeline,
  };
}
