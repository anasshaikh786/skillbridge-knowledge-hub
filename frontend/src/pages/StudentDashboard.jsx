import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "lib/api";
import { useAuth } from "store/auth";
import { Button } from "components/ui/button";
import { BookOpen, PlayCircle, TrendingUp, Sparkles } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/course/student/enrolled").then((r) => { setCourses(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#FFD60A]">Dashboard</p>
          <h1 className="font-display font-black text-5xl tracking-tighter text-white mt-3">
            Welcome back,<br />{user?.firstName}.
          </h1>
        </div>
        <Link to="/catalog"><Button className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold" data-testid="dashboard-browse-btn">Find courses</Button></Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
        <Stat icon={<BookOpen />} n={courses.length} l="Enrolled" />
        <Stat icon={<PlayCircle />} n={courses.reduce((a, c) => a + (c.progress?.length || 0), 0)} l="Lessons done" />
        <Stat icon={<TrendingUp />} n={courses.filter((c) => (c.progress?.length || 0) > 0).length} l="In progress" />
        <Stat icon={<Sparkles />} n="—" l="Certificates" />
      </div>

      <h2 className="font-display font-black text-2xl text-white mt-16 mb-6">Your courses</h2>
      {loading ? (
        <p className="text-zinc-500">Loading...</p>
      ) : courses.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 p-16 text-center">
          <BookOpen className="h-10 w-10 text-zinc-700 mx-auto" />
          <p className="text-white font-semibold mt-4">No courses yet</p>
          <p className="text-zinc-500 text-sm mt-2">Enroll in a course to start learning.</p>
          <Link to="/catalog" className="inline-block mt-6"><Button className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold">Browse catalog</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="enrolled-courses">
          {courses.map((c) => {
            const totalLessons = c.sections?.reduce((a, s) => a + (s.subsections?.length || 0), 0) || 0;
            const done = c.progress?.length || 0;
            const pct = totalLessons ? Math.round((done / totalLessons) * 100) : 0;
            return (
              <Link key={c.id} to={`/learn/${c.id}`} className="bg-[#121214] border border-zinc-800/60 rounded-2xl overflow-hidden hover:border-zinc-700 transition-colors">
                <div className="aspect-video overflow-hidden bg-zinc-900"><img src={c.thumbnail} alt={c.courseName || "Course thumbnail"} className="w-full h-full object-cover" /></div>
                <div className="p-5">
                  <h3 className="font-display font-bold text-white line-clamp-2">{c.courseName}</h3>
                  <div className="mt-4">
                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FFD60A]" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500 mt-2">
                      <span>{pct}% complete</span>
                      <span>{done}/{totalLessons}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const Stat = ({ icon, n, l }) => (
  <div className="bg-[#121214] border border-zinc-800/60 rounded-2xl p-6">
    <div className="h-10 w-10 rounded-xl bg-[#FFD60A]/10 grid place-items-center text-[#FFD60A]">{icon}</div>
    <div className="font-display font-black text-3xl text-white mt-4">{n}</div>
    <div className="text-xs uppercase tracking-widest text-zinc-500 mt-1">{l}</div>
  </div>
);
