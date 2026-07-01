import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";

export default function AuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (user) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("AuthRedirect error:", error);
        navigate("/login", { replace: true });
      }
    };

    redirect();
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}
