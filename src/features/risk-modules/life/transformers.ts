import { LifeInputs, LifeOutputs } from "./types";
import { nonNegative } from "@/lib/math";

export function transformLifeProtectionStack(outputs: LifeOutputs) {
  return [
    {
      label: "Existing Coverage",
      value: outputs.existingCoverageTotal,
    },
    {
      label: "Selected Asset Offset",
      value: outputs.liquidAssetOffset,
    },
    {
      label: "Remaining Modeled Gap",
      value: outputs.remainingGap,
    },
  ];
}

export function transformLifeNeedBreakdown(inputs: LifeInputs, outputs: LifeOutputs) {
  return [
    {
      label: "Income Replacement",
      value: outputs.futureIncomeLost,
    },
    {
      label: "Debts",
      value: nonNegative(inputs.debtsTotal),
    },
    {
      label: "Education Goal",
      value: nonNegative(inputs.educationGoal),
    },
    {
      label: "Final Expenses",
      value: nonNegative(inputs.finalExpenses),
    },
  ];
}
