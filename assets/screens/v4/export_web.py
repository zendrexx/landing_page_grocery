# Build the landing page's screenshot set from the v4 masters.
#
#   python assets/screens/v4/export_web.py
#
# For every screen listed below, in both themes:
#   1. crop the Android status bar (144px) and gesture bar (132px) away —
#      the page draws its own Dynamic Island and home indicator over the top,
#   2. downscale 2580px -> 840px (enough for a 300px phone at 2.8x),
#   3. extend the first/last kept row into a top/bottom band the exact size of
#      the frame's padding, so light AND dark shots always meet the bezel in
#      their own background colour (sheets are dimmed by a scrim — a fixed
#      cream padding would seam),
#   4. save WebP to assets/screens/{light,dark}/.
#
# The masters stay put; only the .webp files below ship with the page.

import os
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..")
CROP_TOP, CROP_BOTTOM = 144, 132   # 24dp status bar, 22dp gesture bar @ dpr 6
WIDTH = 840
BAND_TOP, BAND_BOTTOM = 48, 22     # == .device .screen padding, in screen widths
QUALITY = 82

SCREENS = [
    "10_home", "11_home_budget", "12_budget_plan",
    "20_plan", "21_plan_recipe", "22_cook_sheet",
    "30_grocery", "31_price_book",
    "40_pantry", "41_add_to_pantry",
    "50_insights", "51_insights_charts",
    "70_zeb_empty", "71_zeb_chat",
    "80_generate",
]


def build(theme, name):
    src = os.path.join(ROOT, "screens", "v4", theme, name + ".png")
    im = Image.open(src).convert("RGB")
    w, h = im.size

    im = im.crop((0, CROP_TOP, w, h - CROP_BOTTOM))
    im = im.resize((WIDTH, round(im.size[1] * WIDTH / w)), Image.LANCZOS)

    out = Image.new("RGB", (WIDTH, im.size[1] + BAND_TOP + BAND_BOTTOM))
    out.paste(im, (0, BAND_TOP))
    out.paste(im.crop((0, 0, WIDTH, 1)).resize((WIDTH, BAND_TOP)), (0, 0))
    out.paste(im.crop((0, im.size[1] - 1, WIDTH, im.size[1])).resize((WIDTH, BAND_BOTTOM)),
              (0, BAND_TOP + im.size[1]))

    dst_dir = os.path.join(ROOT, "screens", theme)
    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, name + ".webp")
    out.save(dst, "WEBP", quality=QUALITY, method=6)
    return out.size, os.path.getsize(dst)


if __name__ == "__main__":
    total = 0
    size = None
    for theme in ("light", "dark"):
        for name in SCREENS:
            size, nbytes = build(theme, name)
            total += nbytes
            print("%-6s %-20s %5.0f KB" % (theme, name, nbytes / 1024))
    print("\n%d files, %s px each, %.1f MB total" %
          (len(SCREENS) * 2, "x".join(map(str, size)), total / 1048576))
