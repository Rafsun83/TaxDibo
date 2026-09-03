import { ArrowRight, Calculator, Info } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  REBATE_OPTIONS,
  TAX_SLABS,
  calculateRebate,
  calculateTax,
  fmtBdt,
  type RebateInputs,
  type RebateKey,
} from "../lib/tax";

export default function TaxCalculatorPage() {
  const navigate = useNavigate();
  const [monthly, setMonthly] = useState("");
  const [rebateInputs, setRebateInputs] = useState<Record<RebateKey, string>>({
    dps: "",
    loan: "",
    investment: "",
  });

  const setRebateField = (key: RebateKey, value: string) =>
    setRebateInputs((prev) => ({ ...prev, [key]: value }));

  const monthlySalary = parseFloat(monthly) || 0;
  const annualIncome = monthlySalary * 12;
  const { slabs, total: taxBeforeRebate } = calculateTax(annualIncome);

  const parsedRebateInputs: RebateInputs = {
    dps: parseFloat(rebateInputs.dps) || 0,
    loan: parseFloat(rebateInputs.loan) || 0,
    investment: parseFloat(rebateInputs.investment) || 0,
  };
  const { breakdown: rebateBreakdown, totalRebate } = calculateRebate(
    parsedRebateInputs,
    taxBeforeRebate,
  );

  const annualTax = Math.max(0, taxBeforeRebate - totalRebate);
  const monthlyTax = annualTax / 12;
  const effectiveRate = annualIncome > 0 ? (annualTax / annualIncome) * 100 : 0;
  const hasResult = monthlySalary > 0;

  const STATS = [
    { label: "Annual Income", value: hasResult ? `৳ ${fmtBdt(annualIncome)}` : "—" },
    {
      label: "Tax Before Rebate",
      value: hasResult ? `৳ ${fmtBdt(taxBeforeRebate)}` : "—",
    },
    {
      label: "Total Rebate",
      value: hasResult ? `− ৳ ${fmtBdt(totalRebate)}` : "—",
      highlight: totalRebate > 0,
    },
    {
      label: "Final Annual Tax",
      value: hasResult ? `৳ ${fmtBdt(annualTax)}` : "—",
      highlight: true,
    },
    { label: "Monthly Tax", value: hasResult ? `৳ ${fmtBdt(monthlyTax)}` : "—" },
    {
      label: "Effective Rate",
      value: hasResult ? `${effectiveRate.toFixed(2)}%` : "—",
    },
  ];

  return (
    <section className="flex-1 space-y-6 p-4 md:p-6">
      {/* ── Page intro ──────────────────────────────────────────── */}
      <article className="relative overflow-hidden rounded-3xl bg-primary p-8 shadow-xl shadow-primary/30 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full border border-primary-foreground/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-primary-foreground/5" />

        <div className="relative flex items-center gap-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary-foreground/10 text-primary-foreground">
            <Calculator className="size-6" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-primary-foreground/80">
              Bangladesh Income Tax
            </span>
            <h2 className="mt-2 text-2xl font-bold text-primary-foreground md:text-3xl">
              Tax Calculator
            </h2>
            <p className="mt-1 text-sm text-primary-foreground/70">
              Estimate your annual tax and see how DPS, loans and investments
              reduce your final bill.
            </p>
          </div>
        </div>
      </article>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        {/* ── Inputs ────────────────────────────────────────────── */}
        <article className="space-y-6 rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Income
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Monthly Salary (BDT)
              </label>
              <div className="flex items-center overflow-hidden rounded-2xl border border-border/70 bg-muted/60 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/40">
                <span className="border-r border-border/70 px-4 py-3 text-sm font-semibold text-muted-foreground">
                  ৳
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50000"
                  value={monthly}
                  onChange={(e) => setMonthly(e.target.value)}
                  className="w-full bg-transparent px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Rebate eligible expenses (annual)
            </p>
            <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground/80">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Rebate rates shown below are estimates and will be updated with
              the exact NBR figures.
            </p>

            <div className="mt-3 space-y-4">
              {REBATE_OPTIONS.map((option) => (
                <label key={option.key} className="flex flex-col gap-1.5">
                  <span className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {option.label}
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold normal-case tracking-normal text-primary">
                      {(option.rate * 100).toFixed(0)}% rebate
                    </span>
                  </span>
                  <div className="flex items-center overflow-hidden rounded-2xl border border-border/70 bg-muted/60 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/40">
                    <span className="border-r border-border/70 px-4 py-3 text-sm font-semibold text-muted-foreground">
                      ৳
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={rebateInputs[option.key]}
                      onChange={(e) => setRebateField(option.key, e.target.value)}
                      className="w-full bg-transparent px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground/70">
                    {option.description}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </article>

        {/* ── Results ───────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {STATS.map(({ label, value, highlight }) => (
              <article
                key={label}
                className={`rounded-3xl border border-border/70 p-5 shadow-sm ${highlight ? "bg-primary/10" : "bg-background/90"}`}
              >
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                  {label}
                </p>
                <p
                  className={`mt-3 text-2xl font-semibold ${highlight ? "text-primary" : "text-foreground"}`}
                >
                  {value}
                </p>
              </article>
            ))}
          </div>

          {hasResult && totalRebate > 0 && (
            <article className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
                Rebate breakdown
              </p>
              <div className="mt-3 space-y-2">
                {rebateBreakdown
                  .filter((item) => item.amount > 0)
                  .map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium text-foreground">
                        ৳ {fmtBdt(item.amount)} × {(item.rate * 100).toFixed(0)}% ={" "}
                        ৳ {fmtBdt(item.rebate)}
                      </span>
                    </div>
                  ))}
              </div>
            </article>
          )}

          <article className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Ready to file?
              </h3>
              <p className="text-sm text-muted-foreground">
                Book an appointment and let our experts handle the rest.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="group flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              Book An Appointment
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </article>
        </div>
      </div>

      {/* ── Slab breakdown ──────────────────────────────────────── */}
      <article className="overflow-hidden rounded-3xl border border-border/70 bg-background/90 shadow-sm">
        <div className="border-b border-border/70 px-6 py-5">
          <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
            Tax slab breakdown
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">
            How your tax is calculated
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <th className="px-6 py-3 text-left font-medium">Income slab</th>
                <th className="px-6 py-3 text-right font-medium">Rate</th>
                <th className="px-6 py-3 text-right font-medium">
                  Taxable amount
                </th>
                <th className="px-6 py-3 text-right font-medium">Tax</th>
              </tr>
            </thead>
            <tbody>
              {(hasResult
                ? slabs
                : TAX_SLABS.map((s) => ({
                    label: s.label,
                    rate: s.rate,
                    taxableAmount: 0,
                    taxAmount: 0,
                  }))
              ).map((row, i, arr) => (
                <tr
                  key={row.label}
                  className={`transition-colors hover:bg-muted/40 ${i !== arr.length - 1 ? "border-b border-border/50" : ""}`}
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {row.label}
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground">
                    {(row.rate * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground">
                    {hasResult ? `৳ ${fmtBdt(row.taxableAmount)}` : "—"}
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-semibold ${hasResult && row.taxAmount > 0 ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {hasResult ? `৳ ${fmtBdt(row.taxAmount)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            {hasResult && (
              <tfoot>
                <tr className="border-t-2 border-border/70 bg-muted/30">
                  <td colSpan={3} className="px-6 py-4 font-semibold text-foreground">
                    Final Annual Tax (after rebate)
                  </td>
                  <td className="px-6 py-4 text-right text-lg font-bold text-primary">
                    ৳ {fmtBdt(annualTax)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </article>
    </section>
  );
}
