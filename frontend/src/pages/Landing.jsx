import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "components/ui/button";
import { ArrowRight, Sparkles, Play, Users, Star, TrendingUp, Award, BookOpen } from "lucide-react";
import CourseCard from "components/CourseCard";
import SectionHeader from "components/SectionHeader";
import { api } from "lib/api";

const HERO_IMG = "https://images.unsplash.com/photo-1531297484001-80022131f5a1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwbGFwdG9wJTIwZGFyayUyMGNpbmVtYXRpY3xlbnwwfHx8fDE3ODQwMTM1NjN8MA&ixlib=rb-4.1.0&q=85";

export default function Landing() {
  const [courses, setCourses] = useState([]);
  const [cats, setCats] = useState([]);

  useEffect(() => {
    api.get("/course/all").then((r) => setCourses(r.data.slice(0, 6))).catch(() => {});
    api.get("/category/all").then((r) => setCats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="relative">
      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 pt-14 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 fade-in-up">
            <div className="inline-flex items-center gap-2 border border-zinc-800 rounded-full px-4 py-1.5 mb-8 bg-zinc-900/30">
              <Sparkles className="h-3.5 w-3.5 text-[#FFD60A]" />
              <span className="text-xs text-zinc-300">New — AI-assisted course paths</span>
            </div>
            <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tighter text-white">
              Learn skills that <br />
              <span className="text-[#FFD60A]">actually pay off.</span>
            </h1>
            <p className="text-zinc-400 mt-6 text-lg max-w-xl leading-relaxed">
              Career-shifting courses, personal mentorship and hands-on projects. Build the work you're proud to ship — from web dev to AI.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-10">
              <Link to="/catalog">
                <Button className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold px-8 py-6 text-base group" data-testid="hero-explore-btn">
                  Explore Courses
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline" className="rounded-full bg-transparent border-zinc-800 text-white hover:bg-zinc-900 px-8 py-6 text-base" data-testid="hero-signup-btn">
                  <Play className="mr-2 h-4 w-4" /> Start Free
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-zinc-900">
              <Stat n="120K+" l="Learners" />
              <Stat n="850+" l="Courses" />
              <Stat n="4.9★" l="Avg. rating" />
            </div>
          </div>

          <div className="lg:col-span-5 relative fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#121214] border border-zinc-800/60">
              <img src={HERO_IMG} alt="Learn" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#09090B] via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 bg-[#09090B]/85 backdrop-blur-xl border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#FFD60A] grid place-items-center">
                    <Award className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Certified instructor path</p>
                    <p className="text-zinc-400 text-xs">Earn while you teach</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-4 bg-[#FFD60A] text-black rounded-2xl p-5 rotate-6 shadow-xl">
              <TrendingUp className="h-6 w-6 mb-1" />
              <p className="font-black text-sm">2.8x</p>
              <p className="text-xs opacity-80">Career growth</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES STRIP */}
      <section className="border-y border-zinc-900 py-8 overflow-hidden">
        <div className="flex gap-4 marquee-track whitespace-nowrap">
          {[...cats, ...cats, ...cats].map((c, i) => (
            <div key={i} className="inline-flex items-center gap-2 border border-zinc-800 rounded-full px-6 py-2 text-sm text-zinc-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFD60A]" />
              {c.name}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <SectionHeader
          eyebrow="Handpicked"
          title="Courses that ship real skills."
          subtitle="Curated from top instructors — no fluff, only actionable content."
        />
        {courses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 p-12 text-center">
            <BookOpen className="h-10 w-10 text-zinc-700 mx-auto" />
            <p className="text-zinc-400 mt-4">No courses yet. Be the first — sign up as an instructor!</p>
            <Link to="/signup" className="inline-block mt-6">
              <Button className="rounded-full bg-[#FFD60A] text-black hover:bg-[#FFC300] font-bold">Become an Instructor</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </section>

      {/* WHY US - BENTO */}
      <section id="about" className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <SectionHeader eyebrow="Why SkillBridge" title="Built for outcomes, not just views." />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <BentoCard className="md:col-span-4 md:row-span-2 min-h-[280px]" icon={<Users />} title="Community that ships" desc="Get feedback from senior devs, designers and founders. Every lesson has an active discussion." />
          <BentoCard className="md:col-span-2" icon={<Award />} title="Real projects" desc="Portfolio work that hiring managers care about." />
          <BentoCard className="md:col-span-2" icon={<Star />} title="Top instructors" desc="Vetted by industry. Ratings live and honest." />
          <BentoCard className="md:col-span-3" icon={<TrendingUp />} title="Career fast-track" desc="Structured paths built by hiring partners." />
          <BentoCard className="md:col-span-3" icon={<Sparkles />} title="AI study buddy" desc="Get unstuck 24/7 with contextual hints." />
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-24">
        <div className="rounded-3xl bg-gradient-to-br from-[#FFD60A] to-[#FFC300] p-10 md:p-16 relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <h2 className="font-display font-black text-4xl md:text-5xl text-black tracking-tighter leading-none">
              Ready to teach or learn?
            </h2>
            <p className="text-black/70 mt-4 text-lg">Free to start. No credit card. Cancel anytime.</p>
            <div className="flex gap-3 mt-8">
              <Link to="/signup">
                <Button className="rounded-full bg-black text-white hover:bg-zinc-800 px-8 py-6 text-base font-bold" data-testid="cta-join-btn">
                  Join SkillBridge
                </Button>
              </Link>
              <Link to="/catalog">
                <Button variant="ghost" className="rounded-full text-black hover:bg-black/10 px-8 py-6 text-base font-bold">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-black/10" />
          <div className="absolute -right-4 top-6 h-32 w-32 rounded-full bg-black/10" />
        </div>
      </section>
    </div>
  );
}

const Stat = ({ n, l }) => (
  <div>
    <div className="font-display font-black text-3xl text-white">{n}</div>
    <div className="text-xs uppercase tracking-widest text-zinc-500 mt-1">{l}</div>
  </div>
);

const BentoCard = ({ className = "", icon, title, desc }) => (
  <div className={`bg-[#121214] border border-zinc-800/60 rounded-2xl p-8 hover:border-zinc-700 transition-colors ${className}`}>
    <div className="h-11 w-11 rounded-xl bg-[#FFD60A]/10 grid place-items-center text-[#FFD60A] mb-6">
      {icon}
    </div>
    <h3 className="font-display font-bold text-xl text-white mb-2">{title}</h3>
    <p className="text-zinc-400 text-sm leading-relaxed">{desc}</p>
  </div>
);
