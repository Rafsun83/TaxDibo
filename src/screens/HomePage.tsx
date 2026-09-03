import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  CalendarCheck,
  Clock,
  FileText,
  ShieldCheck,
  UploadCloud,
  UserRound,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaxRequestModal from "../components/TaxRequestModal";
import { useAuth } from "../context/AuthContext";

const TRUST_BADGES = [
  { icon: BadgeCheck, text: "NBR Registered" },
  { icon: ShieldCheck, text: "Secure & Confidential" },
  { icon: Users, text: "500+ Clients Served" },
];

const QUICK_ACTIONS = [
  {
    label: "Tax Calculator",
    description: "Estimate your annual tax in seconds",
    icon: Calculator,
    path: "/tax-calculator",
  },
  {
    label: "Documents",
    description: "Upload and manage your tax files",
    icon: FileText,
    path: "/documents",
  },
  {
    label: "Appointments",
    description: "Track your booked sessions",
    icon: CalendarCheck,
    path: "/appointments",
  },
  {
    label: "Profile",
    description: "Keep your details up to date",
    icon: UserRound,
    path: "/profile",
  },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Bank-level Security",
    description: "Your documents and data stay encrypted and confidential.",
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Most filings are reviewed and completed within days.",
  },
  {
    icon: BadgeCheck,
    title: "Certified Experts",
    description: "NBR-registered professionals handle every submission.",
  },
  {
    icon: Users,
    title: "Dedicated Support",
    description: "Real people to answer questions at every step.",
  },
];

const STEPS = [
  {
    icon: Calculator,
    title: "Estimate your tax",
    description: "Use the calculator to see roughly what you owe.",
  },
  {
    icon: CalendarCheck,
    title: "Book an appointment",
    description: "Pick a date and tell us what you need help with.",
  },
  {
    icon: UploadCloud,
    title: "Upload your documents",
    description: "Share your paperwork securely from the Documents page.",
  },
  {
    icon: BadgeCheck,
    title: "We handle the filing",
    description: "Our experts take it from there — you're done.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

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
              {user
                ? `Welcome back, ${user.name.split(" ")[0]}.`
                : "Simplify Your Tax."}
              <br />
              Let Experts Handle It.
            </h2>
            <p className="mt-3 text-base text-primary-foreground/70">
              Skip the paperwork and confusion. Submit your request and our
              certified tax professionals will take care of everything — from
              calculation to filing.
            </p>

            {/* Trust badges */}
            <div className="mt-6 flex flex-wrap gap-4">
              {TRUST_BADGES.map(({ icon: Icon, text }) => (
                <span
                  key={text}
                  className="flex items-center gap-1.5 text-sm text-primary-foreground/70"
                >
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
              Book An Appointment
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate("/tax-calculator")}
              className="flex items-center gap-2 rounded-2xl border border-primary-foreground/30 px-6 py-3 text-sm font-semibold text-primary-foreground/90 transition hover:bg-primary-foreground/10"
            >
              <Calculator className="size-4" />
              Try Tax Calculator
            </button>
            <p className="text-xs text-primary-foreground/50">
              Free consultation · No hidden fees
            </p>
          </div>
        </div>
      </article>

      {showModal && <TaxRequestModal onClose={() => setShowModal(false)} />}

      {/* ── Quick actions ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK_ACTIONS.map(({ label, description, icon: Icon, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="group flex flex-col items-start gap-3 rounded-3xl border border-border/70 bg-background/90 p-5 text-left shadow-sm  hover:border-primary/40"
          >
            <div className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary  group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{label}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Why choose us ────────────────────────────────────────── */}
      <article className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm md:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Why TaxDibo
        </p>
        <h3 className="mt-2 text-xl font-semibold text-foreground">
          Built for stress-free tax filing
        </h3>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col gap-2">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <p className="font-medium text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </article>

      {/* ── How it works ─────────────────────────────────────────── */}
      <article className="rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm md:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
          Process
        </p>
        <h3 className="mt-2 text-xl font-semibold text-foreground">
          How it works
        </h3>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, description }, i) => (
            <div key={title} className="relative flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <Icon className="size-4 text-primary" />
              </div>
              <p className="font-medium text-foreground">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </article>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <article className="flex flex-col items-start gap-4 rounded-3xl border border-primary/30 bg-primary/10 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Ready to get your taxes sorted?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Book a session with a certified tax professional today.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="group flex shrink-0 items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
        >
          Book An Appointment
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </button>
      </article>
    </section>
  );
}
