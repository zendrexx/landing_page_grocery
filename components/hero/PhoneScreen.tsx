import Image from "next/image";
import { HAND_SCREEN_RECT } from "@/lib/content";

/**
 * The interface inside the hero phone. Ported from Zhevion's PhoneScreen.tsx.
 * The default image already *is* Zebite's own home screen — Zhevion's site
 * composites this exact capture into this exact hand photo for its own
 * Zebite case-study hero, so reusing both the photo and the crop math here
 * is a literal, correct reuse, not a coincidence.
 */
export function PhoneScreen({
  src = "/screens/light/10_home.webp",
  alt = "Zebite's home screen, showing the week's meal plan.",
}: {
  src?: string;
  alt?: string;
}) {
  return (
    <div
      className="pointer-events-auto absolute overflow-hidden bg-paper"
      data-cursor="visual"
      data-cursor-label="Zebite"
      style={{
        left: `${HAND_SCREEN_RECT.left}%`,
        top: `${HAND_SCREEN_RECT.top}%`,
        width: `${HAND_SCREEN_RECT.width}%`,
        height: `${HAND_SCREEN_RECT.height}%`,
        borderRadius: HAND_SCREEN_RECT.radius,
      }}
    >
      {/* object-contain, not object-cover: this capture's aspect ratio (860:1828)
          doesn't match the hand photo's screen cutout (measured at ~0.435 —
          Zhevion's own zebite-home.webp was pre-cropped to that exact ratio).
          Covering would crop real width off both sides of the screen content;
          containing shows the capture in full, with a hair of its own paper-
          colored margin top and bottom instead of losing edges of the UI. */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 40vw, 260px"
        className="object-contain"
        priority
      />

      {/* Dynamic Island */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[1.2%] z-20 -translate-x-1/2"
        style={{
          width: "28%",
          aspectRatio: "3.2 / 1",
          borderRadius: "9999px",
          background: "#000",
        }}
      />

      {/* Glass. A single soft diagonal, low enough that it reads as the room
          reflecting rather than as a gradient laid over a screenshot. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(128deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.06) 22%, rgba(255,255,255,0) 46%)",
        }}
      />
    </div>
  );
}
