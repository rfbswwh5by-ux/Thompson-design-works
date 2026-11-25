import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { submitInquiry } from "@/lib/public-fns";

const WEBSITE_TYPES = [
  "Custom website",
  "Business website",
  "Restaurant website",
  "E-commerce store",
  "Landing page",
  "Website redesign",
  "Maintenance & updates",
  "Something else",
];

const EMPTY = {
  full_name: "",
  business_name: "",
  email: "",
  phone: "",
  website_type: "",
  project_description: "",
  budget: "",
  additional_info: "",
};

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;

function validate(form) {
  const errors = {};
  if (form.full_name.trim().length < 2) errors.full_name = "Please enter your full name.";
  if (!EMAIL_RE.test(form.email.trim())) errors.email = "Please enter a valid email address.";
  if (form.project_description.trim().length < 10)
    errors.project_description = "Tell us a little about the project (at least 10 characters).";
  return errors;
}

const inputClass =
  "w-full rounded-sm border border-input bg-white px-3.5 py-3 text-[14px] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40";

export function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverError, setServerError] = useState("");

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus("sending");
    setServerError("");
    try {
      const result = await submitInquiry({ data: form });
      if (result && result.ok === false) {
        setStatus("idle");
        setServerError(result.error || "Something went wrong sending your inquiry. Please email us directly.");
        return;
      }
      setStatus("sent");
      setForm(EMPTY);
    } catch (error) {
      setStatus("idle");
      setServerError(
        error?.message?.includes("validation")
          ? "Please check the details above and try again."
          : "Something went wrong sending your inquiry. Please email us directly.",
      );
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-sm border border-border bg-white p-8 sm:p-12">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50">
          <Check className="h-5 w-5 text-emerald-600" strokeWidth={2.5} />
        </span>
        <h2 className="mt-6 font-heading text-[22px] font-medium">Thank you — your inquiry is in.</h2>
        <p className="mt-3 max-w-md text-[14px] leading-relaxed text-muted-foreground">
          We review every project personally and will respond by email with next steps. If it is time-sensitive, call
          and leave a message.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-7 text-[13px] font-medium text-brand"
        >
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-sm border border-border bg-white p-6 sm:p-9" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required error={errors.full_name}>
          <input className={inputClass} value={form.full_name} onChange={set("full_name")} placeholder="Jane Doe" autoComplete="name" />
        </Field>
        <Field label="Business name">
          <input className={inputClass} value={form.business_name} onChange={set("business_name")} placeholder="Doe & Co." autoComplete="organization" />
        </Field>
        <Field label="Email address" required error={errors.email}>
          <input className={inputClass} type="email" value={form.email} onChange={set("email")} placeholder="you@business.com" autoComplete="email" />
        </Field>
        <Field label="Phone number">
          <input className={inputClass} value={form.phone} onChange={set("phone")} placeholder="(555) 555-5555" autoComplete="tel" />
        </Field>
        <Field label="Type of website needed" className="sm:col-span-2">
          <select className={inputClass} value={form.website_type} onChange={set("website_type")}>
            <option value="">Select one (optional)</option>
            {WEBSITE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Project description" required error={errors.project_description} className="sm:col-span-2">
          <textarea
            className={`${inputClass} min-h-[130px] resize-y`}
            value={form.project_description}
            onChange={set("project_description")}
            placeholder="What is your business, and what should the website accomplish?"
          />
        </Field>
        <Field label="Estimated budget" hint="Optional — a range is fine.">
          <input className={inputClass} value={form.budget} onChange={set("budget")} placeholder="Optional" />
        </Field>
        <Field label="Additional information">
          <input className={inputClass} value={form.additional_info} onChange={set("additional_info")} placeholder="Anything else we should know" />
        </Field>
      </div>

      {serverError && (
        <p className="mt-5 rounded-sm border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-[13px] text-destructive">
          {serverError}
        </p>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        <p className="max-w-xs text-[11.5px] leading-relaxed text-muted-foreground">
          No account required. Your information is used only to respond to your inquiry.
        </p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="group inline-flex items-center gap-2 rounded-sm bg-obsidian px-6 py-3.5 text-[13.5px] font-medium text-white transition-colors hover:bg-brand disabled:opacity-60"
        >
          {status === "sending" ? (
            <>
              Sending <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              Send inquiry <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children, required, error, hint, className }) {
  return (
    <label className={`block ${className || ""}`}>
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label} {required && <span className="text-brand">*</span>}
        </span>
        {hint && <span className="text-[10.5px] text-muted-foreground/70">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-[11.5px] text-destructive">{error}</span>}
    </label>
  );
}