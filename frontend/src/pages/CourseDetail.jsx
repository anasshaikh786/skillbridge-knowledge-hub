import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "lib/api";
import { Button } from "components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "components/ui/accordion";
import { Avatar, AvatarImage, AvatarFallback } from "components/ui/avatar";
import { toast } from "sonner";
import { Star, Heart, ShoppingCart, PlayCircle, Users, Clock, Check } from "lucide-react";
import { useAuth } from "store/auth";

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    api.get(`/course/${id}`).then((r) => { setCourse(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);



  const addToCart = async () => {
    if (!token) return nav("/login");
    try {
      await api.post("/cart/add", { courseId: id });
      toast.success("Added to cart");
    } catch { toast.error("Failed"); }
  };
  const buyNow = async () => {
    if (!token) return nav("/login");
    try {
      await api.post("/cart/add", { courseId: id }).catch(() => {});
      nav("/cart");
    } catch { toast.error("Failed"); }
  };
  const toggleWish = async () => {
    if (!token) return nav("/login");
    try {
      const { data } = await api.post("/wishlist/toggle", { courseId: id });
      toast.success(data.in ? "Wishlisted" : "Removed from wishlist");
    } catch { toast.error("Failed"); }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-6 py-24 text-zinc-500">Loading course...</div>;
  if (!course) return <div className="max-w-7xl mx-auto px-6 py-24 text-zinc-500">Course not found.</div>;

  return (
    <div>
      {/* HERO */}
      <div className="border-b border-zinc-900 bg-[#0c0c0e]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <div className="text-xs uppercase tracking-widest text-[#FFD60A] font-semibold">
              {course.category?.name}
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl tracking-tighter text-white mt-4 leading-none" data-testid="course-title">
              {course.courseName}
            </h1>
            <p className="text-zinc-400 mt-5 text-lg max-w-2xl leading-relaxed">{course.courseDescription}</p>
            <div className="flex flex-wrap items-center gap-5 mt-6 text-sm">
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-[#FFD60A] fill-[#FFD60A]" /><span className="text-white font-semibold">{course.avgRating || "New"}</span><span className="text-zinc-500">({course.ratingCount || 0} reviews)</span></span>
              <span className="flex items-center gap-1.5 text-zinc-400"><Users className="h-4 w-4" />{course.studentsEnrolled} students</span>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <Avatar className="h-10 w-10"><AvatarImage src={course.instructor?.image} /><AvatarFallback className="bg-zinc-800">{course.instructor?.firstName?.[0]}</AvatarFallback></Avatar>
              <div>
                <p className="text-white text-sm font-semibold">By {course.instructor?.firstName} {course.instructor?.lastName}</p>
                <p className="text-xs text-zinc-500">Instructor</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-14">
          <section>
            <h2 className="font-display font-black text-2xl text-white mb-6">What you'll learn</h2>
            <div className="bg-[#121214] border border-zinc-800/60 rounded-2xl p-8">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.whatYouWillLearn?.split(/\n|,/).filter(Boolean).map((l, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-300">
                    <Check className="h-4 w-4 text-[#FFD60A] shrink-0 mt-0.5" /> {l.trim()}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-display font-black text-2xl text-white mb-6">Curriculum</h2>
            <div className="bg-[#121214] border border-zinc-800/60 rounded-2xl px-4" data-testid="curriculum-accordion">
              {course.sections?.length ? (
                <Accordion type="single" collapsible className="w-full">
                  {course.sections.map((s, i) => (
                    <AccordionItem key={s.id} value={s.id} className="border-zinc-800/60">
                      <AccordionTrigger className="text-white hover:no-underline text-left">
                        <span className="flex items-center gap-3"><span className="text-xs text-zinc-500">Section {i + 1}</span>{s.sectionName}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-zinc-400">
                        <ul className="space-y-2 pl-2">
                          {s.subsections?.map((sub) => (
                            <li key={sub.id} className="flex items-center gap-3 text-sm">
                              <PlayCircle className="h-4 w-4 text-[#FFD60A]" />
                              <span className="flex-1">{sub.title}</span>
                              <span className="text-xs text-zinc-500">{sub.timeDuration}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-zinc-500 text-sm py-6 text-center">Curriculum coming soon.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="font-display font-black text-2xl text-white mb-6">Reviews</h2>
            {course.reviews?.length ? (
              <div className="space-y-4">
                {course.reviews.map((r) => (
                  <div key={r.id} className="bg-[#121214] border border-zinc-800/60 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-9 w-9"><AvatarImage src={r.user?.image} /><AvatarFallback className="bg-zinc-800">{r.user?.firstName?.[0]}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-white text-sm font-semibold">{r.user?.firstName} {r.user?.lastName}</p>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-3 w-3 ${n <= r.rating ? "text-[#FFD60A] fill-[#FFD60A]" : "text-zinc-700"}`} />)}
                        </div>
                      </div>
                    </div>
                    <p className="text-zinc-400 text-sm">{r.review}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">No reviews yet. Be the first!</p>
            )}
          </section>
        </div>

        {/* Sticky purchase card */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 bg-[#121214] border border-zinc-800/60 rounded-2xl overflow-hidden">
            <div className="aspect-video bg-zinc-900 relative">
              <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 grid place-items-center">
                <PlayCircle className="h-14 w-14 text-white/90" />
              </div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-black text-white font-display">
                {course.price === 0 ? "Free" : `₹${course.price}`}
              </div>
              <div className="mt-5 space-y-3">
                <Button onClick={buyNow} className="w-full h-12 rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold" data-testid="course-buy-btn">
                  Buy Now
                </Button>
                <Button onClick={addToCart} variant="outline" className="w-full h-12 rounded-full bg-transparent border-zinc-800 text-white hover:bg-zinc-900" data-testid="course-cart-btn">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
                <button onClick={toggleWish} className="w-full text-sm text-zinc-400 hover:text-white flex items-center justify-center gap-2 py-2" data-testid="course-wishlist-btn">
                  <Heart className="h-4 w-4" /> Add to Wishlist
                </button>
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3 text-sm text-zinc-400">
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#FFD60A]" />Lifetime access</div>
                <div className="flex items-center gap-2"><Check className="h-4 w-4 text-[#FFD60A]" />Certificate on completion</div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-[#FFD60A]" />Community access</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
