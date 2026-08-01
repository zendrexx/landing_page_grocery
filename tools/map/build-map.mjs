#!/usr/bin/env node
/**
 * Regenerates the price-intelligence map in index.html + main.js.
 *
 * The map used to be hand-drawn: island paths eyeballed straight into the SVG,
 * pins nudged until they "looked right". They weren't — Baguio landed near
 * Agoo and Metro Manila sat somewhere around Tarlac. Coordinates that come out
 * of a projection can't drift like that, so both the coastline and every pin
 * are computed here from real numbers:
 *
 *   coastline  tools/map/ph-coastline.json   Natural Earth 1:10m, public domain
 *   cities     assets/data/prices.json       lat/lng + the prices themselves
 *
 * 1:10m, not the lighter 1:50m: at 50m the generalized west coast of Luzon is
 * drawn east of where it really is, far enough that Baguio's true coordinates
 * land in the sea. A coastline you place pins against has to be the accurate
 * one, so the detail is spent here and paid back by simplifying afterwards.
 *
 * Run it after editing either one:
 *
 *   node tools/map/build-map.mjs          # rewrite the generated regions
 *   node tools/map/build-map.mjs --check  # CI-friendly: fail if stale
 *   node tools/map/build-map.mjs --print  # dump to stdout, touch nothing
 *
 * It only ever writes between `map:<name>:start` / `map:<name>:end` markers.
 * Everything outside them is yours; nothing here runs in the browser.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/* ---------------------------------------------------------------------------
   1. Projection

   Web Mercator, fitted to the viewBox. Mercator rather than a plain lat/lng
   stretch because at 5–21°N a naive equirectangular map is visibly ~5% too
   tall in the north, which is exactly the kind of error that puts a pin in the
   wrong province. The archipelago is fitted to FIT_H tall and centred, leaving
   the side margins for pin labels to run into.
   ------------------------------------------------------------------------- */
const VIEW_W = 600;
const VIEW_H = 800;
const FIT_W  = 424;   // widest the landmass may draw — the rest is label room
const FIT_H  = 716;
const CX     = 300;
const CY     = 400;

const rad = (d) => (d * Math.PI) / 180;
const mercY = (lat) => Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2));

/* Tuning knobs. The dot pattern only paints where a dot's centre lands inside
   the shape, so anything under about 2×2 dots draws as nothing at all — dead
   markup that still counts towards the bounding box and quietly shrinks the
   whole archipelago. Dropped instead.

   SIMPLIFY is the one number that trades page weight against coastline: 1.0px
   here is ~2.6 km on the ground, well under one dot spacing, and takes the
   10m data from ~7,000 points to ~1,000. */
const SIMPLIFY = 1;     // Douglas–Peucker tolerance, in viewBox px
const MIN_AREA = 14;    // px², post-projection — roughly two pattern dots

/* Islands that make up "Luzon" for the north-to-south light-up. The mask layer
   answers "we start where the data is densest", so it is the island group, not
   just the one landmass. A point inside each is enough to identify its ring. */
const LUZON_GROUP = [
  { name: 'Luzon',       lat: 16.00, lng: 121.00 },
  { name: 'Mindoro',     lat: 12.90, lng: 121.10 },
  { name: 'Marinduque',  lat: 13.40, lng: 121.95 },
  { name: 'Catanduanes', lat: 13.85, lng: 124.25 },
  { name: 'Polillo',     lat: 14.80, lng: 121.92 }
];

/* ---------------------------------------------------------------------------
   2. Geometry helpers
   ------------------------------------------------------------------------- */
function ringArea(r) {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    a += r[j][0] * r[i][1] - r[i][0] * r[j][1];
  }
  return Math.abs(a / 2);
}

function pointInRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > pt[1]) !== (yj > pt[1]) &&
        pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Douglas–Peucker. Iterative so a 236-point ring can't blow the stack. */
