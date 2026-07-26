import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../components/AuthLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../lib/api/client";

const FIELDS = [
  { name: "name", label: "Full name", type: "text", placeholder: "Rafsun Jani", required: true },
  { name: "email", label: "Email", type: "email", placeholder: "you@example.com", required: true },
  { name: "password", label: "Password", type: "password", placeholder: "8+ characters", required: true },
  { name: "phone", label: "Phone", type: "tel", placeholder: "+8801711000000", required: true },
  { name: "company", label: "Company (optional)", type: "text", placeholder: "Your company", required: false },
  { name: "address", label: "Address (optional)", type: "text", placeholder: "Dhaka, Bangladesh", required: false },
] as const;

type FieldName = (typeof FIELDS)[number]["name"];
type FormState = Record<FieldName, string>;

const EMPTY: FormState = { name: "", email: "", password: "", phone: "", company: "", address: "" };

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        company: form.company || undefined,
        address: form.address || undefined,
      });
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setFieldErrors(err.errors ?? {});
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Get started with TaxDibo in minutes">
      <form onSubmit={handleSubmit} className="space-y-4">
        {FIELDS.map(({ name, label, type, placeholder, required }) => (
          <label key={name} className="flex flex-col gap-1.5">
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {label}
            </span>
            <input
              type={type}
              required={required}
              placeholder={placeholder}
              value={form[name]}
              onChange={(e) => setForm((prev) => ({ ...prev, [name]: e.target.value }))}
              className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring/40"
            />
            {fieldErrors[name] && (
              <span className="text-xs text-destructive">{fieldErrors[name]}</span>
            )}
          </label>
        ))}

        {error && (
          <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
