import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "lib/api";
import CourseCard from "components/CourseCard";
import SectionHeader from "components/SectionHeader";
import { Input } from "components/ui/input";
import { Search, Sparkles } from "lucide-react";
import { Skeleton } from "components/ui/skeleton";

export default function Catalog() {
  const { categoryId } = useParams();
  const [courses, setCourses] = useState([]);
  const [cats, setCats] = useState([]);
  const [activeCat, setActiveCat] = useState(categoryId || "all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/category/all").then((r) => setCats(r.data));
    setLoading(true);
    api.get("/course/all").then((r) => { setCourses(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) => {
    if (activeCat !== "all" && c.categoryId !== activeCat) return false;
    if (q && !c.courseName.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
      <SectionHeader eyebrow="Catalog" title="Find your next skill." subtitle="Browse hundreds of courses across categories curated by top instructors." />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2">
        <aside className="lg:col-span-3">
          <div className="sticky top-24 bg-[#121214] border border-zinc-800/60 rounded-2xl p-6">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses"
                className="pl-11 h-11 bg-zinc-900 border-zinc-800 rounded-xl text-white focus-visible:ring-[#FFD60A]"
                data-testid="catalog-search-input" />
            </div>
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Categories</p>
            <div className="space-y-1">
              <CatBtn label="All courses" active={activeCat === "all"} onClick={() => setActiveCat("all")} test="cat-all" />
              {cats.map((c) => (
                <CatBtn key={c.id} label={c.name} active={activeCat === c.id} onClick={() => setActiveCat(c.id)} test={`cat-${c.name.toLowerCase().replace(/\s+/g,'-')}`} />
              ))}
            </div>
          </div>
        </aside>

        <div className="lg:col-span-9">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-[#121214] border border-zinc-800/60 rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-video bg-zinc-800/60" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 bg-zinc-800/60" />
                    <Skeleton className="h-3 w-1/2 bg-zinc-800/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-800 p-16 text-center">
              <Sparkles className="h-10 w-10 text-zinc-700 mx-auto" />
              <p className="text-white font-semibold mt-4">No courses match your filter</p>
              <p className="text-zinc-500 text-sm mt-2">Try clearing search or picking a different category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="catalog-grid">
              {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CatBtn = ({ label, active, onClick, test }) => (
  <button onClick={onClick} data-testid={test}
    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
      active ? "bg-[#FFD60A]/10 text-[#FFD60A] font-semibold" : "text-zinc-400 hover:text-white hover:bg-zinc-900"
    }`}>
    {label}
  </button>
);
