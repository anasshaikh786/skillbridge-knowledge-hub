import { useEffect, useState } from "react";
import { api } from "lib/api";
import CourseCard from "components/CourseCard";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "components/ui/button";

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/wishlist").then((r) => { setItems(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-14">
      <h1 className="font-display font-black text-4xl tracking-tighter text-white">Wishlist</h1>
      <p className="text-zinc-500 mt-2">Save courses for later.</p>
      {loading ? (
        <div className="mt-10 text-zinc-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-zinc-800 p-16 text-center">
          <Heart className="h-10 w-10 text-zinc-700 mx-auto" />
          <p className="text-white font-semibold mt-4">Nothing saved yet</p>
          <p className="text-zinc-500 text-sm mt-2">Heart a course to see it here.</p>
          <Link to="/catalog" className="inline-block mt-6"><Button className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold">Browse</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {items.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      )}
    </div>
  );
}
