"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

/**
 * City figures, inlined from the static build's assets/data/prices.json
 * fallback table (source: "sample" — see the honesty note below). Clicking
 * a pin swaps which of these is on screen.
 */
const CITIES: Record<
  string,
  { name: string; rice: number; eggs: number; chicken: number; updated: number; conf: number; n: number }
> = {
  manila: { name: "Metro Manila", rice: 48, eggs: 9, chicken: 195, updated: 12, conf: 94, n: 1240 },
  baguio: { name: "Baguio", rice: 52, eggs: 8, chicken: 205, updated: 6, conf: 87, n: 410 },
  pangasinan: { name: "Pangasinan", rice: 43, eggs: 8, chicken: 181, updated: 38, conf: 71, n: 168 },
  vigan: { name: "Vigan", rice: 47, eggs: 8, chicken: 190, updated: 52, conf: 64, n: 96 },
  tuguegarao: { name: "Tuguegarao", rice: 42, eggs: 7, chicken: 179, updated: 63, conf: 61, n: 84 },
  tarlac: { name: "Tarlac", rice: 44, eggs: 8, chicken: 186, updated: 27, conf: 74, n: 205 },
  zambales: { name: "Zambales", rice: 46, eggs: 9, chicken: 192, updated: 44, conf: 66, n: 112 },
  naga: { name: "Naga", rice: 46, eggs: 8, chicken: 188, updated: 24, conf: 78, n: 210 },
};

/**
 * Price intelligence — the generated Philippines map. This SVG is extracted
 * byte-for-byte from the static build's output of tools/map/build-map.mjs
 * (every path is real projected geometry from Natural Earth coastline data
 * + real lat/lng pins — nothing here is hand-drawn or eyeballed). The
 * JS-driven scroll wipe and contribution-ripple animations from that build
 * aren't reimplemented here — Luzon just renders lit directly — everything
 * else (the archipelago, the routes, the eight pins) is the same generated
 * output, unchanged. Clicking a pin, though, does what it always did: swaps
 * the price cards and confidence panel to that city.
 *
 * The ₱ figures below are still placeholders, same honesty note the
 * static build carried: the budget claim is true and made elsewhere on the
 * page; this map illustrates it, it doesn't report it yet.
 */
