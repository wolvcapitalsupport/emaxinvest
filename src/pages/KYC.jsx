import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { base44, supabase } from "@/api/base44Client";
import { ShieldCheck, Upload, Clock, XCircle, CheckCircle2, AlertCircle } from "lucide-react";

const DOCUMENT_SLOTS = [
  { type: "id_front", label: "Government ID — Front" },
  { type: "id_back", label: "Government ID — Back" },
  { type: "proof_of_address", label: "Proof of Address" },
];

export default function KYC() {
  const [user, setUser] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const u = await base44.auth.me();
      setUser(u);
      await loadLatestVerification(u.id);
      setLoading(false);
    })();
  }, []);

  const loadLatestVerification = async (userId) => {
    const { data, error: fetchError } = await supabase
      .from("kyc_verifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);
    if (!fetchError && data?.length) setVerification(data[0]);
    else setVerification(null);
  };

  const handleFileChange = (type, file) => {
    setFiles((f) => ({ ...f, [type]: file }));
  };

  const canSubmit = DOCUMENT_SLOTS.every((slot) => files[slot.type]);

  const handleSubmit = async () => {
    setError("");
    if (!canSubmit) {
      setError("Please select all three documents before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      // 1. Create the verification record
      const { data: verificationRows, error: vError } = await supabase
        .from("kyc_verifications")
        .insert({ user_id: user.id, provider: "manual", status: "pending" })
        .select()
        .limit(1);
      if (vError) throw vError;
      const verificationId = verificationRows[0].id;

      // 2. Upload each file and record it
      for (const slot of DOCUMENT_SLOTS) {
        const file = files[slot.type];
        const ext = file.name.split(".").pop();
        const path = `${user.id}/${verificationId}/${slot.type}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage.from("kyc-documents").upload(path, file, {
          contentType: file.type,
          upsert: false,
        });
        if (uploadError) throw uploadError;

        const { error: docError } = await supabase.from("kyc_documents").insert({
          kyc_verification_id: verificationId,
          user_id: user.id,
          provider: "manual",
          storage_bucket: "kyc-documents",
          storage_object_path: path,
          document_type: slot.type,
        });
        if (docError) throw docError;
      }

      await loadLatestVerification(user.id);
      setFiles({});
    } catch (err) {
      setError(err.message || "Something went wrong submitting your documents. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout user={user}>
        <div className="p-8 text-center text-muted-foreground">Loading…</div>
      </AppLayout>
    );
  }

  const status = verification?.status; // 'pending' | 'approved' | 'rejected' | undefined

  return (
    <AppLayout user={user}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck size={22} className="text-primary" />
          <h1 className="text-xl font-bold">Identity Verification</h1>
        </div>

        {status === "approved" && (
          <div className="flex items-center gap-3 p-5 bg-green-900/10 border border-green-800/30 rounded-2xl">
            <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-300">Verified</p>
              <p className="text-xs text-muted-foreground mt-0.5">Your identity has been verified. No further action is needed.</p>
            </div>
          </div>
        )}

        {status === "pending" && (
          <div className="flex items-center gap-3 p-5 bg-amber-900/10 border border-amber-800/30 rounded-2xl">
            <Clock size={20} className="text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Under review</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your documents were submitted on {new Date(verification.submitted_at).toLocaleDateString()} and are awaiting review.
              </p>
            </div>
          </div>
        )}

        {status === "rejected" && (
          <div className="flex items-center gap-3 p-5 bg-red-900/10 border border-red-800/30 rounded-2xl">
            <XCircle size={20} className="text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-300">Verification declined</p>
              {verification.result && <p className="text-xs text-muted-foreground mt-0.5">{verification.result}</p>}
              <p className="text-xs text-muted-foreground mt-1">You can submit new documents below.</p>
            </div>
          </div>
        )}

        {(!status || status === "rejected") && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <p className="text-sm text-muted-foreground">
              Upload the documents below to verify your identity. Accepted formats: JPG, PNG, PDF.
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/10 border border-red-800/30 rounded-lg">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-xs text-red-300">{error}</p>
              </div>
            )}

            {DOCUMENT_SLOTS.map((slot) => (
              <div key={slot.type} className="space-y-2">
                <label className="text-xs text-muted-foreground block">{slot.label}</label>
                <label className="flex items-center gap-3 border border-dashed border-border rounded-xl px-4 py-4 cursor-pointer hover:border-primary transition-colors">
                  <Upload size={16} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">
                    {files[slot.type] ? files[slot.type].name : "Choose a file…"}
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(slot.type, e.target.files?.[0])}
                  />
                </label>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #93C5FD, #BFDBFE)", color: "#0c0f18" }}
            >
              {submitting ? "Submitting…" : "Submit for verification"}
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
