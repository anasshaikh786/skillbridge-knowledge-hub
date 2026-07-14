import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { toast } from "sonner";
import { api } from "lib/api";
import { GraduationCap, UsersRound } from "lucide-react";

export default function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "",
    confirmPassword: "", accountType: "Student", contactNumber: "",
  });
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/send-otp", { email: form.email });
      toast.success(data.dev_otp ? `OTP (dev): ${data.dev_otp}` : "OTP sent to your email");
      sessionStorage.setItem("sn_signup", JSON.stringify(form));
      if (data.dev_otp) sessionStorage.setItem("sn_dev_otp", data.dev_otp);
      nav("/verify-otp");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-14">
      <div className="w-full max-w-2xl">
        <h1 className="font-display font-black text-4xl tracking-tighter text-white">Join SkillBridge</h1>
        <p className="text-zinc-400 mt-2 text-sm">Start learning or start teaching — you decide.</p>

        <div className="mt-8 grid grid-cols-2 gap-3 p-1.5 bg-zinc-900 rounded-full border border-zinc-800 max-w-sm">
          {[
            { v: "Student", i: <GraduationCap className="h-4 w-4" /> },
            { v: "Instructor", i: <UsersRound className="h-4 w-4" /> },
          ].map(({ v, i }) => (
            <button key={v} onClick={() => update("accountType", v)} type="button"
              className={`rounded-full py-2.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                form.accountType === v ? "bg-[#FFD60A] text-black" : "text-zinc-400 hover:text-white"
              }`}
              data-testid={`signup-role-${v.toLowerCase()}`}>
              {i} {v}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5" data-testid="signup-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First name" v={form.firstName} onC={(v) => update("firstName", v)} test="signup-firstName" required />
            <Field label="Last name" v={form.lastName} onC={(v) => update("lastName", v)} test="signup-lastName" required />
          </div>
          <Field label="Email address" type="email" v={form.email} onC={(v) => update("email", v)} test="signup-email" required />
          <Field label="Phone (optional)" v={form.contactNumber} onC={(v) => update("contactNumber", v)} test="signup-phone" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Password" type="password" v={form.password} onC={(v) => update("password", v)} test="signup-password" required />
            <Field label="Confirm password" type="password" v={form.confirmPassword} onC={(v) => update("confirmPassword", v)} test="signup-confirm" required />
          </div>

          <Button disabled={loading} type="submit" className="w-full h-12 rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold mt-4" data-testid="signup-submit-btn">
            {loading ? "Sending OTP..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-zinc-400 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#FFD60A] font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

const Field = ({ label, v, onC, type = "text", test, required }) => (
  <div>
    <Label className="text-zinc-400 text-xs uppercase tracking-widest">{label}</Label>
    <Input required={required} type={type} value={v} onChange={(e) => onC(e.target.value)}
      className="mt-2 h-12 bg-zinc-900 border-zinc-800 rounded-xl text-white focus-visible:ring-[#FFD60A] focus-visible:ring-offset-0"
      data-testid={test} />
  </div>
);
