import Image from "next/image";

/**
 * Zeb — the mascot, in one of his shipped poses. Ported verbatim from
 * Zhevion's ZebMascot.tsx (it already points at Zebite's own art, since
 * Zeb belongs to Zebite in the first place).
 *
 * The source art is rendered on a fixed canvas with a lot of transparent
 * padding, so each pose records its opaque bounding box (measured from the
 * PNG's alpha channel) and this component crops to it: the wrapper takes
 * the *content* aspect ratio, and the image is scaled up and offset inside
 * it so the content box exactly fills the wrapper.
 */
const POSES = {
  wave: { src: "/mascot/zeb/zebwave.png", w: 1024, h: 682, box: { x: 315, y: 28, w: 467, h: 591 } },
  cook: { src: "/mascot/zeb/zebcook.png", w: 1024, h: 1024, box: { x: 144, y: 23, w: 762, h: 920 } },
  warn: { src: "/mascot/zeb/zebwarn.png", w: 1024, h: 682, box: { x: 263, y: 28, w: 568, h: 603 } },
} as const;

export type ZebPose = keyof typeof POSES;

export function ZebMascot({
  pose = "wave",
  alt = "",
  sizes = "420px",
  priority = false,
  className = "",
}: {
  pose?: ZebPose;
  alt?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const p = POSES[pose];
  const pct = (n: number) => `${(n * 100).toFixed(3)}%`;

  return (
    <span
      className={`relative block overflow-hidden ${className}`}
      style={{ aspectRatio: `${p.box.w} / ${p.box.h}` }}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <Image
        src={p.src}
        alt=""
        width={p.w}
        height={p.h}
        priority={priority}
        sizes={sizes}
        className="absolute max-w-none select-none"
        style={{
          width: pct(p.w / p.box.w),
          height: pct(p.h / p.box.h),
          left: pct(-p.box.x / p.box.w),
          top: pct(-p.box.y / p.box.h),
        }}
        draggable={false}
      />
    </span>
  );
}
