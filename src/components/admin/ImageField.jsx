import { useRef, useState } from "react";
import { Image } from "@/components/ui/image";
import { db } from "@/lib/db-client";
import { inputClass } from "@/components/admin/FormKit";
import { Loader2, Upload } from "lucide-react";

/** URL field with a direct upload to Vercel Blob storage (website imagery). */
export function ImageField({ value, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const { file_url } = await db.integrations.Core.UploadPublicFile({ file });
      onChange(file_url);
    } catch (err) {
      setError(err?.message || "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          className={inputClass}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-border px-3 text-[12px] font-medium disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => upload(e.target.files?.[0])}
        />
      </div>
      {error && <p className="text-[11.5px] text-destructive">{error}</p>}
      {value && (
        <div className="overflow-hidden rounded-sm border border-border">
          <Image src={value} alt="Preview" fittingType="fill" className="h-24 w-full object-cover" />
        </div>
      )}
    </div>
  );
}