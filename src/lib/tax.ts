// Bangladesh income tax slabs (individual, general category).
export const TAX_SLABS = [
  { limit: 375_000, rate: 0, label: "First Tk. 3.75 lac" },
  { limit: 300_000, rate: 0.1, label: "Next Tk. 3 lac" },
  { limit: 400_000, rate: 0.15, label: "Next Tk. 4 lac" },
  { limit: 500_000, rate: 0.2, label: "Next Tk. 5 lac" },
  { limit: 2_000_000, rate: 0.25, label: "Next Tk. 20 lac" },
  { limit: Infinity, rate: 0.3, label: "Above Tk. 35.75 lac" },
] as const;

export interface SlabResult {
  label: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

export function calculateTax(annualIncome: number): {
  slabs: SlabResult[];
  total: number;
} {
  let remaining = annualIncome;
  let total = 0;
  const slabs: SlabResult[] = [];

  for (const slab of TAX_SLABS) {
    if (remaining <= 0) break;
    const taxable =
      slab.limit === Infinity ? remaining : Math.min(remaining, slab.limit);
    const tax = taxable * slab.rate;
    slabs.push({
      label: slab.label,
      rate: slab.rate,
      taxableAmount: taxable,
      taxAmount: tax,
    });
    total += tax;
    remaining -= taxable;
  }

  return { slabs, total };
}

export type RebateKey = "dps" | "loan" | "investment";

export interface RebateOption {
  key: RebateKey;
  label: string;
  description: string;
  // Placeholder rebate rates — swap these for the real NBR figures once provided.
  rate: number;
}

export const REBATE_OPTIONS: RebateOption[] = [
  {
    key: "dps",
    label: "DPS (Deposit Pension Scheme)",
    description: "Annual contribution to a DPS scheme",
    rate: 0.1,
  },
  {
    key: "loan",
    label: "Loan interest",
    description: "Annual interest paid on an eligible loan (e.g. home loan)",
    rate: 0.05,
  },
  {
    key: "investment",
    label: "Investment",
    description: "Annual eligible investment (savings certificate, shares, etc.)",
    rate: 0.15,
  },
];

export type RebateInputs = Record<RebateKey, number>;

export interface RebateBreakdownItem extends RebateOption {
  amount: number;
  rebate: number;
}

export function calculateRebate(
  inputs: RebateInputs,
  taxBeforeRebate: number,
): {
  breakdown: RebateBreakdownItem[];
  totalRebate: number;
} {
  const breakdown = REBATE_OPTIONS.map((option) => {
    const amount = inputs[option.key] || 0;
    return { ...option, amount, rebate: amount * option.rate };
  });

  const rawTotal = breakdown.reduce((sum, item) => sum + item.rebate, 0);
  // Rebate can never exceed the tax it's offsetting.
  const totalRebate = Math.min(rawTotal, taxBeforeRebate);

  return { breakdown, totalRebate };
}

export function fmtBdt(amount: number) {
  return new Intl.NumberFormat("en-BD").format(Math.round(amount));
}
