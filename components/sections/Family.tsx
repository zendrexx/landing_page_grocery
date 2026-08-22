import { Reveal } from "@/components/ui/Reveal";
import { DeviceFrame } from "@/components/ui/DeviceFrame";

const PLATES = [
  { who: "Zen", note: "lose weight", kcal: 618, protein: 37, pct: 89 },
  { who: "Mila", note: "maintain", kcal: 529, protein: 32, pct: 76 },
  { who: "Dad", note: "gain muscle", kcal: 695, protein: 42, pct: 100 },
  { who: "Kai", note: "12 years old", kcal: 298, protein: 17, pct: 43 },
];

const WEIGHS = [
  "Each person's calories",
  "Protein targets",
  "Goals",
  "Diet, allergies & favourites",
  "One household budget",
  "The shared pantry",
];

/**
 * Family — the dark "graphite interlude" band, matching Zhevion's
 * light->dark->light sectional rhythm. The plate splitter is the whole
 * feature in one picture: one pot at the top, four plates under it, each
 * bar sized by that person's real share of the pot (618+529+695+298=2,140,
 * same arithmetic the static build used — not decorative numbers).
 */
export function Family() {
  return (
    <section id="family" className="world-grocery bg-graphite-900 py-[clamp(72px,12vh,140px)] text-cream">
      <div className="shell grid gap-14 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <p className="eyebrow text-lime">Family</p>
          <h2 className="mt-3 text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.1] tracking-[-0.02em]">
            One meal.
            <br />
            <span className="text-lime">Everyone&rsquo;s numbers.</span>
          </h2>
          <p className="mt-4 max-w-[46ch] text-[clamp(1rem,1.3vw,1.15rem)] font-medium text-muted">
            Cook one dinner for the whole house. Zebite plans the week once, then
            sizes every plate to the person eating it — so nobody runs their own separate app,
            and nobody eyeballs their portion.
          </p>

          <div className="mt-8 rounded-card border border-hairline bg-white/[0.03] p-6">
            <div className="flex items-center gap-4 border-b border-hairline pb-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-lime/15 text-lime">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 10h18v3a7 7 0 0 1-7 7h-4a7 7 0 0 1-7-7z" />
                  <path d="M3 12H1.6M22.4 12H21" />
                </svg>
              </span>
              <div>
                <b className="block font-extrabold">Chicken adobo · one pot</b>
                <span className="text-sm text-muted">2,140 kcal · 128 g protein · cooked once</span>
              </div>
            </div>

            <p className="my-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-lime">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 4v14M6 13l6 6 6-6" /></svg>
              Portioned per person
            </p>

            <ul className="space-y-4">
              {PLATES.map((p, i) => (
                <Reveal key={p.who} delay={i * 60} as="li">
                  <div className="flex items-baseline justify-between text-sm">
                    <span><b className="font-extrabold">{p.who}</b> <i className="not-italic text-muted">{p.note}</i></span>
                    <span className="text-right"><b className="font-extrabold">{p.kcal} kcal</b> <i className="not-italic text-muted">{p.protein} g protein</i></span>
                  </div>
                  <span className="mt-2 block h-2 overflow-hidden rounded-pill bg-white/10" aria-hidden>
                    <span className="block h-full rounded-pill bg-gradient-to-r from-lime/70 to-lime" style={{ width: `${p.pct}%` }} />
                  </span>
                </Reveal>
              ))}
            </ul>

            <p className="mt-5 text-sm text-muted">
              Same pot, four plates. Each one lands in that person&rsquo;s own food log, against
              their own daily target.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100} className="flex flex-col items-center gap-10">
          <DeviceFrame
            src="/screens/dark/11_home_kitchen.webp"
            imgWidth={860}
            imgHeight={1828}
            width={230}
            alt="Home screen, Your kitchen: Cook together, share a pantry, list and budget with up to 4 people."
          />
          <div className="w-full max-w-sm">
            <h3 className="text-sm font-extrabold">What the family plan weighs</h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {WEIGHS.map((w) => (
                <li key={w} className="rounded-pill border border-hairline px-3 py-1.5 text-xs font-semibold text-cream/90">{w}</li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted">
              Up to 4 people share one pantry, one grocery list and one
              budget. Kids and anyone without a phone can be added by hand so their portion is
              sized too — and health stays private: shared groceries, personal numbers.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
