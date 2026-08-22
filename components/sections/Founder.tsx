import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

export function Founder() {
  return (
    <section id="about" className="world-grocery bg-paper-deep py-[clamp(64px,10vh,120px)]">
      <div className="shell max-w-[46rem]">
        <Reveal className="flex items-start justify-between gap-6">
          <div>
            <p className="eyebrow text-ink-faint">From the maker</p>
            <h2 className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold tracking-[-0.02em] text-ink">
              Hey, I&rsquo;m Zen <span aria-hidden>👋</span>
            </h2>
          </div>
          <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-pill ring-1 ring-ink/10">
            <Image src="/founder.jpg" alt="Zendrex Adversalo, founder of Zebite" fill className="object-cover" />
          </span>
        </Reveal>

        <Reveal delay={80} className="mt-6 space-y-4 text-[1.05rem] leading-[1.7] text-ink-soft">
          <p>Every week it was the same.</p>
          <p>&ldquo;What should we eat?&rdquo;</p>
          <p>We&rsquo;d spend more time deciding than actually cooking. Then we&rsquo;d go grocery shopping without a plan, buy things we didn&rsquo;t really need, forget what was already at home, and somehow still end up wondering what to cook a few days later.</p>
          <p>That&rsquo;s why I built <strong className="text-ink">Zebite</strong>.</p>
          <p>It plans meals based on what&rsquo;s already in your pantry, creates a grocery list for only what you need, and keeps everything within your budget.</p>
          <p>I&rsquo;m building it solo, starting with the Philippines, because these are problems I deal with too.</p>
          <p>If you&rsquo;ve ever spent 20 minutes deciding what to eat, <strong className="text-ink">Zebite</strong> is for you.</p>
        </Reveal>

        <Reveal delay={140} className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <a href="https://zendrex.zhevion.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-extrabold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
            Zen
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M7 17 17 7M9 7h8v8" /></svg>
          </a>
          <span className="text-ink-faint">
            Founder &amp; developer ·{" "}
            <a href="https://github.com/zendrexx" target="_blank" rel="noreferrer" className="font-semibold text-ink-soft underline decoration-ink/20 underline-offset-4 hover:decoration-ink">
              @zendrexx
            </a>
          </span>
        </Reveal>
      </div>
    </section>
  );
}
