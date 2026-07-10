import Link from "next/link";
import type { CSSProperties } from "react";

/**
 * The Lab — three doors. Same six apps, same story, three completely
 * different ways to walk through them. Pick the one that pulls; that's
 * the direction we deepen.
 */
export default function LabPage() {
  return (
    <div className="lab-home">
      <header className="lab-home-head">
        <p className="lab-eyebrow">ankit anand · the lab</p>
        <h1>Three ways into the same story.</h1>
        <p>
          Six shipped apps. One arc — poker player to AI builder. Below are
          three immersive experiments that present it: a card table, a night
          street, a planetary system. Same content in all three; only the
          world changes.
        </p>
        <p className="whisper">Walk each door. Notice which one you don&rsquo;t want to leave.</p>
      </header>

      <nav className="doors" aria-label="The three experiments">
        <Link href="/lab/deal" className="door" style={{ "--door-glow": "#3ddc97" } as CSSProperties}>
          <div className="door-viz viz-deal" aria-hidden>
            <div className="mini-card">
              <div className="mc-face mc-back">AA</div>
              <div className="mc-face mc-front">♠</div>
            </div>
          </div>
          <div className="door-copy">
            <span className="door-num">EXPERIMENT 01</span>
            <h2>The Deal</h2>
            <p className="door-log">
              A noir card room. The story arrives as a dealer&rsquo;s monologue,
              six apps are dealt as a hand, and contact waits on the river.
              Intimate, tactile, close to the felt.
            </p>
            <span className="door-enter">
              take a seat <span>→</span>
            </span>
          </div>
        </Link>

        <Link href="/lab/city" className="door" style={{ "--door-glow": "#ff6ec7" } as CSSProperties}>
          <div className="door-viz viz-strip" aria-hidden>
            <div className="sky-b" style={{ left: "6%", width: "16%", height: "58%" }}><i /></div>
            <div className="sky-b" style={{ left: "25%", width: "13%", height: "80%" }}><i /></div>
            <div className="sky-b" style={{ left: "41%", width: "18%", height: "46%" }}><i /></div>
            <div className="sky-b" style={{ left: "62%", width: "14%", height: "70%" }}><i /></div>
            <div className="sky-b" style={{ left: "79%", width: "15%", height: "56%" }}><i /></div>
            <span className="neon">THE STRIP</span>
          </div>
          <div className="door-copy">
            <span className="door-num">EXPERIMENT 02</span>
            <h2>The Strip</h2>
            <p className="door-log">
              A city built one app at a time. You walk a neon street by
              scrolling — every building is something shipped, and the road
              ends looking up at what isn&rsquo;t built yet.
            </p>
            <span className="door-enter">
              walk the street <span>→</span>
            </span>
          </div>
        </Link>

        <Link href="/lab/orbit" className="door" style={{ "--door-glow": "#8fb8ff" } as CSSProperties}>
          <div className="door-viz viz-orbit" aria-hidden>
            <div className="orb-ring r1">
              <span className="planet" style={{ background: "#f5b950", boxShadow: "0 0 10px #f5b950" }} />
            </div>
            <div className="orb-ring r2">
              <span className="planet" style={{ background: "#38bdf8", boxShadow: "0 0 10px #38bdf8" }} />
            </div>
            <div className="sun" />
          </div>
          <div className="door-copy">
            <span className="door-num">EXPERIMENT 03</span>
            <h2>The Orbit</h2>
            <p className="door-log">
              First-person flight through the builder&rsquo;s system: the story
              is the sun, six apps are worlds with their own weather, and
              gravity decides where you land. The most game-like of the three.
            </p>
            <span className="door-enter">
              begin the flight <span>→</span>
            </span>
          </div>
        </Link>
      </nav>

      <footer className="lab-home-foot">
        The classic site is untouched at <Link href="/">ankitanand.com</Link> — these are
        candidate futures, not replacements. Yet.
      </footer>
    </div>
  );
}
