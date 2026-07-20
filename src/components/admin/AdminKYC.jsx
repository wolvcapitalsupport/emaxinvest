import { useEffect, useState } from "react";
import { base44, supabase } from "@/api/base44Client";
import { ShieldCheck, CheckCircle2, XCircle, FileText, Loader2 } from "lucide-react";

const STATUS_FILTERS = ["pending", "approved", "rejected", "all"];

export default function AdminKYC() {
  const [filter, setFilter] = useState("pending");
  const [verifications, setVerifications] = useState([]);
  const [profilesByUserId, setProfilesByUserId] = useState({});
  const [documentsByVerification, setDocumentsByVerification] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      let query = supabase.from("kyc_verifications").select("*").order("submitted_at", { ascending: false });
      if (filter !== "all") query = query.eq("status", filter);
      const { data: verificationRows, error: vError } = await query;
      if (vError) throw vError;
      setVerifications(verificationRows || []);

      if (verificationRows?.length) {
        const userIds = [...new Set(verificationRows.map((v) => v.user_id))];
        const profiles = await base44.entities.UserProfile.list();
        const profileMap = {};
        (profiles || []).forEach((p) => {
          if (userIds.includes(p.user_id)) profileMap[p.user_id] = p;
        });
        setProfilesByUserId(profileMap);

        const verificationIds = verificationRows.map((v) => v.id);
        const { data: docs } = await supabase
          .from("kyc_documents")
          .select("*")
          .in("kyc_verification_id", verificationIds);
        const docMap = {};
        (docs || []).forEach((d) => {
          if (!docMap[d.kyc_verification_id]) docMap[d.kyc_verification_id] = [];
          docMap[d.kyc_verification_id].push(d);
        });
        setDocumentsByVerification(docMap);
      } else {
        setProfilesByUserId({});
        setDocumentsByVerification({});
      }
    } catch (err) {
      setError(err.message || "Failed to load KYC submissions.");
    } finally {
      setLoading(false);
    }
  };

  const openDocument = async (doc) => {
    const { data, error: signError } = await supabase.storage
      .from(doc.storage_bucket)
      .createSignedUrl(doc.storage_object_path, 300);
    if (signError || !data?.signedUrl) {
      alert("Could not open document: " + (signError?.message || "unknown error"));
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const handleDecision = async (verification, decision) => {
    let note = "";
    if (decision === "rejected") {
      note = window.prompt("Reason for rejection (shown to the user):") || "";
      if (note === null) return;
    }
    setBusyId(verification.id);
    try {
      const { error: updateError } = await supabase
        .from("kyc_verifications")
        .update({
          status: decision,
          result: decision === "rejected" ? note : "Verified",
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", verification.id);
      if (updateError) throw updateError;
      await loadData();
    } catch (err) {
      alert("Failed to update: " + (err.message || "unknown error"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck size={18} className="text-primary" />
        <h3 className="text-sm font-semibold">KYC Review</h3>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${
              filter === f ? "border-transparent text-slate-900" : "border-border text-muted-foreground hover:text-foreground"
            }`}
            style={filter === f ? { background: "linear-gradient(135deg, #93C5FD, #BFDBFE)" } : {}}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : verifications.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No {filter !== "all" ? filter : ""} submissions.</p>
      ) : (
        <div className="space-y-3">
          {verifications.map((v) => {
            const profile = profilesByUserId[v.user_id];
            const docs = documentsByVerification[v.id] || [];
            return (
              <div key={v.id} className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-semibold text-sm">{profile?.full_name || "Unknown user"}</p>
                    <p className="text-xs text-muted-foreground">{profile?.user_email || v.user_id}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {new Date(v.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full capitalize font-medium ${
                      v.status === "approved"
                        ? "bg-green-900/20 text-green-300 border border-green-800/30"
                        : v.status === "rejected"
                        ? "bg-red-900/20 text-red-300 border border-red-800/30"
                        : "bg-amber-900/20 text-amber-300 border border-amber-800/30"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {docs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => openDocument(doc)}
                      className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-border hover:border-primary transition-colors"
                    >
                      <FileText size={13} /> {doc.document_type?.replace(/_/g, " ") || "Document"}
                    </button>
                  ))}
                  {docs.length === 0 && <p className="text-xs text-muted-foreground">No documents attached.</p>}
                </div>

                {v.result && v.status === "rejected" && (
                  <p className="text-xs text-muted-foreground italic">Reason: {v.result}</p>
                )}

                {v.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleDecision(v, "approved")}
                      disabled={busyId === v.id}
                      className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-green-900/20 text-green-300 border border-green-800/30 hover:bg-green-900/30 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button
                      onClick={() => handleDecision(v, "rejected")}
                      disabled={busyId === v.id}
                      className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-red-900/20 text-red-300 border border-red-800/30 hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
