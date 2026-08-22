"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Reveal } from "@/components/ui/Reveal";

const ITEMS = [
  { q: "Does the AI just guess my calorie targets?", a: "No. Targets are computed deterministically with the Mifflin-St Jeor equation (BMR → TDEE → adjusted for your goal). The AI reasons over those numbers to build recipes — it never invents calorie figures." },
  { q: "How can one plan feed people who need different amounts?", a: "The plan is generated once, against the household's combined targets, and every meal is then split by each person's share of those targets — a bigger plate for the bigger target. Their plate goes into their own food log against their own goal. People without an account, like kids, can be added by hand so they're portioned for too, and the household's diet, allergies, budget and shared pantry all feed the same generation." },
  { q: "Do I have to type in my whole pantry by hand?", a: "You can, but you don't have to. Snap a photo of a receipt or your shelf and the AI reads the items and adds them to your pantry — and can log the spend at the same time." },
  { q: "Will the grocery list actually stay within my budget?", a: "The list is built from your plan, holds only what your pantry doesn't already cover, and is kept inside your ₱ budget — with money-saving swaps when something's tight. The prices behind it are crowdsourced and anonymized from people shopping near you, so the budget rides on real numbers rather than a national average." },
  { q: "Is Zeb just a mascot?", a: "No — Zeb is the assistant inside the app. Open Ask Zeb any time to ask what to cook right now or how to stretch the budget, and he reads your real pantry, plan and budget before answering. He speaks up on his own too: expiry warnings on Home, low-stock notes on your list, and a summary of exactly what the AI will use before it writes a plan." },
  { q: "Does it work offline, and outside the Philippines?", a: "It's offline-first, so it works without a connection and syncs across your devices when you're signed in. It's built PH-first — prices and budgets are in peso (₱) — but the planning, pantry, family and nutrition features work anywhere." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="world-grocery bg-paper py-[clamp(64px,10vh,120px)]">
      <div className="shell max-w-[46rem]">
        <Reveal className="text-center">
          <p className="eyebrow text-ink-faint">FAQ</p>
          <h2 className="mt-2 text-[clamp(1.7rem,3.4vw,2.4rem)] font-extrabold tracking-[-0.02em] text-ink">Good questions</h2>
        </Reveal>

        <ul className="mt-10 space-y-3">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={item.q} delay={i * 40} as="li" className="overflow-hidden rounded-card border border-ink/10 bg-white">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[0.98rem] font-bold text-ink"
                >
                  {item.q}
                  <motion.svg
                    viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="shrink-0 text-ink-faint"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </motion.svg>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-[1.65] text-ink-soft">{item.a}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
