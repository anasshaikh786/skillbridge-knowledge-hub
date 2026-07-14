import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "lib/api";
import { useAuth } from "store/auth";
import { Button } from "components/ui/button";
import { toast } from "sonner";
import { Plus, Users, DollarSign, Star, BookOpen, Trash2, Edit2 } from "lucide-react";

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/instructor/stats");
      setStats(data);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    await api.delete(`/course/${id}`);
    toast.success("Deleted");
    load();
  };

  const togglePublish = async (c) => {
    const next = c.status === "Published" ? "Draft" : "Published";
    await api.put(`/course/${c.id}`, { status: next });
    toast.success(next === "Published" ? "Published!" : "Unpublished");
    load();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
      <div className="flex flex-wrap justify-between items-end gap-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-[#FFD60A]">Instructor Studio</p>
          <h1 className="font-display font-black text-5xl tracking-tighter text-white mt-3">
            Hey, {user?.firstName}.
          </h1>
          <p className="text-zinc-400 mt-2 max-w-md">Manage your courses, track revenue, and see what students think.</p>
        </div>
        <Link to="/dashboard/create-course">
          <Button className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold" data-testid="instructor-create-btn">
            <Plus className="mr-2 h-4 w-4" /> New course
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-12">
        <Stat icon={<Users />} n={stats?.totalStudents || 0} l="Students" />
        <Stat icon={<DollarSign />} n={`₹${stats?.totalRevenue || 0}`} l="Revenue" />
        <Stat icon={<Star />} n={stats?.avgRating || 0} l="Avg. rating" />
        <Stat icon={<BookOpen />} n={stats?.totalCourses || 0} l="Courses" />
      </div>

      <h2 className="font-display font-black text-2xl text-white mt-16 mb-6">Your courses</h2>
      {loading ? (
        <p className="text-zinc-500">Loading...</p>
      ) : (stats?.perCourse?.length || 0) === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 p-16 text-center">
          <BookOpen className="h-10 w-10 text-zinc-700 mx-auto" />
          <p className="text-white font-semibold mt-4">Create your first course</p>
          <Link to="/dashboard/create-course" className="inline-block mt-6">
            <Button className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold">Get started</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4" data-testid="instructor-courses-list">
          {stats.perCourse.map((c) => (
            <div key={c.id} className="bg-[#121214] border border-zinc-800/60 rounded-2xl p-5 flex flex-wrap items-center gap-5">
              <img src={c.thumbnail} className="w-28 aspect-video object-cover rounded-xl bg-zinc-900" />
              <div className="flex-1 min-w-[200px]">
                <h3 className="font-display font-bold text-white">{c.name}</h3>
                <div className="flex items-center gap-4 text-xs text-zinc-500 mt-2">
                  <span>{c.students} students</span>
                  <span>₹{c.revenue} revenue</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 text-[#FFD60A] fill-[#FFD60A]" />{c.avgRating}</span>
                  <span className={`px-2 py-0.5 rounded-full ${c.status === "Published" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-800 text-zinc-400"}`}>{c.status}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => togglePublish(c)} size="sm" className="rounded-full bg-transparent border-zinc-800 text-white hover:bg-zinc-900" data-testid={`course-publish-${c.id}`}>
                  {c.status === "Published" ? "Unpublish" : "Publish"}
                </Button>
                <Link to={`/dashboard/edit-course/${c.id}`}>
                  <Button variant="outline" size="sm" className="rounded-full bg-transparent border-zinc-800 text-white hover:bg-zinc-900" data-testid={`course-edit-${c.id}`}>
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => del(c.id)} size="sm" className="rounded-full bg-transparent border-red-900/50 text-red-400 hover:bg-red-500/10" data-testid={`course-delete-${c.id}`}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
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
