import { UnemploymentInputs, UnemploymentOutputs } from "../types";

export function calculateUnemploymentGap(inputs: UnemploymentInputs): UnemploymentOutputs {
  const annualIncome = Math.max(inputs.annualIncome, 0);
  const spouseIncome = Math.max(inputs.spouseIncome, 0);
  const monthlyExpenses = Math.max(inputs.monthlyExpenses, 0);
  const emergencySavings = Math.max(inputs.emergencySavings, 0);
  const severanceMonths = Math.max(Math.floor(inputs.severanceMonths), 0);
  const unemploymentBenefitMonthly = Math.max(inputs.unemploymentBenefitMonthly, 0);
  const unemploymentBenefitDurationMonths = Math.max(Math.floor(inputs.unemploymentBenefitDurationMonths), 0);
  const estimatedJobSearchMonths = Math.max(Math.floor(inputs.estimatedJobSearchMonths), 0);

  const monthlySalary = annualIncome / 12;
  const spouseMonthly = spouseIncome / 12;
  const expenses = monthlyExpenses;
  
  const severanceTotal = monthlySalary * severanceMonths;
  let currentSavings = emergencySavings + severanceTotal;
  
  let depletionMonth = -1;
  let totalShortfall = 0;
  
  const timeline = [];
  
  for (let month = 1; month <= estimatedJobSearchMonths; month++) {
    let availableIncome = spouseMonthly;
    
    if (month <= unemploymentBenefitDurationMonths) {
      availableIncome += unemploymentBenefitMonthly;
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
    let checkMonth = estimatedJobSearchMonths + 1;
    let simSavings = currentSavings;
    while (simSavings > 0 && checkMonth < 120) {
      let simIncome = spouseMonthly;
      if (checkMonth <= unemploymentBenefitDurationMonths) {
        simIncome += unemploymentBenefitMonthly;
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
    currentReserveLevel: emergencySavings,
    optimalReserveTarget: expenses * 6,
    minimumReserveTarget: expenses * 3,
    annualIncomeAtRisk: annualIncome,
    reserveMonthsCurrent: expenses > 0 ? emergencySavings / expenses : 0,
    timeline,
  };
}
