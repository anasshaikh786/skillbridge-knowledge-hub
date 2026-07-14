import { Link } from "react-router-dom";
import { BookOpen, Twitter, Github, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-zinc-900 bg-[#09090B] mt-24">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-[#FFD60A] grid place-items-center">
              <BookOpen className="h-4 w-4 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-display font-black text-2xl">
              Skill<span className="text-[#FFD60A]">Bridge</span>
            </span>
          </Link>
          <p className="text-zinc-400 mt-4 max-w-sm text-sm leading-relaxed">
            Level up your skills with world-class courses from expert instructors. Learn on your terms, anywhere, anytime.
          </p>
          <div className="flex gap-3 mt-6">
            {[Twitter, Github, Youtube].map((I, i) => (
              <div key={i} className="h-9 w-9 grid place-items-center rounded-full border border-zinc-800 hover:border-[#FFD60A] hover:text-[#FFD60A] transition-colors cursor-pointer">
                <I className="h-4 w-4" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Product</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><Link to="/catalog" className="hover:text-white">Catalog</Link></li>
            <li><Link to="/signup" className="hover:text-white">Become instructor</Link></li>
            <li><a className="hover:text-white" href="#">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-widest text-zinc-500 mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><a className="hover:text-white" href="#about">About</a></li>
            <li><a className="hover:text-white" href="#">Careers</a></li>
            <li><a className="hover:text-white" href="#">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} SkillBridge. Crafted with care.
      </div>
    </footer>
  );
}
