import { useEffect, useState } from "react";
import { api } from "lib/api";
import { useAuth } from "store/auth";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Textarea } from "components/ui/textarea";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "components/ui/avatar";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const nav = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", contactNumber: "", about: "", gender: "", dob: "" });
  const [pw, setPw] = useState({ oldPassword: "", newPassword: "" });

  const load = async () => {
    const { data } = await api.get("/profile/me");
    setUser(data.user);
    setProfile(data.profile);
    setForm({
      firstName: data.user.firstName || "",
      lastName: data.user.lastName || "",
      contactNumber: data.profile?.contactNumber || "",
      about: data.profile?.about || "",
      gender: data.profile?.gender || "",
      dob: data.profile?.dob || "",
    });
  };
  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    await api.put("/profile/update", form);
    toast.success("Profile updated");
    load();
  };

  const changePw = async (e) => {
    e.preventDefault();
    try {
      await api.put("/profile/change-password", pw);
      toast.success("Password changed");
      setPw({ oldPassword: "", newPassword: "" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed");
    }
  };

  const deleteAcc = async () => {
    if (!window.confirm("Delete your account permanently? This cannot be undone.")) return;
    await api.delete("/profile/delete");
    toast.success("Account deleted");
    logout();
    nav("/");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-14">
      <h1 className="font-display font-black text-4xl tracking-tighter text-white">Your Profile</h1>

      <div className="mt-10 bg-[#121214] border border-zinc-800/60 rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16"><AvatarImage src={user?.image} /><AvatarFallback className="bg-zinc-800 text-white">{user?.firstName?.[0]}</AvatarFallback></Avatar>
          <div>
            <p className="text-white font-bold">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-zinc-500">{user?.email} · {user?.role}</p>
          </div>
        </div>

        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-5" data-testid="profile-form">
          <F label="First name"><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inp} data-testid="profile-firstName" /></F>
          <F label="Last name"><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inp} data-testid="profile-lastName" /></F>
          <F label="Phone"><Input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} className={inp} /></F>
          <F label="Gender"><Input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inp} /></F>
          <F label="Date of birth"><Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} className={inp} /></F>
          <div className="md:col-span-2">
            <F label="About"><Textarea rows={3} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} className={inp} /></F>
          </div>
          <div className="md:col-span-2">
            <Button type="submit" className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold" data-testid="profile-save-btn">Save changes</Button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-[#121214] border border-zinc-800/60 rounded-2xl p-8">
        <h3 className="font-display font-bold text-white text-xl mb-4">Change password</h3>
        <form onSubmit={changePw} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <F label="Old password"><Input type="password" value={pw.oldPassword} onChange={(e) => setPw({ ...pw, oldPassword: e.target.value })} className={inp} required data-testid="profile-oldpw" /></F>
          <F label="New password"><Input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} className={inp} required data-testid="profile-newpw" /></F>
          <div className="md:col-span-2"><Button type="submit" className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold" data-testid="profile-changepw-btn">Change password</Button></div>
        </form>
      </div>

      <div className="mt-6 bg-red-500/5 border border-red-900/40 rounded-2xl p-8">
        <h3 className="font-display font-bold text-red-400 text-xl mb-2">Danger zone</h3>
        <p className="text-zinc-400 text-sm mb-4">Delete your account permanently. This cannot be undone.</p>
        <Button onClick={deleteAcc} className="rounded-full bg-red-500 hover:bg-red-600 text-white font-bold" data-testid="profile-delete-btn">Delete my account</Button>
      </div>
    </div>
  );
}

const inp = "h-11 bg-zinc-900 border-zinc-800 rounded-xl text-white focus-visible:ring-[#FFD60A] focus-visible:ring-offset-0";
const F = ({ label, children }) => (
  <div>
    <Label className="text-zinc-400 text-xs uppercase tracking-widest">{label}</Label>
    <div className="mt-2">{children}</div>
  </div>
);
