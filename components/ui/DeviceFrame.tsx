import Image from "next/image";

/**
 * iPhone-style device frame sized *from the screenshot itself*. Ported
 * verbatim from Zhevion's DeviceFrame.tsx (the RepForge-specific
 * cycle/chrome props are kept since they're harmless generality, not used
 * by Zebite's own captures).
 *
 * Every dimension is a fraction of `width`, so the same frame reads
 * correctly at both the 124px studio-grid size and the larger hero/bento
 * sizes Zebite uses.
 */
export function DeviceFrame({
  src,
  alt,
  imgWidth,
  imgHeight,
  width = 240,
  chrome = "#f3f1e9",
  bandIncluded = true,
  priority = false,
  sizes,
  objectPosition,
  className = "",
}: {
  src: string;
  alt: string;
  imgWidth: number;
  imgHeight: number;
  width?: number;
  chrome?: string;
  bandIncluded?: boolean;
  priority?: boolean;
  sizes?: string;
  objectPosition?: string;
  className?: string;
}) {
  const bezel = 3;
  const screenW = width - bezel * 2;
  const statusH = bandIncluded ? 0 : Math.round(width * 0.085);
  const screenH = Math.round((screenW * imgHeight) / imgWidth) + statusH;

  const radius = Math.round(width * 0.16);

  const islandW = Math.round(width * 0.28);
  const islandH = Math.round(width * 0.064);
  const islandTop = Math.round(width * 0.02);
  const indicatorW = Math.round(width * 0.32);
  const indicatorH = Math.max(2, Math.round(width * 0.011));
  const indicatorBottom = Math.max(2, Math.round(width * 0.012));

  const dark = isDark(chrome);

  return (
    <div
      className={`relative shrink-0 bg-graphite-700 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.85)] ring-1 ring-white/10 ${className}`}
      style={{ width, padding: bezel, borderRadius: radius }}
    >
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: screenW,
          height: screenH,
          background: chrome,
          borderRadius: radius - bezel,
        }}
      >
        {!bandIncluded && (
          <div
            className="relative z-20 flex shrink-0 items-center justify-center"
            style={{ height: statusH }}
          >
            <Island width={islandW} height={islandH} />
          </div>
        )}

        <div className="relative flex-1">
          <Image
            src={src}
            alt={alt}
            width={imgWidth}
            height={imgHeight}
            priority={priority}
            sizes={sizes ?? `${Math.round(width * 1.3)}px`}
            className="block h-full w-full"
            style={{ objectPosition: objectPosition }}
          />

          {bandIncluded && (
            <div
              className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2"
              style={{ top: islandTop }}
            >
              <Island width={islandW} height={islandH} />
            </div>
          )}

          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 rounded-full"
            style={{
              bottom: indicatorBottom,
              width: indicatorW,
              height: indicatorH,
              background: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.28)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Island({ width, height }: { width: number; height: number }) {
  return (
    <div
      aria-hidden
      className="rounded-full bg-[#08090a]"
      style={{ width, height }}
    />
  );
}

function isDark(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, (c) => c + c) : h, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}
