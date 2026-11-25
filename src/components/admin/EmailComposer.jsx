import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Send } from "lucide-react";
import { sendCustomerEmail } from "@/lib/admin-fns";
import { formatDateTime, listRecords } from "@/lib/admin-api";
import { inputClass } from "@/components/admin/FormKit";
import { StatusBadge } from "@/components/admin/ui";

export function EmailComposer({ customer, projectId }) {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [state, setState] = useState({ status: "idle", message: "" });

  const { data: history = [] } = useQuery({
    queryKey: ["communications", customer.id],
    queryFn: () => listRecords("Communication", { customer_id: customer.id }, { sort: "-created_date", limit: 50 }),
  });

  const send = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    setState({ status: "sending", message: "" });
    try {
      const result = await sendCustomerEmail({
        data: { customer_id: customer.id, project_id: projectId || "", subject, body },
      });
      if (result.ok) {
        setState({ status: "sent", message: `Confirmed sent to ${result.to}` });
        setSubject("");
        setBody("");
        queryClient.invalidateQueries({ queryKey: ["communications", customer.id] });
      } else {
        setState({ status: "error", message: result.error });
      }
    } catch {
      setState({ status: "error", message: "The email could not be sent. Nothing was delivered." });
    }
  };

  return (
    <div className="rounded-sm border border-border bg-white">
      <div className="border-b border-border px-4 py-3">
        <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">Email customer</p>
        <p className="mt-1 text-[11.5px] text-muted-foreground">
          Sends to <span className="text-foreground">{customer.email || "no email on file"}</span> — the address stored on
          this customer record.
        </p>
      </div>

      <form onSubmit={send} className="space-y-2 p-4">
        <input
          className={inputClass}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          disabled={!customer.email}
        />
        <textarea
          className={`${inputClass} min-h-[110px] resize-y`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write your message…"
          disabled={!customer.email}
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-muted-foreground">
            {state.status === "sent" && (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <Check className="h-3 w-3" /> {state.message}
              </span>
            )}
            {state.status === "error" && <span className="text-destructive">{state.message}</span>}
          </span>
          <button
            type="submit"
            disabled={state.status === "sending" || !customer.email}
            className="inline-flex items-center gap-1.5 rounded-sm bg-obsidian px-3.5 py-2 text-[12px] font-medium text-white disabled:opacity-60"
          >
            {state.status === "sending" ? (
              <>
                Sending <Loader2 className="h-3.5 w-3.5 animate-spin" />
              </>
            ) : (
              <>
                Send email <Send className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </form>

      {history.length > 0 && (
        <ul className="divide-y divide-border border-t border-border">
          {history.map((item) => (
            <li key={item.id} className="px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-[12.5px] font-medium">{item.subject}</p>
                <StatusBadge value={item.status} />
              </div>
              <p className="mt-1 line-clamp-2 text-[11.5px] text-muted-foreground">{item.body}</p>
              <p className="mt-1 font-mono text-[9.5px] text-muted-foreground">
                {item.direction} · {formatDateTime(item.sent_at || item.created_date)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}