import { useState } from "react"
import { RiCalculatorLine } from "@remixicon/react"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer"
import { Button } from "@/components/Button"
import { BreakEvenCalculator } from "./BreakEvenCalculator"
import { SsdiEstimator } from "./SsdiEstimator"
import { BenefitTaxCalculator } from "./BenefitTaxCalculator"
import { SavingsBridgeCalculator } from "./SavingsBridgeCalculator"

// ── Calculator registry ────────────────────────────────────────────────────
// Add entries here as new calculators are built.
const CALCULATORS = [
  { id: "ssdi", label: "SSDI Estimator" },
  { id: "benefit-tax", label: "Benefit Taxation" },
  { id: "savings-bridge", label: "Savings Bridge" },
  { id: "break-even", label: "Break-Even" },
] as const

type CalculatorId = (typeof CALCULATORS)[number]["id"]

// ── Drawer shell ──────────────────────────────────────────────────────────

interface DisabilityCalculatorsDrawerProps {
  /** The trigger element — typically the calculator icon button. */
  trigger: React.ReactNode
}

/**
 * Drawer that hosts all disability-module calculators.
 *
 * Each calculator is listed in CALCULATORS above; adding a new one only
 * requires adding an entry there and a matching `<case>` in the render switch.
 */
export function DisabilityCalculatorsDrawer({ trigger }: DisabilityCalculatorsDrawerProps) {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorId>("ssdi")

  const calculatorMeta: Record<CalculatorId, { title: string; description: string }> = {
    "ssdi": {
      title: "SSDI Benefit Estimator",
      description:
        "Estimate the Social Security disability benefit a client would actually receive — exposing the real income gap the government won't cover.",
    },
    "benefit-tax": {
      title: "Benefit Taxation Calculator",
      description:
        "Convert a gross LTD benefit into its real after-tax number, revealing that a \"60% policy\" often nets just 40–45% of take-home pay.",
    },
    "savings-bridge": {
      title: "Elimination Period / Savings Bridge",
      description:
        "Show how fast savings drain during the waiting period before any benefit pays — often the most alarming number in the conversation.",
    },
    "break-even": {
      title: "Insurance Break-Even",
      description:
        "Compare two plans to find the break-even point where the lower-premium option pays off.",
    },
  }

  const meta = calculatorMeta[activeCalculator]

  return (
    <Drawer>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>

      <DrawerContent className="sm:max-w-xl">
        <DrawerHeader>
          <div className="flex items-center gap-2">
            <RiCalculatorLine className="size-5 text-blue-400" aria-hidden="true" />
            <DrawerTitle>Calculators</DrawerTitle>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Supplemental tools for your disability analysis</p>
        </DrawerHeader>

        <DrawerBody className="overflow-y-auto">
          {/* ── Tab bar ─────────────────────────────────────────────────── */}
          <div className="mb-4 flex max-w-full overflow-x-auto rounded-lg border border-gray-800 bg-[#090E1A] p-0.5 text-xs">
            {CALCULATORS.map((calc) => (
              <button
                key={calc.id}
                type="button"
                onClick={() => setActiveCalculator(calc.id)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 font-semibold transition-colors ${
                  activeCalculator === calc.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-gray-100"
                }`}
              >
                {calc.label}
              </button>
            ))}
          </div>

          {/* ── Calculator heading ───────────────────────────────────────── */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-50">{meta.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{meta.description}</p>
          </div>

          {/* ── Active calculator ────────────────────────────────────────── */}
          {activeCalculator === "ssdi" && <SsdiEstimator />}
          {activeCalculator === "benefit-tax" && <BenefitTaxCalculator />}
          {activeCalculator === "savings-bridge" && <SavingsBridgeCalculator />}
          {activeCalculator === "break-even" && <BreakEvenCalculator />}
        </DrawerBody>

        <div className="border-t border-gray-800 pt-4 flex justify-end">
          <DrawerClose asChild>
            <Button variant="secondary">Close</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
