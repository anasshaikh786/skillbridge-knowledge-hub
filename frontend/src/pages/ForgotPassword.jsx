import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { toast } from "sonner";
import { api } from "lib/api";
import { KeyRound } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setSent(true);
      if (data.dev_token) setDevToken(data.dev_token);
      toast.success("Reset link sent (if email exists)");
    } catch {
      toast.error("Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-14">
      <div className="w-full max-w-md">
        <div className="h-14 w-14 rounded-2xl bg-[#FFD60A]/10 grid place-items-center">
          <KeyRound className="h-7 w-7 text-[#FFD60A]" />
        </div>
        <h1 className="font-display font-black text-3xl tracking-tighter text-white mt-6">Reset your password</h1>
        <p className="text-zinc-400 mt-2 text-sm">Enter your email and we'll send you a reset link.</p>

        {!sent ? (
          <form onSubmit={onSubmit} className="mt-8 space-y-5" data-testid="forgot-form">
            <div>
              <Label className="text-zinc-400 text-xs uppercase tracking-widest">Email</Label>
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@skillbridge.dev"
                className="mt-2 h-12 bg-zinc-900 border-zinc-800 rounded-xl text-white focus-visible:ring-[#FFD60A] focus-visible:ring-offset-0"
                data-testid="forgot-email-input" />
            </div>
            <Button disabled={loading} type="submit" className="w-full h-12 rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold" data-testid="forgot-submit-btn">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        ) : (
          <div className="mt-8 p-6 bg-[#121214] border border-zinc-800 rounded-2xl" data-testid="forgot-sent-panel">
            <p className="text-white text-sm">If an account with that email exists, we've sent a reset link.</p>
            {devToken && (
              <>
                <p className="text-xs text-zinc-500 mt-4">Dev mode — use this token:</p>
                <div className="mt-2 p-3 bg-zinc-900 rounded-lg text-xs font-mono break-all text-[#FFD60A]" data-testid="dev-reset-token">
                  {devToken}
                </div>
                <Link to={`/reset-password?token=${devToken}`} className="inline-block mt-4">
                  <Button className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold">Reset now</Button>
                </Link>
              </>
            )}
          </div>
        )}

        <Link to="/login" className="text-xs text-zinc-500 hover:text-white mt-8 inline-block">← Back to login</Link>
      </div>
    </div>
  );
}
