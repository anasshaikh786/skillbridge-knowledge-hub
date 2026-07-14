import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "lib/api";
import { Check, PlayCircle, Star, MessageSquare } from "lucide-react";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { toast } from "sonner";

export default function CoursePlayer() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState([]);
  const [current, setCurrent] = useState(null);
  const [tab, setTab] = useState("overview");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const load = async () => {
    const { data } = await api.get(`/course/${courseId}`);
    setCourse(data);
    const p = await api.get(`/course-progress/${courseId}`);
    setProgress(p.data.completedVideos || []);
    const first = data.sections?.[0]?.subsections?.[0];
    if (first) setCurrent(first);
  };
  useEffect(() => { load(); }, [courseId]);

  const markDone = async () => {
    if (!current) return;
    await api.post("/course-progress/update", { courseId, subsectionId: current.id });
    setProgress([...new Set([...progress, current.id])]);
    toast.success("Lesson complete!");
  };

  const submitReview = async () => {
    if (rating === 0) return toast.error("Pick a rating");
    try {
      await api.post("/rating/create", { courseId, rating, review });
      toast.success("Thanks for your review!");
      setReview(""); setRating(0);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed");
    }
  };

  if (!course) return <div className="p-24 text-zinc-500">Loading...</div>;


  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="lg:col-span-1 border-r border-zinc-900 bg-[#0c0c0e]" data-testid="player-sidebar">
        <div className="p-6 border-b border-zinc-900">
          <p className="text-xs uppercase tracking-widest text-[#FFD60A]">Now Learning</p>
          <h2 className="font-display font-bold text-white mt-2 line-clamp-2">{course.courseName}</h2>
        </div>
        <div className="p-2 max-h-[70vh] overflow-y-auto">
          {course.sections?.map((s, i) => (
            <div key={s.id} className="mb-2">
              <p className="text-xs uppercase tracking-widest text-zinc-500 px-3 py-2">Section {i + 1}: {s.sectionName}</p>
              {s.subsections?.map((sub) => {
                const done = progress.includes(sub.id);
                const active = current?.id === sub.id;
                return (
                  <button key={sub.id} onClick={() => setCurrent(sub)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                      active ? "bg-[#FFD60A]/10 text-[#FFD60A]" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    }`}
                    data-testid={`lesson-${sub.id}`}>
                    {done ? <Check className="h-4 w-4 shrink-0" /> : <PlayCircle className="h-4 w-4 shrink-0" />}
                    <span className="flex-1 line-clamp-1">{sub.title}</span>
                    <span className="text-xs text-zinc-500">{sub.timeDuration}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="lg:col-span-3 p-6 md:p-10">
        {current ? (
          <>
            <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
              {current.videoUrl ? (
                <video src={current.videoUrl} controls className="w-full h-full" data-testid="lesson-video" />
              ) : (
                <div className="grid place-items-center h-full text-zinc-500">No video</div>
              )}
            </div>
            <div className="flex flex-wrap justify-between items-start gap-4 mt-6">
              <div>
                <h2 className="font-display font-black text-3xl text-white tracking-tighter">{current.title}</h2>
                <p className="text-zinc-400 mt-2 max-w-2xl">{current.description}</p>
              </div>
              <Button onClick={markDone} className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold" data-testid="lesson-complete-btn">
                <Check className="h-4 w-4 mr-2" /> {progress.includes(current.id) ? "Completed" : "Mark complete"}
              </Button>
            </div>

            <div className="flex gap-4 mt-10 border-b border-zinc-800">
              {["overview", "review"].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  className={`pb-3 text-sm font-semibold uppercase tracking-widest transition-colors ${
                    tab === t ? "text-[#FFD60A] border-b-2 border-[#FFD60A]" : "text-zinc-500 hover:text-white"
                  }`}
                  data-testid={`tab-${t}`}>
                  {t}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <div className="mt-6 text-zinc-400 leading-relaxed">
                <p>{course.courseDescription}</p>
              </div>
            )}

            {tab === "review" && (
              <div className="mt-6 max-w-xl">
                <p className="text-white font-semibold mb-3">Rate this course</p>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setRating(n)} data-testid={`rating-${n}`}>
                      <Star className={`h-7 w-7 ${n <= rating ? "text-[#FFD60A] fill-[#FFD60A]" : "text-zinc-700"}`} />
                    </button>
                  ))}
                </div>
                <Textarea rows={4} value={review} onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience..."
                  className="bg-zinc-900 border-zinc-800 text-white focus-visible:ring-[#FFD60A]" data-testid="review-textarea" />
                <Button onClick={submitReview} className="mt-4 rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold" data-testid="review-submit-btn">
                  <MessageSquare className="h-4 w-4 mr-2" /> Post review
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-zinc-500 grid place-items-center h-96">No lessons available yet.</div>
        )}
      </main>
    </div>
  );
}