export function Prices() {
  const [cityKey, setCityKey] = useState("manila");
  const city = CITIES[cityKey];

  return (
    <section id="prices" className="world-grocery bg-paper py-[clamp(64px,10vh,120px)]">
      <div className="shell grid gap-14 lg:grid-cols-2 lg:items-center">
        <Reveal className="relative">
          <div className="map-stage">
            <svg className="map-svg" viewBox="0 0 600 800" role="img"
                           aria-labelledby="map-title map-desc" data-map-svg>
                        <title id="map-title">Map of the Philippines showing community price coverage</title>
                        <desc id="map-desc">
                        A dotted map of the Philippine archipelago with markers on Metro Manila, Baguio, Pangasinan, Vigan, Tuguegarao, Tarlac, Zambales and Naga. Luzon is highlighted first. The same prices are listed as text beside the map.
                        </desc>
                        <defs>
                          <pattern id="dotIdle" width="8" height="8" patternUnits="userSpaceOnUse">
                            <circle cx="4" cy="4" r="1.8" fill="rgba(22,26,23,0.34)" />
                          </pattern>
                          <pattern id="dotLuzon" width="8" height="8" patternUnits="userSpaceOnUse">
                            <circle cx="4" cy="4" r="2" fill="#4E8A2E" />
                          </pattern>
                          <pattern id="dotGlow" width="8" height="8" patternUnits="userSpaceOnUse">
                            <circle cx="4" cy="4" r="2.1" fill="#B5E34D" />
                          </pattern>
                          <linearGradient id="linkGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%"   stopColor="#9BCB34" stopOpacity="0.1" />
                            <stop offset="50%"  stopColor="#B5E34D" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#9BCB34" stopOpacity="0.1" />
                          </linearGradient>
                          <g id="ph-islands">
                            <g id="ph-luzon">
                              <path d="M322 153.1L323.2 156.2L322.4 160L316.5 166.9L317.1 172.1L315 183.3L315.9 188.6L320 200.3L327 202.1L328.3 204.5L326.8 204.1L327.1 209.9L328.6 211.4L330.7 210.2L331.9 212.4L327.4 225.7L318 241.9L318.5 243.7L319.2 242.7L317.7 248.3L319.2 247.1L318 250.8L309.1 259.9L315 249.7L312.9 249.9L311.4 253.2L298.5 257.9L290.6 265.1L290.1 269L290.9 271.4L293.8 273.1L291.8 275.9L293.2 276.5L287.5 282.2L284.5 289.3L283 289.1L283 294.1L286.9 297.8L292.6 311.6L291.8 312.2L297.4 317.9L292.6 319.8L292.3 322.4L294.7 331.9L298.8 339.4L297.6 342L306.4 350.6L319.2 354.5L317.1 350.9L321.8 351.7L322.7 349.6L318.2 346.5L316.2 342.9L317.1 343.9L320.5 339.4L322.1 346.3L324.1 344.6L323.4 341.5L327.1 336L331.9 334.9L336.9 337.7L338.9 337.5L338.4 334.8L346.7 338.6L354 346L353.6 349.3L355.7 350.9L356 354.7L354.3 360.3L356.8 362.7L361.9 362.3L365.2 359.7L364.2 354.5L366.6 351.2L364.7 353.3L361.6 350.7L363.1 349.8L363 347.4L365.7 348.1L366.5 346L367.1 349.6L369 348.7L370.1 354.5L371.3 352.1L373.4 353.9L381.5 355.5L382.8 353.3L386.8 357.6L392.5 359.9L393.7 363L389.1 361.8L386.5 364.2L376.7 362.6L374.8 367.8L375.2 369.7L380.9 373.1L384.1 379.6L389 384.5L385.2 384.7L384.3 391.8L386.5 392.2L390.1 388.1L398.7 394.2L400.2 391.3L403.1 392.1L400.2 398.3L400.7 408.8L399 411L399.3 414.1L397.5 415L394.5 414.6L390 410.2L388.4 403.4L386.3 402L389.3 400.2L391.2 401.6L395.3 399.9L396.3 396.6L390.6 395.7L388.3 399.5L383.4 401.4L383.7 399.4L381.3 399.7L382.2 397.6L378.2 399.3L371.2 393L365.5 394L364.2 389.3L365.1 384.2L360.4 378.7L359.4 374.7L346.1 367.8L344.2 365.7L346.3 363.9L341.6 358.8L337.3 358.1L337.3 356.5L332.3 352.1L331.4 353.3L326.9 352.7L331.1 358.3L330.6 365.8L336.5 370.9L333.6 369.7L338.1 377.8L338.9 384.5L334.5 386.9L330.9 384L330.7 378.3L325.1 370.3L317.5 367.1L311.8 359L308.7 358.8L297.4 351.7L295.9 353.6L287 356.9L284.8 359.4L285 363.6L286.1 363.9L278.2 368.3L273 366.3L267.9 366.6L268.5 362.7L266.4 360.1L261.4 363.9L263.1 360L260.9 354.3L253.5 353.6L254.3 356.8L251.7 356.6L251.1 359.9L249 351.7L250.5 350.7L249.8 345.8L247.9 342.6L250.2 338.4L253.9 337.1L260.9 330L264.9 328.1L263.7 321.4L259.3 316.6L250.8 315.4L249.9 311.6L248.7 314L248.4 310.3L246.3 318.3L248.2 321.6L248.5 329.7L243.3 331.7L240.5 330.2L239 322.8L235.5 321.4L233.6 318L235.8 313.7L232.2 311.3L230.7 316.8L226.6 314.7L227.5 313.7L225.6 310.7L223.4 294L218.4 286.8L219 284.4L220.7 284.8L221.6 283L219.1 279.3L219.7 275.2L217.5 272.8L218.7 267L216.9 263.6L213.3 265.1L212.7 263.8L212.7 252.2L214.7 245.3L219.6 244.3L219 250.1L227 254.3L229.2 259.3L235.8 258.9L236.1 260.6L238.8 258.9L237.4 257.8L240.5 253.9L240.3 251.1L237.7 248.3L235.1 233.9L236.4 233.8L236.9 224.6L242 216.1L240.5 207.2L242.3 199L240.5 193.1L237.5 191.4L238.4 186L240.9 184.4L240 181.3L243.7 171.2L243.4 167.3L248.1 156.7L247.7 148.7L249.5 147L256.3 146L258.2 142.2L263 145.8L270.8 142.3L291.7 154L294.1 157.2L293.9 154.7L302.9 158.4L308.6 158.3L314.3 153.2L315.8 147.9L319.3 148.1L322 153.1Z" />
                              <path d="M288.8 407.6L289.7 411.7L285 415.7L283.9 420.4L285.3 422.9L282.7 422.4L283.2 425.9L281.4 424.4L276.7 429.2L271.1 427.6L270.5 424.1L272.3 425L265.4 420L262.6 416.1L262.4 410.7L259.9 407.1L257.5 406.5L255.8 394.5L251.8 387.7L245.3 384.4L242.7 376L237.3 377.1L237 373L240.5 371.3L255.6 374L265.2 371.2L264.3 372.4L267.3 376L270.9 376.2L271.4 378.2L274.7 375.1L284.7 384.7L285 388.1L290 389.7L287 393.9L287.1 404.8L288.8 407.6Z" />
                              <path d="M413.2 356L411.9 357.2L412.8 365.1L410.5 365.4L409.6 370L407.8 367.9L406 368.1L403.3 371.5L397.2 367.8L396.3 365L399.8 361.7L400.7 358.4L401.1 346.9L404.5 346.5L408.4 354.5L409.4 353.3L413.2 356Z" />
                              <path d="M313.6 376.2L314.4 378.8L309.6 385.5L303.8 382.4L301.2 379L303.1 369.6L305.3 371.5L309.1 370.3L311.1 373.2L314.1 374.1L313.6 376.2Z" />
                            </g>
                            <path d="M505.6 643.6L507.5 645.5L501.2 656.5L496.2 656.7L494.5 658.9L495.8 665.9L491.6 660.2L489.4 659.9L489.5 661.7L488.6 660.8L492.2 667.7L489.8 687.7L485.3 677.7L484.6 663.5L480.5 660.1L480.6 656.4L477 652.3L474.9 642.1L472.9 641.5L466.9 645.5L465.9 652.4L460.1 656L455.5 664.8L454.4 670.8L455.6 674.5L456.8 673.3L463.5 678.4L468.6 693.5L468.2 698.2L456.9 716.5L454.1 718.4L451.4 718.1L450.6 712.7L446 708.7L450.1 700.8L449 695.9L445 695.2L442 704.9L436.6 706.1L421.2 700.3L403.9 690.4L397.5 681L396.8 665.3L395.1 665.9L393.7 663.9L396.4 651.7L403.1 646.9L405.8 639.2L402.7 638.7L398 630.5L391.3 626.4L386.3 625.9L382.4 621.6L377.4 620.3L371.3 621.9L373.6 625.9L373.1 627.9L367.4 631.9L371.6 637.1L370.7 640.7L366.9 638.4L364.2 634.1L360.1 635.8L358.2 634.4L357.7 631.9L360.2 629.5L357.3 624.5L354.3 628.3L352.5 636.2L350.1 635.6L348.6 632.9L345.2 636.8L343 635.4L344.9 632.8L343.8 623.8L335.8 623.1L328.3 630.3L327.8 631.6L330.1 631.6L329.3 634L328.3 635L328.1 633.2L324.2 637.1L325.2 640.5L321.2 643.9L319.7 652.4L315.8 659.8L314.3 661.2L310.8 660.3L306.5 657.6L304.8 654.2L306.3 647.2L311.4 643.3L312.2 634.4L315.5 631.2L314.1 630.5L313.7 623.3L320 614.2L328 610.4L336.6 608.6L338.4 606.2L340.8 608.3L349.8 606.3L352.8 603.2L350.4 599.9L354 592L360.6 589.7L365.9 590.1L368.2 585.8L370.9 585.1L369.3 581.9L374.2 582.9L374.6 586.3L377.2 588L378.7 584.2L384.8 586.9L388.5 593.7L390.1 606.2L385.2 610.7L381.6 611.7L381.3 614.9L393.8 606L405.2 604.1L409 590.9L412.6 586.9L415.4 586.2L415.8 588L420.2 590.7L423.5 590.9L422.5 594.5L423.7 592.6L427.6 591.6L428.4 587.4L427.3 584.1L429.1 581.4L428.8 571.1L430 569.4L434.5 570.1L442.7 577.2L446.2 575.2L447.2 566.1L451.6 570.1L457.1 570.7L460.4 569.1L461.4 560.8L455.3 540.2L457.9 534L463.5 536.9L465.8 543.2L474.7 546.4L479.1 550.1L480 548.9L477.3 552.2L480.9 552.5L481 555.7L483.7 559.1L490.6 556.5L488.9 565.8L494.6 571.7L496 576.2L494.1 579.9L491.2 581.4L492.1 583.5L489.7 583.4L485.9 586.9L488 590.4L491 590.6L490.7 589.2L497.1 589.8L498.6 591.9L495.5 598.2L497.9 600.6L495.7 604L496.7 605.2L500.9 602.9L501.2 609.2L499.7 611.3L500.7 614.2L497.6 618.3L502.1 624.3L506.2 625.5L507.3 636.5L505.5 638.2L505.6 643.6Z" />
                            <path d="M376.9 489.9L373.1 502.2L367 511L364.7 522.1L358.9 532L359.5 539.5L358 542.9L359.8 544.1L358 545.8L360 546.4L366 554.9L365.8 558.6L362.1 565.1L353.6 568.3L350.4 566.3L345.5 554.7L337.4 552.3L332.9 548.4L329 541.3L327.4 541.1L327.7 538.7L326.5 539.4L326.2 533.1L329.6 527.4L339.6 526.8L346.7 521.9L346.6 510.9L344.2 503.7L348.3 500.1L351 494.7L350.1 489.2L351.9 486.6L363.4 482.7L366.9 484.9L369.5 484.6L369.6 486L374.6 486L376.9 489.9Z" />
                            <path d="M468.8 476L471.7 480.2L470.9 481.5L466.2 476L464 477.3L462.4 475.6L460.9 478.5L458.4 476.9L456.4 478.5L451.8 476L448.8 478.5L445.6 470.9L438.2 469.8L438.5 463.8L434.4 460.5L433.3 462.1L430.8 460.2L433.5 457.5L437.2 456.5L438 452.5L440.6 451.2L440.1 449.3L433.6 449.1L429.3 444.9L430.6 442.8L427.9 443L424.4 437.3L416.4 434.3L412 428.9L407.4 413.5L424.4 415.9L432.9 415.2L432.9 412.6L440.3 415.3L442.9 413.1L445.3 413.2L449.9 416.7L453.2 421.1L451.6 422.5L451.7 425.6L453.5 424.7L453.2 425.9L455 425.3L459.7 427.7L461.3 430.6L457.9 433.1L460.8 436.1L457.3 440.9L459.4 447.8L457.5 449.6L458.9 449.3L459.7 451.8L458.2 455.7L460.6 462.3L465.6 466.4L462 473.2L463.9 474.2L465.2 472.2L468.8 476Z" />
                            <path d="M359.5 461.4L357.1 470.8L357.8 474.5L356.8 475.9L354 475.3L350.1 480.9L349.5 479.7L348.9 481.2L343.1 483.6L343.5 488L341.2 491.5L336.3 492.4L334.6 495.7L318.9 498.2L313.6 501.4L309.9 506.8L307 507.3L306.3 504L308.5 497.9L306.5 492.3L311.1 481.7L311 469.3L313.8 453.7L312.8 450.7L302.9 448.8L304.8 443.3L307.6 441.5L313.2 445.9L325.4 450.4L335.9 460.2L337.6 457.6L339.5 458.7L340.4 455.7L344.9 456L349.8 459.6L346.8 462.1L347.9 463.3L359.2 456.3L359.3 458.9L357.4 460.2L359.5 461.4Z" />
                            <path d="M209.1 502.1L211.4 503.6L205 509.6L196.5 511.2L192.5 514.8L188.6 523.8L170.5 529.1L169.5 531.1L170.6 537.8L167.3 536L168 539.7L169.7 540.7L158.6 556.2L152.9 561.4L143.1 564.1L137.8 574.7L126.7 583.3L118.5 584.6L116.3 591.3L109 592.8L102.4 598.6L105.6 586.8L122.4 567.3L127 566.4L127.9 563.2L133.1 558.5L136.8 558.2L137.3 559.7L142.9 554.9L142.9 553.1L151.5 544.3L152.7 541.1L160 536.1L170.4 520.5L170.7 523.8L173 522.6L172.3 518L177.3 517.1L178 513.9L181.3 512.7L181.7 511L179.2 510.6L180.3 508.9L183.3 509.1L185.4 504.9L186 509.3L192.2 504L191 501.9L193.9 500.4L195 494.6L189.8 489L191.3 487.3L189.8 485.1L192.7 485.5L192.2 488L193.6 487.8L194.5 490.2L200.3 494.2L199.8 489.9L195.5 487.9L194 482.5L195.7 482.5L194.6 478L198.1 480L198.8 477.2L196.9 474.3L201.8 464L204.6 469.3L202.4 477.4L204.8 481.8L202.5 482L201.9 487.5L203.1 490.4L206.1 490.2L205.6 496.8L208.3 496.7L209.1 502.1Z" />
                            <path d="M450 512.1L449.4 514.8L444.2 514.1L444.7 518.1L442 516.2L440 510.3L437.8 509.6L439.5 525.4L433.1 520.3L428.7 519.6L429.2 512L426.8 507.9L429.6 496.6L428.7 490.3L421.9 482.4L418.8 483.2L419.4 485.5L417.3 488L412.2 485.4L412.6 469.2L410.4 468.1L411.1 466.1L409.6 465.3L408.1 458.7L409.8 458.4L415.8 465.6L416.8 463.1L422.3 469.2L427.2 468.1L431.5 463.5L437.2 465.3L437.1 470.4L439.2 472.5L440 471.6L440.5 483.9L438.8 493.3L443.3 495.5L446.5 499.9L446.7 507.3L450 512.1Z" />
                            <path d="M397.2 489.8L396.1 493.6L397.5 500.4L395.8 510L394.3 509.8L394 512L386.3 516.3L380.2 523.5L379.2 531.1L372.8 545.9L366.3 552.1L365.7 547.7L369.8 530.7L368.8 527.4L383.3 504.6L383.1 502.2L388.7 493.3L392.4 483.8L392.8 478.2L394 479.1L393.4 474.8L397.1 470.4L398.1 472.3L395.2 479.1L397.5 479.7L397.2 489.8Z" />
                            <path d="M419.5 531.9L422 534.9L420.8 537.7L416.7 536.3L412.8 541.1L407.8 543.4L392.5 542.9L389.7 541.7L389.3 537.8L386.6 536.8L390.3 530L397.4 527.1L400.2 522.3L404.8 519.6L409.4 519.2L410.5 521.4L412.2 519.6L413.2 521.6L420 524.8L419.5 531.9Z" />
                            <path d="M397.5 447.4L397.5 450.7L389 442.4L384.1 441.8L382.8 440.6L383.7 438.3L373.1 429L370.4 429.8L359.1 442.2L361.5 432.8L364.1 431.4L363.4 430.1L364.9 429.1L361.6 428.6L363.9 420L362.3 412.5L367.5 414.5L366.2 419.4L368.8 416.1L370.8 415.8L375.9 418.5L378.4 421.7L377.5 423.2L379.6 422.3L382.1 424.1L386.3 430.4L386.4 427.8L390.4 429.5L397.3 439.9L395.2 438.3L397.5 447.4Z" />
                            <path d="M321.9 672.6L323.6 673.9L319.3 675.2L317.3 680.4L307.6 682.4L304 678.2L303.8 675.1L300.9 673.2L301.5 671.4L312.1 667.9L321.9 672.6Z" />
                            <path d="M238.1 437.3L237.2 438.8L233.4 439.2L229.3 437.3L228.1 440.1L223.2 438.1L218.7 429.5L216.6 431.3L217.7 427.6L219.9 426.5L218.1 426.8L218.3 424.4L231.6 433.7L233.1 429L234.3 432.8L237.9 435.1L236.7 437.6L238.1 437.3Z" />
                            <path d="M282.6 699.7L284.2 702.2L278.8 706.1L276 702.5L269.7 704.8L266.5 703.2L263.4 704.9L260.7 701.6L268 695.7L273 696.7L275.6 700L277.9 698.8L282.6 699.7Z" />
                            <path d="M469.1 530.1L468.3 531.7L466.7 531.1L463.3 525.8L464.7 523.7L463.8 522.3L460.6 523.5L459.5 521.5L460.3 517.2L461.5 517.5L460.6 512.4L462.4 511.8L462.4 509.7L464.4 510L465.6 506.1L467.6 508.8L465.6 515.4L467.6 518.7L467.5 528.1L469.1 530.1Z" />
                            <path d="M314.1 409.3L315.9 410.8L314.7 411.1L310.8 429.2L311.8 431L310.2 431.5L309.7 434L307.4 430.8L307.6 428.6L308.6 429.8L309.3 427.9L305.8 425.3L305.9 423.7L308.9 419.2L309 412.5L314.1 409.3Z" />
                            <path d="M309.4 305.5L311.7 306.7L309.4 306.4L309.7 308.9L307.8 310.3L310.2 318.3L306.6 322L305.3 320.6L306.3 316.4L301.4 308.4L301.7 305.4L302.5 303.9L304.6 304.9L306.1 303.6L309.4 304.2L309.4 305.5Z" />
                            <path d="M234 731.6L232.5 738.2L231 734.3L229.5 735.2L228.4 733.7L227.5 736.4L224.3 736.2L221.2 739.9L215.4 740.6L215.5 737.5L226.9 732L231.3 728.2L234 731.6Z" />
                            <path d="M339.8 494.1L340.9 498.3L338.7 504.1L336.5 506.8L334.8 507.3L334.7 506.2L332.3 507.9L329.9 504.2L333 502.2L332.3 499.7L338 492.9L339.8 494.1Z" />
                            <path d="M421 457.8L421.4 461.2L415.5 461.7L410.2 452.7L417.7 452.4L421 457.8Z" />
                            <path d="M338.7 420.9L338 424.7L335.5 426.5L327.8 420.6L327.4 418.3L329.9 416.9L336.4 417.3L338.7 420.9Z" />
                            <path d="M488.3 533.7L488.8 535.5L483.3 536.9L479.7 532.8L481.8 532.2L480.5 530.5L484.2 523.7L487.1 530.5L485.9 532.5L488.3 533.7Z" />
                            <path d="M364.2 400.5L368.3 408.1L354.8 395.1L351.1 393.8L349.8 389.7L351.8 387.8L353.9 388.9L359.1 397.3L364.2 400.5Z" />
                            <path d="M224.3 443.3L226.8 444.8L224.9 446.7L226.6 447.9L225.2 451.4L221.8 453.4L221.3 450.3L222.5 451.2L223.4 448.2L220.2 448.5L216.9 440.6L218.5 441.3L219.7 439.4L221.4 441.7L224.5 441.9L223.3 442.6L224.3 443.3Z" />
                            <path d="M221.1 499.9L223.7 501.5L222.5 503L220.7 503.7L219.3 501.9L219.5 505.2L214.1 506.3L212.6 502.6L216.2 498.4L221.1 499.9Z" />
                            <path d="M382.2 562.6L382.4 564.2L379.4 565.6L372.4 561.8L379.8 557L382.4 559.7L382.2 562.6Z" />
                            <path d="M97.9 610.8L97.9 618.9L94.6 622L92.3 616.7L92.6 610.6L93.4 612.1L94.8 610.6L97.9 610.8Z" />
                            <path d="M386 422.1L386.2 423.8L377.3 411.2L378.4 408.4L383.7 412.6L386 422.1Z" />
                            <path d="M428.9 561.1L429.9 563L428.3 566.5L422.5 561.9L425.6 558.9L428.9 561.1Z" />
                            <path d="M472.2 658.9L471.6 661.3L469 654.4L467.2 653.6L469 648.2L471.8 650.8L472.2 658.9Z" />
                            <path d="M288.8 111.5L289.7 113.2L287.6 114.3L283.3 112.3L281.3 109L283.2 107.7L288.4 108.2L288.8 111.5Z" />
                            <path d="M450.9 527.5L451.3 529.2L450 529.8L444.4 523.1L444.1 519L448 520.9L450.9 527.5Z" />
                            <path d="M234.4 363.1L234.6 364.8L227.8 360.3L226.9 356.5L233.4 359L234.4 363.1Z" />
                            <path d="M313.7 345.8L316.6 348L316.8 350.1L307.7 344L306 340.6L307.6 340.3L313.7 345.8Z" />
                            <path d="M351 640L345.4 643.9L343.6 642.8L344.8 638L347.2 639.5L348.1 637.7L351 640Z" />
                            <path d="M307.9 126.8L308.7 128.4L302.6 134.1L303.7 127.4L306.9 125.5L307.9 126.8Z" />
                            <path d="M480.8 540L480.5 544.1L478.9 545.2L477.5 542.9L478.4 536.7L480 536.9L480.8 540Z" />
                            <path d="M386.6 474.7L387.2 476L383.7 475.7L382.5 471.9L384.3 469.7L386.6 474.7Z" />
                            <path d="M108.2 599.3L109.7 603.8L106.7 605.3L106.2 599.8L108.2 599.3Z" />
                            <path d="M430.2 454.8L432 456L430.9 459L427 454L426.7 450.9L430.2 454.8Z" />
                            <path d="M282.9 130.5L286.7 131.4L283.7 132.9L278.2 132.3L282.9 130.5Z" />
                            <path d="M217.5 459.9L216 465.9L216 463.8L213.3 464.7L211 462.3L213.3 463.2L214 460.8L216 462.3L215.7 460.2L217.5 459.9Z" />
                            <path d="M303.9 45.1L301.9 48.4L300 48.2L303 42L303.9 45.1Z" />
                            <path d="M248.5 683.5L248 689.1L244.5 689.2L248.5 683.5Z" />
                            <path d="M201 749.6L201.9 753.3L199.8 758L198.9 747.3L201 749.6Z" />
                            <path d="M411.5 496L411.5 498.8L407.4 499.9L409.3 495.5L411.5 496Z" />
                          </g>
                        </defs>
                        <g data-map-idle>
                          <use href="#ph-islands" className="map-land" fill="rgba(22,26,23,0.07)" />
                          <use href="#ph-islands" fill="url(#dotIdle)" />
                        </g>
                        <g data-map-luzon>
                          <use href="#ph-luzon" className="map-land map-land--lit" fill="rgba(78,138,46,0.14)" />
                          <use href="#ph-luzon" fill="url(#dotLuzon)" />
                        </g>
                        <g data-map-links>
                          <path className="map-link" d="M239.8 190.6 Q 236.9 218.2 248.8 243.3" />
                          <path className="map-link" d="M297.5 188.9 Q 280.8 222.9 248.8 243.3" />
                          <path className="map-link" d="M233.2 260.4 Q 243.4 254 248.8 243.3" />
                          <path className="map-link" d="M222.3 291.4 Q 223.4 274.4 233.2 260.4" />
                          <path className="map-link" d="M248.8 243.3 Q 243.1 264 248.9 284.6" />
                          <path className="map-link" d="M248.9 284.6 Q 262.7 301.9 265.5 323.8" />
                          <path className="map-link" d="M265.5 323.8 Q 307 358.8 360.6 367.1" />
                        </g>
                        <g data-map-pins>
                          <g
                            className={`pin${cityKey === "manila" ? " is-active" : ""}`}
                            data-pin="manila"
                            role="button"
                            tabIndex={0}
                            aria-label="Metro Manila prices"
                            aria-pressed={cityKey === "manila"}
                            onClick={() => setCityKey("manila")}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCityKey("manila"); }
                            }}
                          >
                            <circle className="pin__hit" cx="265.5" cy="323.8" r="21" />
                            <ellipse className="pin__shadow" cx="265.5" cy="329.8" rx="8" ry="3" />
                            <circle className="pin__ring" cx="265.5" cy="323.8" r="8" />
                            <circle className="pin__dot" cx="265.5" cy="323.8" r="6" />
                            <text className="pin__label" x="280.5" y="319.8">Metro Manila</text>
                          </g>
                          <g
                            className={`pin${cityKey === "baguio" ? " is-active" : ""}`}
                            data-pin="baguio"
                            role="button"
                            tabIndex={0}
                            aria-label="Baguio prices"
                            aria-pressed={cityKey === "baguio"}
                            onClick={() => setCityKey("baguio")}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCityKey("baguio"); }
                            }}
                          >
                            <circle className="pin__hit" cx="248.8" cy="243.3" r="12" />
                            <ellipse className="pin__shadow" cx="248.8" cy="249.3" rx="7" ry="2.5" />
                            <circle className="pin__ring" cx="248.8" cy="243.3" r="7" />
                            <circle className="pin__dot" cx="248.8" cy="243.3" r="5" />
                            <text className="pin__label" x="261.8" y="238.3">Baguio</text>
                          </g>
                          <g
                            className={`pin${cityKey === "pangasinan" ? " is-active" : ""}`}
                            data-pin="pangasinan"
                            role="button"
                            tabIndex={0}
                            aria-label="Pangasinan prices"
                            aria-pressed={cityKey === "pangasinan"}
                            onClick={() => setCityKey("pangasinan")}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCityKey("pangasinan"); }
                            }}
                          >
                            <circle className="pin__hit" cx="233.2" cy="260.4" r="12" />
                            <ellipse className="pin__shadow" cx="233.2" cy="266.4" rx="7" ry="2.5" />
                            <circle className="pin__ring" cx="233.2" cy="260.4" r="7" />
                            <circle className="pin__dot" cx="233.2" cy="260.4" r="5" />
                            <text className="pin__label" x="220.2" y="274.4" textAnchor="end">Pangasinan</text>
                          </g>
                          <g
                            className={`pin${cityKey === "vigan" ? " is-active" : ""}`}
                            data-pin="vigan"
                            role="button"
                            tabIndex={0}
                            aria-label="Vigan prices"
                            aria-pressed={cityKey === "vigan"}
                            onClick={() => setCityKey("vigan")}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCityKey("vigan"); }
                            }}
                          >
                            <circle className="pin__hit" cx="239.8" cy="190.6" r="22" />
                            <ellipse className="pin__shadow" cx="239.8" cy="196.6" rx="7" ry="2.5" />
                            <circle className="pin__ring" cx="239.8" cy="190.6" r="7" />
                            <circle className="pin__dot" cx="239.8" cy="190.6" r="5" />
                            <text className="pin__label" x="226.8" y="186.6" textAnchor="end">Vigan</text>
                          </g>
                          <g
                            className={`pin${cityKey === "tuguegarao" ? " is-active" : ""}`}
                            data-pin="tuguegarao"
                            role="button"
                            tabIndex={0}
                            aria-label="Tuguegarao prices"
                            aria-pressed={cityKey === "tuguegarao"}
                            onClick={() => setCityKey("tuguegarao")}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCityKey("tuguegarao"); }
                            }}
                          >
                            <circle className="pin__hit" cx="297.5" cy="188.9" r="22" />
                            <ellipse className="pin__shadow" cx="297.5" cy="194.9" rx="7" ry="2.5" />
                            <circle className="pin__ring" cx="297.5" cy="188.9" r="7" />
                            <circle className="pin__dot" cx="297.5" cy="188.9" r="5" />
                            <text className="pin__label" x="310.5" y="184.9">Tuguegarao</text>
                          </g>
                          <g
                            className={`pin${cityKey === "tarlac" ? " is-active" : ""}`}
                            data-pin="tarlac"
                            role="button"
                            tabIndex={0}
                            aria-label="Tarlac prices"
                            aria-pressed={cityKey === "tarlac"}
                            onClick={() => setCityKey("tarlac")}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCityKey("tarlac"); }
                            }}
                          >
                            <circle className="pin__hit" cx="248.9" cy="284.6" r="14" />
                            <ellipse className="pin__shadow" cx="248.9" cy="290.6" rx="7" ry="2.5" />
                            <circle className="pin__ring" cx="248.9" cy="284.6" r="7" />
                            <circle className="pin__dot" cx="248.9" cy="284.6" r="5" />
                            <text className="pin__label" x="261.9" y="288.6">Tarlac</text>
                          </g>
                          <g
                            className={`pin${cityKey === "zambales" ? " is-active" : ""}`}
                            data-pin="zambales"
                            role="button"
                            tabIndex={0}
                            aria-label="Zambales prices"
                            aria-pressed={cityKey === "zambales"}
                            onClick={() => setCityKey("zambales")}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCityKey("zambales"); }
                            }}
                          >
                            <circle className="pin__hit" cx="222.3" cy="291.4" r="14" />
                            <ellipse className="pin__shadow" cx="222.3" cy="297.4" rx="7" ry="2.5" />
                            <circle className="pin__ring" cx="222.3" cy="291.4" r="7" />
                            <circle className="pin__dot" cx="222.3" cy="291.4" r="5" />
                            <text className="pin__label" x="209.3" y="295.4" textAnchor="end">Zambales</text>
                          </g>
                          <g
                            className={`pin${cityKey === "naga" ? " is-active" : ""}`}
                            data-pin="naga"
                            role="button"
                            tabIndex={0}
                            aria-label="Naga prices"
                            aria-pressed={cityKey === "naga"}
                            onClick={() => setCityKey("naga")}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setCityKey("naga"); }
                            }}
                          >
                            <circle className="pin__hit" cx="360.6" cy="367.1" r="22" />
                            <ellipse className="pin__shadow" cx="360.6" cy="373.1" rx="7" ry="2.5" />
                            <circle className="pin__ring" cx="360.6" cy="367.1" r="7" />
                            <circle className="pin__dot" cx="360.6" cy="367.1" r="5" />
                            <text className="pin__label" x="374.6" y="363.1">Naga</text>
                          </g>
                        </g>
                      </svg>

            <PriceCard k="Rice" v={`₱${city.rice}`} unit="/kg" pos="rice" />
            <PriceCard k="Eggs" v={`₱${city.eggs}`} unit=" each" pos="eggs" />
            <PriceCard k="Chicken" v={`₱${city.chicken}`} unit="/kg" pos="meat" />
            <div className="price-card price-card--veg">
              <span className="price-card__meta"><span className="live" /> Vegetables</span>
              <span className="price-card__k">Updated {city.updated} mins ago</span>
            </div>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <p className="eyebrow text-ink-faint">Price intelligence</p>
          <h2 className="mt-2 text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-ink">
            Prices that know <span className="text-[#6a9c1f]">where you shop</span>
          </h2>
          <p className="mt-4 max-w-[46ch] text-[clamp(1rem,1.3vw,1.15rem)] font-medium text-ink-soft">
            A kilo of rice isn&rsquo;t one price. Zebite&rsquo;s budgets ride on
            prices submitted by people shopping where you shop — so your list matches your palengke.
          </p>

          <ul className="mt-7 space-y-5">
            <Feature title="Community-powered pricing" body="Anonymized and pooled. No names, no receipts — just the price and the place." icon="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" />
            <Feature title="Sharper with every submission" body="Confidence climbs as prices come in, and stale ones quietly age out." icon="M3 3v18h18 M18.7 8 12 14.7 8.7 11.4 3 17.1" />
            <Feature title="Local, not national" body="Luzon first, widening as coverage grows — a national average is nobody's actual grocery bill." icon="M12 21s-7-6.4-7-11.5A7 7 0 0 1 19 9.5C19 14.6 12 21 12 21Z M12 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          </ul>

          <div className="confidence">
            <div className="confidence__top">
              <div>
                <span className="confidence__label">Price confidence</span>
                <span className="confidence__place">{city.name}</span>
              </div>
              <span className="confidence__pct">{city.conf}%</span>
            </div>
            <span className="confidence__bar"><span className="confidence__fill" style={{ width: `${city.conf}%` }} /></span>
            <div className="confidence__foot">
              <span className="contribs"><span>J</span><span>C</span><span>A</span></span>
              Based on <b>{city.n.toLocaleString("en-US")}</b> community submissions nearby
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PriceCard({ k, v, unit, pos }: { k: string; v: string; unit: string; pos: string }) {
  return (
    <div className={`price-card price-card--${pos}`}>
      <span className="price-card__k">{k}</span>
      <span className="price-card__v">{v}<small>{unit}</small></span>
    </div>
  );
}

function Feature({ title, body, icon }: { title: string; body: string; icon: string }) {
  return (
    <li className="flex gap-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card bg-lime/15 text-forest-900">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={icon} />
        </svg>
      </span>
      <div>
        <b className="block text-[0.95rem] font-extrabold text-ink">{title}</b>
        <span className="mt-0.5 block text-sm text-ink-soft">{body}</span>
      </div>
    </li>
  );
}
