import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { ImageField } from "@/components/admin/ImageField";
import { cn } from "@/lib/utils";

export const inputClass =
  "w-full rounded-sm border border-input bg-white px-3 py-2.5 text-[13.5px] outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40";

export function Field({ label, hint, children, className }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
        {hint && <span className="text-[10px] text-muted-foreground/70">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function SwitchRow({ label, description, checked, onCheckedChange }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-sm border border-border bg-white px-3.5 py-3">
      <div>
        <p className="text-[13px] font-medium">{label}</p>
        {description && <p className="mt-0.5 text-[11.5px] text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={!!checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function renderField(field, value, onChange) {
  if (field.type === "textarea") {
    return (
      <textarea
        className={cn(inputClass, "min-h-[90px] resize-y")}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
      />
    );
  }
  if (field.type === "select") {
    return (
      <select className={inputClass} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
        {field.placeholder && <option value="">{field.placeholder}</option>}
        {(field.options || []).map((option) => {
          const value_ = typeof option === "string" ? option : option.value;
          const label = typeof option === "string" ? option : option.label;
          return (
            <option key={value_} value={value_}>
              {label}
            </option>
          );
        })}
      </select>
    );
  }
  if (field.type === "switch") {
    return (
      <SwitchRow
        label={field.switchLabel || field.label}
        checked={!!value}
        onCheckedChange={onChange}
      />
    );
  }
  if (field.type === "image") {
    return <ImageField value={value} onChange={onChange} />;
  }
  if (field.type === "list") {
    return (
      <textarea
        className={cn(inputClass, "min-h-[80px] resize-y font-mono text-[12px]")}
        value={Array.isArray(value) ? value.join("\n") : value ?? ""}
        onChange={(e) => onChange(e.target.value.split("\n").map((v) => v.trim()).filter(Boolean))}
        placeholder={field.placeholder || "One item per line"}
      />
    );
  }
  return (
    <input
      className={inputClass}
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
      value={value ?? ""}
      onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
      placeholder={field.placeholder}
    />
  );
}

export function RecordDialog({ open, onOpenChange, title, description, fields, initial, onSubmit, submitLabel }) {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const seed = {};
    fields.forEach((f) => {
      seed[f.name] = initial?.[f.name] ?? (f.type === "switch" ? false : f.type === "list" ? [] : "");
    });
    setValues(seed);
  }, [open, initial, fields]);

  const set = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">{title}</DialogTitle>
          {description && <DialogDescription className="text-[12.5px]">{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <Field
                key={field.name}
                label={field.label}
                hint={field.hint}
                className={field.full ? "sm:col-span-2" : ""}
              >
                {renderField(field, values[field.name], (v) => set(field.name, v))}
              </Field>
            ))}
          </div>
          <DialogFooter className="gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-sm border border-border px-4 py-2.5 text-[13px] font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-sm bg-obsidian px-4 py-2.5 text-[13px] font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : submitLabel || "Save"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}