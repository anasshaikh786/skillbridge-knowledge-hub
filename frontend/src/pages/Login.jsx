import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { api } from "lib/api";
import { useAuth } from "store/auth";

const SIDE_IMG = "https://images.unsplash.com/photo-1758600587730-a11917c13b85?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGRhcmslMjBiYWNrZ3JvdW5kfGVufDB8fHx8MTc4NDAxMzU2M3ww&ixlib=rb-4.1.0&q=85";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.firstName}!`);
      nav(data.user.role === "Instructor" ? "/dashboard/instructor" : "/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:block relative">
        <img src={SIDE_IMG} alt="Learn" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#09090B]/95 via-[#09090B]/60 to-transparent" />
        <div className="absolute bottom-14 left-14 right-14">
          <p className="text-xs uppercase tracking-widest text-[#FFD60A]">SkillBridge</p>
          <p className="font-display text-4xl font-black text-white mt-3 leading-tight max-w-md">
            "The best investment you can make is in yourself."
          </p>
          <p className="text-zinc-400 mt-3 text-sm">— Warren Buffett</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <h1 className="font-display font-black text-4xl tracking-tighter text-white">Welcome back</h1>
          <p className="text-zinc-400 mt-2 text-sm">Log in to continue your learning journey.</p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5" data-testid="login-form">
            <div>
              <Label className="text-zinc-400 text-xs uppercase tracking-widest">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@skillbridge.dev"
                  className="pl-11 h-12 bg-zinc-900 border-zinc-800 rounded-xl text-white focus-visible:ring-[#FFD60A] focus-visible:ring-offset-0"
                  data-testid="login-email-input" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center">
                <Label className="text-zinc-400 text-xs uppercase tracking-widest">Password</Label>
                <Link to="/forgot-password" className="text-xs text-[#FFD60A] hover:underline" data-testid="login-forgot-link">Forgot?</Link>
              </div>
              <div className="relative mt-2">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input required type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-11 pr-11 h-12 bg-zinc-900 border-zinc-800 rounded-xl text-white focus-visible:ring-[#FFD60A] focus-visible:ring-offset-0"
                  data-testid="login-password-input" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button disabled={loading} type="submit" className="w-full h-12 rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold" data-testid="login-submit-btn">
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-8">
            New here?{" "}
            <Link to="/signup" className="text-[#FFD60A] font-semibold hover:underline" data-testid="login-signup-link">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
