/**
 * Zebite content model — single source of truth for copy on this page.
 *
 * HONESTY RULE (same one the static site followed): every feature named
 * here is real and shipping. No recipe sharing, no AI calorie guessing
 * (targets are Mifflin-St Jeor -> TDEE -> goal), no barcode scanning.
 */

// Kept in sync with lib/content.ts in landing_page_zhevion, which is the
// studio-wide source of truth for this address — every /legal doc on
// zhevion.com promises this same inbox.
const CONTACT_EMAIL = "zebite@zhevion.com";

export const CONTACT = {
  email: CONTACT_EMAIL,
};

/**
 * Where the app actually is.
 *
 * An empty string means that listing is not public yet, and every store
 * button on the site renders as an unclickable "soon" chip instead of a
 * link that goes nowhere. Paste a URL in and it becomes a real download
 * everywhere at once — no other file needs touching.
 *
 * The HONESTY RULE at the top of this file bites hardest here: on launch
 * morning the listing may still be propagating, and a badge that looks
 * tappable but isn't is the one thing a release page must not ship.
 *
 * NOT A TESTER LINK. A closed- or internal-testing opt-in URL
 * (play.google.com/apps/testing/… or /apps/internaltest/…) resolves only
 * for Google accounts already on the tester list; to everybody else it is
 * an "item not available" page that reads as a broken download. While
 * Zebite is in closed testing that link belongs in mail to the people it
 * works for — `play` below stays empty until there is a PUBLIC listing.
 */
export const STORE = {
  /** Public listing only. e.g. "https://play.google.com/store/apps/details?id=com.zhevion.zebite" */
  play: "",
  /** e.g. "https://apps.apple.com/app/id0000000000" */
  ios: "",
};

export const NAV = {
  links: [
    { href: "#how", label: "How it works" },
    { href: "#family", label: "Family" },
    { href: "#prices", label: "Prices" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faq", label: "FAQ" },
  ],
};

/**
 * Hero — the first screen. Built on the same HAVE -> WANT -> BUDGET spine
 * the rest of the site repeats. The rotating words are the three inputs
 * the AI plan is built around — real product mechanics, not studio-style
 * service offerings (Zhevion's own hero rotates through service categories
 * since it's a portfolio; Zebite's rotates through what the plan uses,
 * since it's the product itself).
 */
export const HERO = {
  eyebrow: "AI-planned groceries",
  lead: "One AI plan, built around",
  tail: "so you shop only what's missing.",
  words: ["YOUR PANTRY", "YOUR GOALS", "YOUR BUDGET"],
  restWord: "YOUR PANTRY",
  spoken:
    "One AI plan for the week, built around your pantry, your goals and your budget — so you shop only what's missing.",
};

/**
 * Where the phone's screen sits inside /hero/hand-phone.png, as a percentage
 * of that image's own box. Measured by Zhevion's scripts/export-hand.py
 * against this exact photo — reused as-is, since it's the same image.
 */
export const HAND_SCREEN_RECT = {
  left: 15.135,
  top: 1.957,
  width: 49.189,
  height: 74.377,
  radius: "12.09% / 5.26%",
};
