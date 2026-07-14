import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "components/ui/input-otp";
import { toast } from "sonner";
import { api } from "lib/api";
import { useAuth } from "store/auth";
import { MailCheck } from "lucide-react";

export default function VerifyOtp() {
  const nav = useNavigate();
  const { setAuth } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [signup, setSignup] = useState(null);
  const [devOtp, setDevOtp] = useState("");

  useEffect(() => {
  const raw = sessionStorage.getItem("sn_signup");
  if (!raw) {
    nav("/signup");
    return;
  }
  setSignup(JSON.parse(raw));
  const d = sessionStorage.getItem("sn_dev_otp");
  if (d) setDevOtp(d);
}, [nav]);

  const onSubmit = async () => {
    if (otp.length !== 6) {
      toast.error("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", { ...signup, otp });
      setAuth(data.user, data.token);
      sessionStorage.removeItem("sn_signup");
      sessionStorage.removeItem("sn_dev_otp");
      toast.success("Account created!");
      nav(data.user.role === "Instructor" ? "/dashboard/instructor" : "/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!signup) return;
    try {
      const { data } = await api.post("/auth/send-otp", { email: signup.email });
      toast.success(data.dev_otp ? `OTP (dev): ${data.dev_otp}` : "OTP resent");
      if (data.dev_otp) setDevOtp(data.dev_otp);
    } catch (err) {
      toast.error("Failed to resend");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-14">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#FFD60A]/10 grid place-items-center">
          <MailCheck className="h-7 w-7 text-[#FFD60A]" />
        </div>
        <h1 className="font-display font-black text-3xl tracking-tighter text-white mt-6">Verify your email</h1>
        <p className="text-zinc-400 mt-2 text-sm">
          We've sent a 6-digit code to <span className="text-white">{signup?.email}</span>
        </p>

        {devOtp && (
          <div className="mt-4 inline-flex items-center gap-2 border border-[#FFD60A]/30 bg-[#FFD60A]/10 rounded-full px-4 py-1.5 text-xs text-[#FFD60A]" data-testid="dev-otp-hint">
            Dev OTP: <span className="font-bold tracking-widest">{devOtp}</span>
          </div>
        )}

        <div className="mt-8 flex justify-center" data-testid="otp-input-container">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} className="h-14 w-12 text-xl bg-zinc-900 border-zinc-800 text-white" />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button onClick={onSubmit} disabled={loading} className="w-full h-12 rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold mt-8" data-testid="verify-otp-btn">
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>

        <p className="text-xs text-zinc-500 mt-6">
          Didn't get the code?{" "}
          <button onClick={resend} className="text-[#FFD60A] hover:underline" data-testid="resend-otp-btn">Resend</button>
        </p>
        <Link to="/signup" className="text-xs text-zinc-500 hover:text-white mt-4 inline-block">← Back to signup</Link>
      </div>
    </div>
  );
}
