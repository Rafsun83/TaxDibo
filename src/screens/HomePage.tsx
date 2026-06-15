import { useState } from "react";
import { ArrowRight, BadgeCheck, ShieldCheck, Users } from "lucide-react";
import TaxRequestModal from "../components/TaxRequestModal";

const TAX_SLABS = [
  { limit: 375_000,   rate: 0,    label: "First Tk. 3.75 lac" },
  { limit: 300_000,   rate: 0.10, label: "Next Tk. 3 lac" },
  { limit: 400_000,   rate: 0.15, label: "Next Tk. 4 lac" },
  { limit: 500_000,   rate: 0.20, label: "Next Tk. 5 lac" },
  { limit: 2_000_000, rate: 0.25, label: "Next Tk. 20 lac" },
  { limit: Infinity,  rate: 0.30, label: "Above Tk. 35.75 lac" },
];

interface SlabResult {
  label: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

function calculateTax(annualIncome: number): { slabs: SlabResult[]; total: number } {
  let remaining = annualIncome;
  let total = 0;
  const slabs: SlabResult[] = [];

  for (const slab of TAX_SLABS) {
    if (remaining <= 0) break;
    const taxable = slab.limit === Infinity ? remaining : Math.min(remaining, slab.limit);
    const tax = taxable * slab.rate;
    slabs.push({ label: slab.label, rate: slab.rate, taxableAmount: taxable, taxAmount: tax });
    total += tax;
    remaining -= taxable;
  }

  return { slabs, total };
}

function fmt(amount: number) {
  return new Intl.NumberFormat("en-BD").format(Math.round(amount));
}

const TRUST_BADGES = [
  { icon: BadgeCheck, text: "NBR Registered" },
  { icon: ShieldCheck, text: "Secure & Confidential" },
  { icon: Users, text: "500+ Clients Served" },
];

export default function HomePage() {
  const [monthly, setMonthly] = useState("");
  const [showModal, setShowModal] = useState(false);

  const monthlySalary = parseFloat(monthly) || 0;
  const annualIncome = monthlySalary * 12;
  const { slabs, total: annualTax } = calculateTax(annualIncome);
  const monthlyTax = annualTax / 12;
  const effectiveRate = annualIncome > 0 ? (annualTax / annualIncome) * 100 : 0;

  const hasResult = monthlySalary > 0;

  const STATS = [
    { label: "Annual Income",   value: hasResult ? `৳ ${fmt(annualIncome)}` : "—" },
    { label: "Total Annual Tax", value: hasResult ? `৳ ${fmt(annualTax)}` : "—", highlight: true },
    { label: "Monthly Tax",     value: hasResult ? `৳ ${fmt(monthlyTax)}` : "—" },
    { label: "Effective Rate",  value: hasResult ? `${effectiveRate.toFixed(2)}%` : "—" },
  ];

  return (
    <section className="flex-1 space-y-6 p-4 md:p-6">

      {/* ── Hero CTA ────────────────────────────────────────────── */}
      <article className="relative overflow-hidden rounded-3xl bg-primary p-8 shadow-xl shadow-primary/30 md:p-10">
        {/* Decorative rings */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full border border-primary-foreground/10" />
        <div className="pointer-events-none absolute -right-8 -top-8 size-44 rounded-full border border-primary-foreground/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-primary-foreground/5" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-primary-foreground/80">
              <BadgeCheck className="size-3" />
              Professional Tax Services
            </span>

            <h2 className="mt-4 text-3xl font-bold leading-tight text-primary-foreground md:text-4xl">
              Simplify Your Tax.<br />Let Experts Handle It.
            </h2>
            <p className="mt-3 text-base text-primary-foreground/70">
              Skip the paperwork and confusion. Submit your request and our certified tax professionals will take care of everything — from calculation to filing.
            </p>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-4">
              {TRUST_BADGES.map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 text-sm text-primary-foreground/70">
                  <Icon className="size-4 text-primary-foreground/50" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* CTA block */}
          <div className="flex shrink-0 flex-col items-start gap-3 lg:items-end">
            <button
              onClick={() => setShowModal(true)}
              className="group flex items-center gap-3 rounded-2xl bg-primary-foreground px-7 py-4 text-base font-semibold text-primary shadow-lg transition hover:scale-[1.03] hover:shadow-xl active:scale-[0.98]"
            >
              Request for Tax Pay
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-xs text-primary-foreground/50">
              Free consultation · No hidden fees
            </p>
          </div>
        </div>
      </article>

      {showModal && <TaxRequestModal onClose={() => setShowModal(false)} />}

      {/* ── Calculator input ────────────────────────────────────── */}
      <article className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Bangladesh Income Tax
        </p>
        <h3 className="mt-2 text-xl font-semibold text-foreground">
          Tax Calculator
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your monthly salary to estimate your annual income tax.
        </p>

        <div className="mt-5 flex max-w-sm flex-col gap-1.5">
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
      </article>

      {/* ── Summary stats ───────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map(({ label, value, highlight }) => (
          <article
            key={label}
            className={`rounded-3xl border border-border/70 p-5 shadow-sm ${highlight ? "bg-primary/10" : "bg-background/90"}`}
          >
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              {label}
            </p>
            <p className={`mt-3 text-2xl font-semibold ${highlight ? "text-primary" : "text-foreground"}`}>
              {value}
            </p>
          </article>
        ))}
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
                <th className="px-6 py-3 text-right font-medium">Taxable amount</th>
                <th className="px-6 py-3 text-right font-medium">Tax</th>
              </tr>
            </thead>
            <tbody>
              {(hasResult ? slabs : TAX_SLABS.map((s) => ({ label: s.label, rate: s.rate, taxableAmount: 0, taxAmount: 0 }))).map((row, i, arr) => (
                <tr
                  key={row.label}
                  className={`transition-colors hover:bg-muted/40 ${i !== arr.length - 1 ? "border-b border-border/50" : ""}`}
                >
                  <td className="px-6 py-4 font-medium text-foreground">{row.label}</td>
                  <td className="px-6 py-4 text-right text-muted-foreground">
                    {(row.rate * 100).toFixed(0)}%
                  </td>
                  <td className="px-6 py-4 text-right text-muted-foreground">
                    {hasResult ? `৳ ${fmt(row.taxableAmount)}` : "—"}
                  </td>
                  <td className={`px-6 py-4 text-right font-semibold ${hasResult && row.taxAmount > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {hasResult ? `৳ ${fmt(row.taxAmount)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
            {hasResult && (
              <tfoot>
                <tr className="border-t-2 border-border/70 bg-muted/30">
                  <td colSpan={3} className="px-6 py-4 font-semibold text-foreground">
                    Total Annual Tax
                  </td>
                  <td className="px-6 py-4 text-right text-lg font-bold text-primary">
                    ৳ {fmt(annualTax)}
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
