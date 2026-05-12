import { FormulaVersionMetadata } from "./types";
import { calculateLifeInsuranceGap } from "../life/calculations/calculateLifeInsuranceGap";
import { calculateDisabilityGap } from "../disability/calculations/calculateDisabilityGap";
import { calculateUnemploymentGap } from "../unemployment/calculations/calculateUnemploymentGap";
import { calculateLiabilityGap } from "../liability/calculations/calculateLiabilityGap";

export const formulaRegistry = {
  life: {
    current: "life-v1.0.0",
    versions: {
      "life-v1.0.0": calculateLifeInsuranceGap, // To be updated to match the strict signature
    },
    metadata: {
      "life-v1.0.0": {
        moduleType: "life",
        version: "life-v1.0.0",
        effectiveDate: "2026-05-12",
        description: "MVP capital needs model using income replacement, obligations, and available resources.",
        changeSummary: "Initial deterministic Life Insurance modeling version.",
        deprecated: false,
      } as FormulaVersionMetadata
    }
  },
  disability: {
    current: "di-v1.0.0",
    versions: {
      "di-v1.0.0": calculateDisabilityGap,
    },
    metadata: {
      "di-v1.0.0": {
        moduleType: "disability",
        version: "di-v1.0.0",
        effectiveDate: "2026-05-12",
        description: "MVP disability time-series modeling",
        changeSummary: "Initial version",
        deprecated: false,
      } as FormulaVersionMetadata
    }
  },
  unemployment: {
    current: "unemployment-v1.0.0",
    versions: {
      "unemployment-v1.0.0": calculateUnemploymentGap,
    },
  },
  liability: {
    current: "liability-v1.0.0",
    versions: {
      "liability-v1.0.0": calculateLiabilityGap,
    },
  },
} as const;
