import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { toast } from "sonner";
import { api } from "lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [token, setToken] = useState(params.get("token") || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match");
    if (password.length < 6) return toast.error("Min 6 characters");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      toast.success("Password reset. Please log in.");
      nav("/login");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-14">
      <div className="w-full max-w-md">
        <h1 className="font-display font-black text-3xl tracking-tighter text-white">Set a new password</h1>
        <p className="text-zinc-400 mt-2 text-sm">Choose a strong password you'll remember.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5" data-testid="reset-form">
          {!params.get("token") && (
            <div>
              <Label className="text-zinc-400 text-xs uppercase tracking-widest">Reset token</Label>
              <Input required value={token} onChange={(e) => setToken(e.target.value)}
                className="mt-2 h-12 bg-zinc-900 border-zinc-800 rounded-xl text-white"
                data-testid="reset-token-input" />
            </div>
          )}
          <div>
            <Label className="text-zinc-400 text-xs uppercase tracking-widest">New password</Label>
            <Input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-2 h-12 bg-zinc-900 border-zinc-800 rounded-xl text-white focus-visible:ring-[#FFD60A]"
              data-testid="reset-password-input" />
          </div>
          <div>
            <Label className="text-zinc-400 text-xs uppercase tracking-widest">Confirm password</Label>
            <Input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="mt-2 h-12 bg-zinc-900 border-zinc-800 rounded-xl text-white focus-visible:ring-[#FFD60A]"
              data-testid="reset-confirm-input" />
          </div>
          <Button disabled={loading} type="submit" className="w-full h-12 rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold" data-testid="reset-submit-btn">
            {loading ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      </div>
    </div>
  );
}
