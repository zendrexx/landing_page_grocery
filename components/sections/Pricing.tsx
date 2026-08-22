"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/ui/Reveal";
import { trackCTA } from "@/lib/analytics";

const CHECK = "M20 6 9 17l-5-5";

const PLANS = [
  {
    name: "Free",
    tagline: "Everything you need to start.",
    monthly: null,
    annual: null,
    amt: "₱0",
    cta: "Get started",
    featured: false,
    feats: ["3 AI meal plans per week", "Pantry tracking & grocery lists", "Nutrition targets & daily goals", "Ask Zeb — a few chats a week"],
  },
  {
    name: "Plus",
    tagline: "For serious weekly planners.",
    monthly: "₱199",
    annual: "₱166",
    cta: "Choose Plus",
    featured: true,
    badge: "Most popular",
    feats: ["Everything in Free", "Unlimited AI meal plans", "Unlimited Ask Zeb", "Smarter budget substitutions", "Deeper insights & trends", "Priority generation"],
  },
  {
    name: "Pro",
    tagline: "The full kitchen copilot.",
    monthly: "₱299",
    annual: "₱249",
    cta: "Choose Pro",
    featured: false,
    feats: ["Everything in Plus", "Receipt scanning (snap to stock)", "Quick snap for groceries or pantry — AI spots the items", "Family kitchen — up to 4 people, portioned per person", "Shared pantry, list & household budget"],
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="world-grocery bg-paper-deep py-[clamp(72px,12vh,140px)]">
      <div className="shell">
        <Reveal className="mx-auto max-w-[42rem] text-center">
          <p className="eyebrow text-ink-faint">Pricing</p>
          <h2 className="mt-2 text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold tracking-[-0.02em] text-ink">
            Start free — upgrade when it pays for itself
          </h2>

          <div className="relative mx-auto mt-6 flex w-[min(22rem,100%)] items-center rounded-pill border border-ink/10 bg-white p-1 text-sm font-semibold">
            <motion.span
              className="absolute inset-y-1 w-[calc(50%-4px)] rounded-pill bg-ink"
              animate={{ x: annual ? "calc(100% + 4px)" : 2 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
            />
            <button
              type="button"
              onClick={() => setAnnual(false)}
              className={`relative z-10 flex-1 rounded-pill px-4 py-2 transition-colors ${!annual ? "text-paper" : "text-ink-soft"}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-pill px-4 py-2 transition-colors ${annual ? "text-paper" : "text-ink-soft"}`}
            >
              Annual
              <span
                className={`rounded-pill px-1.5 py-0.5 text-[0.62rem] font-bold ${
                  annual ? "bg-lime text-lime-ink" : "bg-lime/25 text-[#3d5c12]"
                }`}
              >
                2 mo free
              </span>
            </button>
          </div>
        </Reveal>

        <div className="mt-12 grid items-stretch gap-5 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal
              key={p.name}
              delay={i * 80}
              className={`relative flex flex-col rounded-card border p-7 transition-shadow ${
                p.featured
                  ? "border-[#9BCB34] bg-paper-deep shadow-[inset_0_0_0_1px_#9BCB34,0_4px_8px_rgba(13,46,33,0.06),0_40px_80px_-36px_rgba(13,46,33,0.34)]"
                  : "border-ink/10 bg-white"
              }`}
            >
              {p.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-pill bg-lime px-3 py-1 text-xs font-extrabold text-lime-ink">
                  {p.badge}
                </span>
              ) : null}
              <div className="text-lg font-extrabold text-ink">{p.name}</div>
              <p className="mt-1 text-sm text-ink-soft">{p.tagline}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-[-0.02em] text-ink">
                  {p.monthly ? (annual ? p.annual : p.monthly) : p.amt}
                </span>
                {p.monthly ? <span className="text-sm font-semibold text-ink-faint">/mo</span> : null}
              </div>
              <a
                href="#get"
                onClick={() => trackCTA(`plan-${p.name.toLowerCase()}`)}
                className={`mt-5 block rounded-pill py-3 text-center text-sm font-bold transition-colors ${
                  p.featured ? "bg-lime text-lime-ink hover:bg-[#C0EA5C]" : "border border-ink/15 text-ink hover:bg-ink/[0.03]"
                }`}
              >
                {p.cta}
              </a>
              <ul className="mt-6 space-y-3 text-sm text-ink-soft">
                {p.feats.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#4E8A2E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden>
                      <path d={CHECK} />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-ink-faint">
          Illustrative pricing in Philippine peso (₱), easy to edit. Receipt scanning and community prices are live in the app today.
        </p>
      </div>
    </section>
  );
}
