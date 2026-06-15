import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaxRequestModalProps {
  onClose: () => void;
}

const FIELDS = [
  { name: "fullName",     label: "Full Name",     type: "text",  placeholder: "John Doe" },
  { name: "email",        label: "Email",          type: "email", placeholder: "john@example.com" },
  { name: "phone",        label: "Phone",          type: "tel",   placeholder: "+880 1X XX XXX XXX" },
  { name: "tinNumber",       label: "TIN Number",      type: "text", placeholder: "12-digit TIN" },
  { name: "companyName",    label: "Company Name",    type: "text", placeholder: "Your company" },
  { name: "officeAddress",  label: "Office Address",  type: "text", placeholder: "123 Business Ave, Dhaka" },
  { name: "livingAddress",  label: "Living Address",  type: "text", placeholder: "456 Home Street, Dhaka" },
] as const;

type FieldName = (typeof FIELDS)[number]["name"];
type FormState = Record<FieldName, string>;

const EMPTY: FormState = {
  fullName: "",
  email: "",
  phone: "",
  tinNumber: "",
  companyName: "",
  officeAddress: "",
  livingAddress: "",
};

export default function TaxRequestModal({ onClose }: TaxRequestModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-2xl shadow-black/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">
              Tax services
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              Request for Tax Pay
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 text-2xl">
                ✓
              </div>
              <h3 className="text-lg font-semibold text-foreground">Request submitted!</h3>
              <p className="text-sm text-muted-foreground">
                We'll review your request and get back to you shortly.
              </p>
              <Button className="mt-2" onClick={onClose}>Done</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {FIELDS.map(({ name, label, type, placeholder }) => (
                <label key={name} className="flex flex-col gap-1.5">
                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {label}
                  </span>
                  <input
                    type={type}
                    placeholder={placeholder}
                    required
                    value={form[name]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [name]: e.target.value }))
                    }
                    className="rounded-xl border border-border/70 bg-muted/60 px-4 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring/40"
                  />
                </label>
              ))}

              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">
                  Submit Request
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
