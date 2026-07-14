import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "lib/api";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Textarea } from "components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Upload, PlayCircle } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "components/ui/accordion";

export default function EditCourse() {
  const { id } = useParams();
  const nav = useNavigate();
  const [course, setCourse] = useState(null);
  const [newSection, setNewSection] = useState("");
  const [sub, setSub] = useState({ sectionId: "", title: "", description: "", videoUrl: "", timeDuration: "0" });
  const [uploading, setUploading] = useState(false);

const load = useCallback(async () => {
  const { data } = await api.get(`/course/${id}`);
  setCourse(data);
}, [id]);

useEffect(() => {
  load();
}, [load]);

  const addSection = async () => {
    if (!newSection.trim()) return;
    await api.post("/course/section/create", { courseId: id, sectionName: newSection });
    setNewSection("");
    toast.success("Section added");
    load();
  };
  const delSection = async (sid) => {
    if (!window.confirm("Delete section?")) return;
    await api.delete(`/course/section/${sid}`);
    toast.success("Deleted");
    load();
  };

  const uploadVideo = async (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", f);
    try {
      const { data } = await api.post("/media/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setSub((s) => ({ ...s, videoUrl: data.url }));
      toast.success("Video uploaded");
    } catch { toast.error("Upload failed"); } finally { setUploading(false); }
  };

  const addSub = async () => {
    if (!sub.sectionId || !sub.title || !sub.videoUrl) return toast.error("Fill title & upload video");
    await api.post("/course/subsection/create", sub);
    setSub({ sectionId: sub.sectionId, title: "", description: "", videoUrl: "", timeDuration: "0" });
    toast.success("Lesson added");
    load();
  };

  const delSub = async (subId) => {
    await api.delete(`/course/subsection/${subId}`);
    toast.success("Deleted");
    load();
  };

  const publish = async () => {
    const next = course.status === "Published" ? "Draft" : "Published";
    await api.put(`/course/${id}`, { status: next });
    toast.success(next === "Published" ? "Published!" : "Unpublished");
    load();
  };

  if (!course) return <div className="max-w-4xl mx-auto px-6 py-24 text-zinc-500">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 md:px-10 py-14">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#FFD60A]">Step 2 of 2</p>
          <h1 className="font-display font-black text-4xl tracking-tighter text-white mt-3">{course.courseName}</h1>
          <p className="text-zinc-400 mt-2">Add sections & lessons, then publish.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={publish} className={`rounded-full font-bold ${course.status === "Published" ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-[#FFD60A] text-black hover:bg-[#FFC300]"}`} data-testid="edit-course-publish-btn">
            {course.status === "Published" ? "Unpublish" : "Publish course"}
          </Button>
          <Button variant="outline" onClick={() => nav("/dashboard/instructor")} className="rounded-full bg-transparent border-zinc-800 text-white hover:bg-zinc-900" data-testid="edit-course-done-btn">Done</Button>
        </div>
      </div>

      <div className="mt-10 bg-[#121214] border border-zinc-800/60 rounded-2xl p-6">
        <h3 className="font-display font-bold text-white text-xl mb-4">Sections</h3>

        <div className="flex gap-2 mb-6">
          <Input value={newSection} onChange={(e) => setNewSection(e.target.value)} placeholder="Section title (e.g., Getting Started)"
            className="h-11 bg-zinc-900 border-zinc-800 rounded-xl text-white focus-visible:ring-[#FFD60A]" data-testid="section-name-input" />
          <Button onClick={addSection} className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold" data-testid="section-add-btn">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {course.sections?.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-6">No sections yet.</p>
        ) : (
          <Accordion type="multiple" className="w-full">
            {course.sections.map((s, i) => (
              <AccordionItem key={s.id} value={s.id} className="border-zinc-800/60">
                <div className="flex items-center">
                  <AccordionTrigger className="text-white hover:no-underline flex-1 text-left">
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500">Section {i + 1}</span>{s.sectionName}
                      <span className="text-xs text-zinc-500">({s.subsections?.length || 0} lessons)</span>
                    </span>
                  </AccordionTrigger>
                  <button onClick={() => delSection(s.id)} className="text-red-400 hover:text-red-300 pr-4" data-testid={`section-delete-${s.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <AccordionContent className="pl-2">
                  {s.subsections?.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-3 py-2 border-b border-zinc-900 last:border-0">
                      <PlayCircle className="h-4 w-4 text-[#FFD60A]" />
                      <span className="flex-1 text-sm text-white">{sub.title}</span>
                      <span className="text-xs text-zinc-500">{sub.timeDuration}</span>
                      <button onClick={() => delSub(sub.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                  <div className="mt-4 space-y-2 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 mb-1">Add a lesson</p>
                    <Input placeholder="Lesson title" value={sub.sectionId === s.id ? sub.title : ""} onChange={(e) => setSub({ ...sub, sectionId: s.id, title: e.target.value })}
                      className="h-10 bg-zinc-900 border-zinc-800 rounded-lg text-white" data-testid={`sub-title-${s.id}`} />
                    <Textarea placeholder="Description" rows={2} value={sub.sectionId === s.id ? sub.description : ""} onChange={(e) => setSub({ ...sub, sectionId: s.id, description: e.target.value })}
                      className="bg-zinc-900 border-zinc-800 rounded-lg text-white" />
                    <div className="flex gap-2 items-center">
                      <label className="flex-1 cursor-pointer border border-dashed border-zinc-700 rounded-lg py-2 text-center text-xs text-zinc-400 hover:text-white hover:border-[#FFD60A]/50">
                        <Upload className="inline h-3.5 w-3.5 mr-1" />
                        {sub.sectionId === s.id && sub.videoUrl ? "Video uploaded" : (uploading ? "Uploading..." : "Upload video")}
                        <input type="file" accept="video/*" className="hidden" onClick={() => setSub({ ...sub, sectionId: s.id })} onChange={uploadVideo} data-testid={`sub-video-${s.id}`} />
                      </label>
                      <Input placeholder="Duration (e.g. 5:20)" value={sub.sectionId === s.id ? sub.timeDuration : ""} onChange={(e) => setSub({ ...sub, sectionId: s.id, timeDuration: e.target.value })}
                        className="h-10 w-32 bg-zinc-900 border-zinc-800 rounded-lg text-white" />
                      <Button onClick={addSub} size="sm" className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold" data-testid={`sub-add-${s.id}`}>Add</Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
}
