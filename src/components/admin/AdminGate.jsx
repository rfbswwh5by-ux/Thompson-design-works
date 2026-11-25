import { useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole, ShieldAlert } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { inputClass } from "@/components/admin/FormKit";
import { useAdmin } from "@/lib/AdminContext";
import { recoverAdminCode } from "@/lib/server-fns";

function Frame({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5 py-12">
      <div className="w-full max-w-md rounded-sm border border-border bg-white px-7 py-10 sm:px-10 sm:py-12">{children}</div>
    </div>
  );
}

const primaryButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-sm bg-obsidian px-4 py-3 text-[12.5px] font-medium text-white disabled:opacity-50";
const secondaryButton =
  "inline-flex w-full items-center justify-center gap-2 rounded-sm border border-border px-4 py-2.5 text-[12px] font-medium disabled:opacity-50";

/** Shows the dashboard once signed in; otherwise the claim, sign-in or recovery screen. */
export function AdminGate({ children }) {
  const { status, businessName, loadError, login, claim, retry } = useAdmin();
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [notice, setNotice] = useState("");

  if (status === "unlocked") return children;

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Loading studio…</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <Frame>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brand">Dashboard</p>
        <h1 className="mt-3 font-heading text-2xl font-medium">Can’t open the dashboard</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{loadError}</p>
        <button type="button" onClick={retry} className={`${primaryButton} mt-6`}>
          Try again
        </button>
      </Frame>
    );
  }

  const isSetup = status === "setup";

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (isSetup && code !== confirm) {
      setError("The two codes do not match.");
      return;
    }
    setBusy(true);
    try {
      const res = isSetup ? await claim(code, setupKey) : await login(code);
      if (!res?.ok) setError(res?.error || "That code is not correct.");
      else {
        setCode("");
        setConfirm("");
        setSetupKey("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const resetAccess = async () => {
    setNotice("");
    setError("");
    setResetBusy(true);
    try {
      const res = await recoverAdminCode({ data: { code: resetCode, setupKey } });
      if (res?.ok) {
        setNotice("Access code reset. Enter your new code above to sign in.");
        setCode("");
        setResetCode("");
        setSetupKey("");
        setRecovery(false);
      } else {
        setError(res?.error || "Could not reset the access code.");
      }
    } catch {
      setError("Could not reset the access code. Check the setup key and try again.");
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <Frame>
      <div className="flex flex-col items-center text-center">
        <BrandMark className="h-10 w-10" />
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-brand">
          {isSetup ? "First-time setup" : "Studio dashboard"}
        </p>
        <h1 className="mt-3 font-heading text-2xl font-medium">{isSetup ? "Claim this website" : "Enter your access code"}</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {isSetup
            ? "This site has no administrator code yet. Enter the setup key and choose an access code to become the owner. Choose something long and unique, and keep it safe."
            : `Dashboard for ${businessName || "this website"}. Enter your access code.`}
        </p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <div className="relative">
          <input
            type={visible ? "text" : "password"}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={isSetup ? "Choose an access code" : "Access code"}
            autoComplete={isSetup ? "new-password" : "current-password"}
            autoFocus
            aria-label={isSetup ? "Choose an access code" : "Access code"}
            className={`${inputClass} pr-11 font-mono`}
          />
          <button
            type="button"
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? "Hide code" : "Show code"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {isSetup && (
          <>
            <input
              type={visible ? "text" : "password"}
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Confirm access code"
              aria-label="Confirm access code"
              autoComplete="new-password"
              className={`${inputClass} font-mono`}
            />
            <input
              type="password"
              value={setupKey}
              onChange={(event) => setSetupKey(event.target.value)}
              placeholder="Setup key (ADMIN_SETUP_KEY)"
              aria-label="Setup key"
              autoComplete="off"
              className={`${inputClass} font-mono`}
            />
          </>
        )}

        {error && (
          <div className="flex items-start gap-2 pt-1 text-destructive">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p className="text-[12px] leading-relaxed">{error}</p>
          </div>
        )}

        <button type="submit" disabled={busy || !code || (isSetup && !setupKey)} className={primaryButton}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LockKeyhole className="h-3.5 w-3.5" />}
          {busy ? "Checking…" : isSetup ? "Set code & enter" : "Enter dashboard"}
        </button>
      </form>

      {notice && <p className="mt-4 text-center text-[12px] leading-relaxed text-emerald-700">{notice}</p>}

      {!isSetup && (
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setRecovery((prev) => !prev)}
            className="text-[11.5px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Lost your access code?
          </button>
        </div>
      )}

      {recovery && !isSetup && (
        <div className="mt-4 space-y-2 rounded-sm border border-border p-4">
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            Reset the owner code with the site’s setup key (the ADMIN_SETUP_KEY value in the Vercel project settings).
            Every open dashboard session is signed out.
          </p>
          <input
            type="password"
            value={setupKey}
            onChange={(event) => setSetupKey(event.target.value)}
            placeholder="Setup key"
            aria-label="Setup key for reset"
            autoComplete="off"
            className={`${inputClass} font-mono`}
          />
          <input
            type="password"
            value={resetCode}
            onChange={(event) => setResetCode(event.target.value)}
            placeholder="New access code (8+ characters)"
            aria-label="New access code"
            autoComplete="new-password"
            className={`${inputClass} font-mono`}
          />
          <button
            type="button"
            onClick={resetAccess}
            disabled={resetBusy || resetCode.length < 8 || !setupKey}
            className={secondaryButton}
          >
            {resetBusy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {resetBusy ? "Resetting…" : "Reset access code"}
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-[10.5px] leading-relaxed text-muted-foreground">
        {isSetup
          ? "You need the site’s setup key (ADMIN_SETUP_KEY) to claim it. Whoever sets this code first becomes the owner."
          : "Codes are stored as salted hashes. Sessions expire after 8 hours, and repeated wrong attempts are locked out for 15 minutes."}
      </p>
    </Frame>
  );
}
