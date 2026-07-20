import { useEffect, useState } from "react";
import { supabase, base44 } from "@/api/base44Client";
import { Mail, Send, Users, User, AlertCircle, CheckCircle } from "lucide-react";

const TEMPLATES = [
  {
    id: "investment_approved",
    label: "Investment Approved",
    fields: [
      { name: "plan", label: "Plan", type: "text", placeholder: "Growth" },
      { name: "amount", label: "Amount ($)", type: "number" },
      { name: "roi_percentage", label: "ROI %", type: "number" },
      { name: "maturity_date", label: "Maturity Date", type: "date" },
    ],
  },
  {
    id: "investment_rejected",
    label: "Investment Rejected",
    fields: [
      { name: "plan", label: "Plan", type: "text", placeholder: "Growth" },
      { name: "amount", label: "Amount ($)", type: "number" },
      { name: "admin_note", label: "Reason", type: "text" },
    ],
  },
  {
    id: "principal_release_approved",
    label: "Principal Released",
    fields: [
      { name: "plan", label: "Plan", type: "text", placeholder: "Growth" },
      { name: "amount", label: "Amount ($)", type: "number" },
      { name: "principal_released_date", label: "Released Date", type: "date" },
    ],
  },
  {
    id: "principal_release_rejected",
    label: "Principal Release Declined / Renewed",
    fields: [
      { name: "plan", label: "Plan", type: "text", placeholder: "Growth" },
      { name: "amount", label: "Amount ($)", type: "number" },
      { name: "admin_note", label: "Note", type: "text" },
    ],
  },
  {
    id: "withdrawal_approved",
    label: "Withdrawal Approved",
    fields: [
      { name: "amount", label: "Amount ($)", type: "number" },
      { name: "wallet_type", label: "Wallet Type", type: "text", placeholder: "USDT (BEP-20)" },
    ],
  },
  {
    id: "withdrawal_rejected",
    label: "Withdrawal Rejected",
    fields: [
      { name: "amount", label: "Amount ($)", type: "number" },
      { name: "admin_note", label: "Reason", type: "text" },
    ],
  },
  {
    id: "withdrawal_paid",
    label: "Withdrawal Paid",
    fields: [
      { name: "amount", label: "Amount ($)", type: "number" },
      { name: "wallet_type", label: "Wallet Type", type: "text", placeholder: "USDT (BEP-20)" },
      { name: "wallet_address", label: "Destination Address", type: "text" },
    ],
  },
  {
    id: "account_status_changed",
    label: "Account Status Changed",
    fields: [{ name: "account_status", label: "New Status", type: "text", placeholder: "suspended" }],
  },
];

export default function AdminSendEmail() {
  const [audience, setAudience] = useState("single");
  const [mode, setMode] = useState("freeform");
  const [to, setTo] = useState("");
  const [knownEmails, setKnownEmails] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [templateData, setTemplateData] = useState({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    base44.entities.UserProfile.list()
      .then((profiles) => setKnownEmails((profiles || []).map((p) => p.user_email).filter(Boolean)))
      .catch(() => {});
  }, []);

  const selectedTemplate = TEMPLATES.find((t) => t.id === templateId);

  const handleFieldChange = (name, value) => {
    setTemplateData((d) => ({ ...d, [name]: value }));
  };

  const handleSend = async () => {
    setError("");
    setResult(null);

    if (audience === "single" && !to.trim()) {
      setError("Enter a recipient email.");
      return;
    }
    if (mode === "freeform" && (!subject.trim() || !message.trim())) {
      setError("Subject and message are required.");
      return;
    }

    if (audience === "broadcast") {
      const confirmed = window.confirm(
        "This will send an email to every registered user. Are you sure you want to continue?"
      );
      if (!confirmed) return;
    }

    setSending(true);
    try {
      const body =
        mode === "freeform"
          ? { audience, to: to.trim(), mode, subject: subject.trim(), message: message.trim() }
          : { audience, to: to.trim(), mode, templateId, templateData };

      const { data, error: fnError } = await supabase.functions.invoke("admin-send-email", { body });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-2">
        <Mail size={18} className="text-primary" />
        <h3 className="text-sm font-semibold">Send Email</h3>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-900/10 border border-red-800/30 rounded-xl">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}
      {result && (
        <div className="flex items-center gap-2 p-4 bg-green-900/10 border border-green-800/30 rounded-xl">
          <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
          <p className="text-sm text-green-300">
            {audience === "broadcast"
              ? `Sent to ${result.sent} recipient(s)${result.failedCount ? `, ${result.failedCount} failed` : ""}.`
              : "Email sent."}
          </p>
        </div>
      )}

      {/* Audience */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground block">Send to</label>
        <div className="flex gap-2">
          <button
            onClick={() => setAudience("single")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all ${
              audience === "single" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
            }`}
          >
            <User size={14} /> Single user
          </button>
          <button
            onClick={() => setAudience("broadcast")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border transition-all ${
              audience === "broadcast" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
            }`}
          >
            <Users size={14} /> Broadcast (all users)
          </button>
        </div>
      </div>

      {audience === "single" && (
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground block">Recipient email</label>
          <input
            list="known-emails"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="user@example.com"
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <datalist id="known-emails">
            {knownEmails.map((email) => (
              <option key={email} value={email} />
            ))}
          </datalist>
        </div>
      )}

      {/* Mode */}
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground block">Compose</label>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("freeform")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
              mode === "freeform" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
            }`}
          >
            Free-form message
          </button>
          <button
            onClick={() => setMode("template")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all ${
              mode === "template" ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"
            }`}
          >
            Use a template
          </button>
        </div>
      </div>

      {mode === "freeform" ? (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground block">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="An update on your account"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground block">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="Write your message. Blank lines start a new paragraph."
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground block">Template</label>
            <select
              value={templateId}
              onChange={(e) => {
                setTemplateId(e.target.value);
                setTemplateData({});
              }}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              {TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          {selectedTemplate?.fields.map((f) => (
            <div key={f.name} className="space-y-2">
              <label className="text-xs text-muted-foreground block">{f.label}</label>
              <input
                type={f.type}
                placeholder={f.placeholder}
                value={templateData[f.name] || ""}
                onChange={(e) => handleFieldChange(f.name, e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={sending}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
      >
        <Send size={16} />
        {sending ? "Sending..." : audience === "broadcast" ? "Send to all users" : "Send email"}
      </button>
    </div>
  );
}
