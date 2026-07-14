export default function SectionHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="max-w-3xl mb-12">
      {eyebrow && (
        <p className="text-xs uppercase tracking-[0.25em] text-[#FFD60A] font-semibold mb-4">{eyebrow}</p>
      )}
      <h2 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tighter leading-none">
        {title}
      </h2>
      {subtitle && <p className="text-zinc-400 mt-5 text-base md:text-lg leading-relaxed">{subtitle}</p>}
    </div>
  );
}
