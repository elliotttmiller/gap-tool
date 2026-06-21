# Revision Overview - June 19, 2026

## Comparison

- **Baseline:** `1035202` - Expand advisor meeting objectives (June 17, 2026)
- **Current:** `cee5a5e` - June 19 checkpoint

This revision moves the application from the June 17 advisor-review baseline to a more complete, auditable, and presentation-ready risk analysis workflow.

## Main Updates

### 1. Advisor Methodology Alignment

- **Life Insurance:** Safe Income Coverage now calculates capital required from the present value of the modeled income-support stream. Coverage status, remaining capital gap, charts, and summary metrics use the same threshold.
- **Unemployment:** Emergency reserve targets use the household's monthly gap after remaining spousal net income. The model uses a 3-month minimum and a tiered 3-6 month ideal based on remaining-income coverage.
- **Liability:** Assets at risk now use the entered home equity, investments, savings, and business ownership values without the previous income-multiple target. Coverage and umbrella need are based on the resulting modeled exposure.

### 2. Calculation Analysis Center

A new Analysis Center provides a consolidated review of each active scenario, including:

- Applied methodology and formulas
- Exact scenario inputs and assumptions
- Calculated outputs and period-level schedules
- Scenario and module filtering
- Exportable JSON evidence

This creates a direct audit path between entered client data, calculation logic, and displayed results.

### 3. More Useful Module Outputs

- Life Insurance charts now support age-level selection with corresponding annual and cumulative metrics.
- Unemployment and Liability results were reorganized around the revised advisor methodology and clearer reserve, exposure, coverage, and gap measures.
- Module cards, disclosures, labels, and explanatory copy were simplified to make advisor review and client presentation easier.

### 4. Theme and Interface Improvements

- Added persistent **Light**, **Dark**, and **System** theme support across the application.
- Added subtle theme transitions with reduced-motion support.
- Standardized select controls and improved dashboard, form, card, drawer, and navigation presentation across both themes.

### 5. Supporting Documentation

Added generated module wiring documentation that maps inputs, calculations, metrics, and output components for implementation review and future maintenance.

## Overall Result

The current codebase is more closely aligned with advisor-defined calculation methods, provides stronger calculation transparency, and presents scenario results through a cleaner and more consistent advisor workflow.