function simplify(pts, tol) {
  if (pts.length < 4) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [first, last] = stack.pop();
    let maxD = -1, idx = -1;
    const [ax, ay] = pts[first];
    const [bx, by] = pts[last];
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    for (let i = first + 1; i < last; i++) {
      const [px, py] = pts[i];
      let d;
      if (len2 === 0) {
        d = Math.hypot(px - ax, py - ay);
      } else {
        let t = ((px - ax) * dx + (py - ay) * dy) / len2;
        t = Math.max(0, Math.min(1, t));
        d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      }
      if (d > maxD) { maxD = d; idx = i; }
    }
    if (maxD > tol && idx > 0) {
      keep[idx] = 1;
      stack.push([first, idx], [idx, last]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

const r1 = (n) => Math.round(n * 10) / 10;

function toPath(pts) {
  let d = 'M' + r1(pts[0][0]) + ' ' + r1(pts[0][1]);
  for (let i = 1; i < pts.length; i++) d += 'L' + r1(pts[i][0]) + ' ' + r1(pts[i][1]);
  return d + 'Z';
}

/* ---------------------------------------------------------------------------
   3. Build
   ------------------------------------------------------------------------- */
const geo    = JSON.parse(read('tools/map/ph-coastline.json'));
const prices = JSON.parse(read('assets/data/prices.json'));

const lonlatRings = geo.coordinates.map((poly) => poly[0]);

// Mercator, still in radians/log units — scale comes after we know the extent.
const flat = lonlatRings.map((ring) => ring.map(([lng, lat]) => [rad(lng), -mercY(lat)]));

function fitTo(rings) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const ring of rings) {
    for (const [x, y] of ring) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  const scale = Math.min(FIT_W / (maxX - minX), FIT_H / (maxY - minY));
  return { scale, offX: CX - ((minX + maxX) / 2) * scale, offY: CY - ((minY + maxY) / 2) * scale };
}

/* Two passes: fit everything, drop what's too small to draw at that scale,
   then re-fit to what's left. Otherwise an islet that paints zero dots still
   claims its share of the frame and the visible map comes out ~15% small. */
const drawable = (t) => flat.filter((ring) => ringArea(ring.map(([x, y]) => [x * t.scale, y * t.scale])) >= MIN_AREA);
const t = fitTo(drawable(fitTo(flat)));
const { scale, offX, offY } = t;

/** The one function that turns a real place into a viewBox coordinate. */
const project = (lat, lng) => [rad(lng) * scale + offX, -mercY(lat) * scale + offY];

const islands = flat
  .map((ring, i) => {
    const pts = ring.map(([x, y]) => [x * scale + offX, y * scale + offY]);
    return { i, pts, area: ringArea(pts), lonlat: lonlatRings[i] };
  })
  .filter((isl) => isl.area >= MIN_AREA)
  .sort((a, b) => b.area - a.area)
  .map((isl) => {
    const simple = simplify(isl.pts, SIMPLIFY);
    const luzon = LUZON_GROUP.find((c) => pointInRing([c.lng, c.lat], isl.lonlat));
    return { ...isl, d: toPath(simple), n: simple.length, luzon: luzon && luzon.name };
  });

const cityKeys = Object.keys(prices.cities);
const cities = cityKeys.map((key) => {
  const c = prices.cities[key];
  const [x, y] = project(c.lat, c.lng);
  const label = c.label || {};
  return {
    key, ...c,
    x: r1(x), y: r1(y),
    lx: r1(x + (label.dx ?? 14)),
    ly: r1(y + (label.dy ?? -3)),
    anchor: label.anchor || 'start',
    r: c.hub ? 8 : 7
  };
});
const byKey = Object.fromEntries(cities.map((c) => [c.key, c]));

/* Touch targets, sized to the gap. 22px is the comfortable default, but real
   neighbours are real neighbours: Baguio and Pangasinan are ~40 km apart and a
   pair of 22px circles over them would overlap, leaving one of the two
   impossible to hover. Half the distance to the nearest other pin, floored at
   11px so nothing becomes un-tappable. */
cities.forEach((c) => {
  const nearest = Math.min(...cities.filter((o) => o !== c)
    .map((o) => Math.hypot(o.x - c.x, o.y - c.y)));
  c.hit = Math.round(Math.max(11, Math.min(22, nearest / 2)));
});

/* Route arcs bow away from the straight line so two of them leaving the same
   pin stay tellable apart. Sign alternates for the same reason. */
const routes = (prices.routes || []).map(([a, b], i) => {
  const A = byKey[a], B = byKey[b];
  if (!A || !B) throw new Error(`route ${a}→${b}: unknown city`);
  const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
  const dx = B.x - A.x, dy = B.y - A.y;
  const bow = (i % 2 ? -1 : 1) * 0.14;
  return `<path class="map-link" d="M${A.x} ${A.y} Q ${r1(mx - dy * bow)} ${r1(my + dx * bow)} ${B.x} ${B.y}" />`;
});

/* ---------------------------------------------------------------------------
   4. Generated regions
   ------------------------------------------------------------------------- */
const I4  = '\n    ';
const I14 = '\n              ';
const I16 = '\n                ';
const I18 = '\n                  ';

const regions = {
  'index.html': {
    /* Luzon sits in its own nested <g> so the lit layer can <use> just that
       group. Nested rather than a second copy of the same paths — the lit
       overlay is the same geometry, and it is not worth 5 KB to say so twice. */
    'map:islands': islands
      .filter((isl) => !isl.luzon)
      .map((isl) => `<path d="${isl.d}" />`)
      .join(I16),

    'map:luzon': islands
      .filter((isl) => isl.luzon)
      .map((isl) => `<path d="${isl.d}" />`)
      .join(I18),

    'map:ripple': `<circle cx="${byKey[prices.seed].x}" cy="${byKey[prices.seed].y}" r="0" fill="#fff" data-ripple />`,

    'map:links': routes.join(I14),

    'map:pins': cities.map((c) => [
      `<g class="pin" data-pin="${c.key}" role="button" tabindex="0" aria-label="${c.name} prices">`,
      `  <circle class="pin__hit" cx="${c.x}" cy="${c.y}" r="${c.hit}" />`,
      `  <ellipse class="pin__shadow" cx="${c.x}" cy="${r1(c.y + 6)}" rx="${c.r}" ry="${c.r > 7 ? 3 : 2.5}" />`,
      `  <circle class="pin__ring" cx="${c.x}" cy="${c.y}" r="${c.r}" />`,
      `  <circle class="pin__dot" cx="${c.x}" cy="${c.y}" r="${c.r - 2}" />`,
      `  <text class="pin__label" x="${c.lx}" y="${c.ly}"${c.anchor === 'end' ? ' text-anchor="end"' : ''}>${c.name}</text>`,
      `</g>`
    ].join(I14)).join(I14),

    /* One line on purpose: the marker sits inline inside <desc>, so anything
       multi-line comes back out of the splice with ragged indentation. */
    'map:desc': 'A dotted map of the Philippine archipelago with markers on ' +
      cities.map((c) => c.name).join(', ').replace(/, ([^,]*)$/, ' and $1') +
      '. Luzon is highlighted first. The same prices are listed as text beside the map.'
  },

  'main.js': {
    'map:proj': [
      `var MAP_PROJ = { scale: ${+scale.toFixed(4)}, offX: ${+offX.toFixed(2)}, offY: ${+offY.toFixed(2)} };`,
      `function project(lat, lng) {`,
      `  var x = lng * Math.PI / 180 * MAP_PROJ.scale + MAP_PROJ.offX;`,
      `  var y = -Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * MAP_PROJ.scale + MAP_PROJ.offY;`,
      `  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };`,
      `}`
    ].join(I4),

    /* The inline copy of assets/data/prices.json, so the section still works
       from a file:// open (where fetch is blocked) and if the request fails.
       Written one city per line, ES5, to read like the rest of the file —
       build-time-only keys (label) stripped. */
    'map:fallback': [
      `var FALLBACK = {`,
      `  source: ${js(prices.source)}, seed: ${js(prices.seed)},`,
      `  order: [${prices.order.map(js).join(', ')}],`,
      `  cities: {`,
      cityKeys.map((k, i) => {
        const { label, ...rest } = prices.cities[k];
        const pairs = Object.keys(rest).map((f) => `${f}: ${js(rest[f])}`).join(', ');
        return `    ${k}: { ${pairs} }${i < cityKeys.length - 1 ? ',' : ''}`;
      }).join(I4),
      `  }`,
      `};`
    ].join(I4)
  }
};

function js(v) { return typeof v === 'string' ? `'${v.replace(/'/g, "\\'")}'` : String(v); }

/* ---------------------------------------------------------------------------
   6. Splice
   ------------------------------------------------------------------------- */
function splice(src, name, body, file) {
  const isJs = file.endsWith('.js');
  const open = isJs ? `/* ${name}:start */` : `<!-- ${name}:start -->`;
  const close = isJs ? `/* ${name}:end */` : `<!-- ${name}:end -->`;
  const a = src.indexOf(open);
  const b = src.indexOf(close);
  if (a < 0 || b < 0) throw new Error(`${file}: missing marker ${name}`);
  // Preserve the indentation the opening marker sits at.
  const lineStart = src.lastIndexOf('\n', a) + 1;
  const indent = src.slice(lineStart, a).match(/^\s*/)[0];
  return src.slice(0, a + open.length) + '\n' + indent + body + '\n' + indent + src.slice(b);
}

/* ---------------------------------------------------------------------------
   5. Sanity check

   The whole point of generating this is that a pin can't end up in the sea.
   So check: every city has to fall inside the island it is drawn on, tested
   against the simplified path that actually ships — not the source data.
   ------------------------------------------------------------------------- */
const simplified = islands.map((isl) => simplify(isl.pts, SIMPLIFY));
const offshore = [];
cities.forEach((c) => {
  const host = simplified.find((pts) => pointInRing([c.x, c.y], pts));
  c.onLand = !!host;
  if (!host) offshore.push(c.key);
});

const mode = process.argv[2] || '--write';
let stale = false;

for (const [file, blocks] of Object.entries(regions)) {
  const before = read(file);
  let after = before;
  for (const [name, body] of Object.entries(blocks)) after = splice(after, name, body, file);

  if (mode === '--print') {
    for (const [name, body] of Object.entries(blocks)) console.log(`--- ${file} ${name} ---\n${body}\n`);
  } else if (mode === '--check') {
    if (after !== before) { stale = true; console.error(`stale: ${file}`); }
  } else {
    if (after !== before) fs.writeFileSync(path.join(ROOT, file), after);
    console.log(`${after === before ? 'unchanged' : 'updated  '}  ${file}`);
  }
}

if (mode !== '--print') {
  console.error(
    `\n${islands.length} islands (${islands.reduce((s, i) => s + i.n, 0)} points), ` +
    `${islands.filter((i) => i.luzon).length} in the Luzon group, ` +
    `${cities.length} cities, scale ${scale.toFixed(1)} px/rad`
  );
  for (const c of cities) {
    console.error(
      `  ${c.key.padEnd(11)} ${String(c.lat).padStart(7)}, ${String(c.lng).padStart(8)}` +
      `  ->  ${String(c.x).padStart(5)}, ${String(c.y).padStart(5)}` +
      `  ${c.onLand ? 'on land' : 'IN THE SEA'}  hit r${c.hit}`
    );
  }
  if (offshore.length) {
    console.error(`\n! ${offshore.join(', ')} did not land on any island. Check the lat/lng — ` +
                  `lng is the ~120-127 one — or raise the coastline detail.`);
  }
}

if (stale || offshore.length) process.exit(1);
