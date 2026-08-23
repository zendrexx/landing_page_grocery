import Image from "next/image";
import { CONTACT } from "@/lib/content";

const PRODUCT_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#family", label: "Family" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
  { href: "#get", label: "Get early access" },
];

export function Footer() {
  return (
    <footer className="world-grocery bg-graphite-900 py-16 text-cream">
      <div className="shell">
        <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <a href="#top" aria-label="Zebite — home" className="inline-flex items-center gap-2.5">
              <Image src="/mascot/zeb-face.png" alt="" width={36} height={36} className="rounded-full" />
              <span className="text-lg font-extrabold">Zebite</span>
            </a>
            <p className="mt-4 max-w-[38ch] text-sm text-muted">
              Zebite plans your week of meals and groceries around what you have, what you want, and your budget — with Zeb to help. Built with Flutter for iOS &amp; Android.
            </p>
            <div className="mt-5 flex gap-3">
              <SocialLink href="https://www.linkedin.com/in/zendrex-adversalo-1abb69355" label="LinkedIn">
                <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2 3.77-2 4.03 0 4.78 2.66 4.78 6.12V21h-4v-5.4c0-1.3-.02-2.96-1.8-2.96-1.8 0-2.08 1.4-2.08 2.86V21H9z" />
              </SocialLink>
              <SocialLink href="https://github.com/zendrexx" label="GitHub">
                <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
              </SocialLink>
              <SocialLink href={`mailto:${CONTACT.email}`} label="Email" stroke>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </SocialLink>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-muted">Product</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {PRODUCT_LINKS.map((l) => (
                <li key={l.href}><a href={l.href} className="text-cream/85 hover:text-cream">{l.label}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.1em] text-muted">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><a href="#about" className="text-cream/85 hover:text-cream">About</a></li>
              <li><a href={`mailto:${CONTACT.email}`} className="text-cream/85 hover:text-cream">Contact</a></li>
              <li><a href="https://zendrex.zhevion.com" target="_blank" rel="noreferrer" className="text-cream/85 hover:text-cream">Portfolio</a></li>
              <li><a href="https://zhevion.com/legal/zebite/privacy" target="_blank" rel="noreferrer" className="text-cream/85 hover:text-cream">Privacy Policy</a></li>
              <li><a href="https://zhevion.com/legal/zebite/terms" target="_blank" rel="noreferrer" className="text-cream/85 hover:text-cream">Terms of Service</a></li>
              <li><a href="https://zhevion.com/legal/zebite/delete-data" target="_blank" rel="noreferrer" className="text-cream/85 hover:text-cream">Delete My Data</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-hairline pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Zebite. Made for healthier, cheaper, lower-waste weeks.</span>
          <span>
            <a href="https://zhevion.com/legal/zebite/privacy" target="_blank" rel="noreferrer" className="hover:text-cream">Privacy</a>
            {" · "}
            <a href="https://zhevion.com/legal/zebite/terms" target="_blank" rel="noreferrer" className="hover:text-cream">Terms</a>
            {" · "}
            <a href="https://zhevion.com/legal/zebite/delete-data" target="_blank" rel="noreferrer" className="hover:text-cream">Delete data</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children, stroke }: { href: string; label: string; children: React.ReactNode; stroke?: boolean }) {
  return (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-pill border border-hairline text-cream/80 transition-colors hover:border-cream/40 hover:text-cream">
      <svg viewBox="0 0 24 24" width="17" height="17" fill={stroke ? "none" : "currentColor"} stroke={stroke ? "currentColor" : undefined} strokeWidth={stroke ? 2 : undefined} aria-hidden>
        {children}
      </svg>
    </a>
  );
}
