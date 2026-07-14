import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "lib/api";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Textarea } from "components/ui/textarea";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "components/ui/select";
import { Upload, ImageIcon } from "lucide-react";

export default function CreateCourse() {
  const nav = useNavigate();
  const [cats, setCats] = useState([]);
  const [thumb, setThumb] = useState("");
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    courseName: "", courseDescription: "", whatYouWillLearn: "",
    price: 0, categoryId: "", tags: "", instructions: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => { api.get("/category/all").then((r) => setCats(r.data)); }, []);

  const upd = (k, v) => setForm({ ...form, [k]: v });

  const upload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", f);
    try {
      const { data } = await api.post("/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setThumb(data.url);
      toast.success("Uploaded");
    } catch { toast.error("Upload failed"); } finally { setUploading(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.categoryId) return toast.error("Choose a category");
    setLoading(true);
    try {
      const { data } = await api.post("/course/create", {
        courseName: form.courseName, courseDescription: form.courseDescription,
        whatYouWillLearn: form.whatYouWillLearn, price: parseFloat(form.price) || 0,
        categoryId: form.categoryId, thumbnail: thumb,
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        instructions: form.instructions.split("\n").map((s) => s.trim()).filter(Boolean),
        status: "Draft",
      });
      toast.success("Course created! Add sections next.");
      nav(`/dashboard/edit-course/${data.id}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-14">
      <p className="text-xs uppercase tracking-widest text-[#FFD60A]">Step 1 of 2</p>
      <h1 className="font-display font-black text-4xl tracking-tighter text-white mt-3">Create a new course</h1>
      <p className="text-zinc-400 mt-2">Fill in the essentials — you'll add lessons on the next step.</p>

      <form onSubmit={submit} className="mt-10 space-y-6" data-testid="create-course-form">
        <F label="Course name">
          <Input required value={form.courseName} onChange={(e) => upd("courseName", e.target.value)} className={inp} data-testid="create-course-name" />
        </F>
        <F label="Short description">
          <Textarea required rows={3} value={form.courseDescription} onChange={(e) => upd("courseDescription", e.target.value)} className={inp} data-testid="create-course-desc" />
        </F>
        <F label="What students will learn (one per line, or comma separated)">
          <Textarea required rows={4} value={form.whatYouWillLearn} onChange={(e) => upd("whatYouWillLearn", e.target.value)} className={inp} data-testid="create-course-learn" />
        </F>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <F label="Price (₹)">
            <Input required type="number" min={0} value={form.price} onChange={(e) => upd("price", e.target.value)} className={inp} data-testid="create-course-price" />
          </F>
          <F label="Category">
            <Select value={form.categoryId} onValueChange={(v) => upd("categoryId", v)}>
              <SelectTrigger className={inp + " justify-between"} data-testid="create-course-category"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent className="bg-[#121214] border-zinc-800 text-white">
                {cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </F>
        </div>
        <F label="Tags (comma separated)">
          <Input value={form.tags} onChange={(e) => upd("tags", e.target.value)} placeholder="react, hooks, hooks-2" className={inp} data-testid="create-course-tags" />
        </F>
        <F label="Requirements / instructions (one per line)">
          <Textarea rows={3} value={form.instructions} onChange={(e) => upd("instructions", e.target.value)} className={inp} data-testid="create-course-instructions" />
        </F>
        <F label="Thumbnail">
          <label className="block cursor-pointer">
            <div className="border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center hover:border-[#FFD60A]/50 transition-colors">
              {thumb ? (
                <img src={thumb} alt="thumb" className="mx-auto max-h-48 rounded-xl" />
              ) : (
                <>
                  <Upload className="h-10 w-10 text-zinc-500 mx-auto" />
                  <p className="text-white text-sm mt-3">Click to upload image</p>
                  <p className="text-zinc-500 text-xs mt-1">JPG, PNG up to 2MB</p>
                </>
              )}
              <input type="file" accept="image/*" onChange={upload} className="hidden" data-testid="create-course-thumb-input" />
              {uploading && <p className="text-[#FFD60A] text-xs mt-3">Uploading...</p>}
            </div>
          </label>
        </F>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => nav(-1)} className="rounded-full bg-transparent border-zinc-800 text-white hover:bg-zinc-900">Cancel</Button>
          <Button disabled={loading} type="submit" className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold px-8" data-testid="create-course-submit">
            {loading ? "Creating..." : "Create & continue →"}
          </Button>
        </div>
      </form>
    </div>
  );
}

const inp = "h-12 bg-zinc-900 border-zinc-800 rounded-xl text-white focus-visible:ring-[#FFD60A] focus-visible:ring-offset-0";

const F = ({ label, children }) => (
  <div>
    <Label className="text-zinc-400 text-xs uppercase tracking-widest">{label}</Label>
    <div className="mt-2">{children}</div>
  </div>
);
