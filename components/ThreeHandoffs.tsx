"use client";

export default function ThreeHandoffs() {
  return (
    <section className="three-handoffs">
      <style>{`
        .three-handoffs {
          padding: 96px 20px;
          text-align: center;
          color: #f5f1e8;
        }
        .three-handoffs .eyebrow {
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 14px;
          font-weight: 500;
        }
        .three-handoffs .title {
          font-size: clamp(28px, 5vw, 40px);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 16px;
          line-height: 1.05;
        }
        .three-handoffs .lede {
          font-size: 16px;
          color: #b8b0a0;
          line-height: 1.55;
          max-width: 540px;
          margin: 0 auto 56px;
        }
        .three-handoffs .anim-wrap {
          width: 100%;
          aspect-ratio: 800 / 240;
          max-width: 800px;
          margin: 0 auto;
        }
        .three-handoffs .line { stroke: rgba(255,255,255,0.08); stroke-width: 1; fill: none; }
        .three-handoffs .node-ring { fill: rgba(255,122,0,0.04); stroke: rgba(255,122,0,0.35); stroke-width: 1; }
        .three-handoffs .ripple { fill: none; stroke: rgba(255,122,0,0.6); stroke-width: 1; opacity: 0; }
        .three-handoffs .icon { fill: none; stroke: #ff7a00; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
        .three-handoffs .icon-fill { fill: #ff7a00; }
        .three-handoffs .step-num { font-size: 11px; letter-spacing: 0.2em; fill: #888; font-weight: 600; text-anchor: middle; }
        .three-handoffs .node-label { font-size: 14px; fill: #f5f1e8; font-weight: 600; text-anchor: middle; }
        .three-handoffs .node-detail { font-size: 11px; fill: #888; text-anchor: middle; }
        .three-handoffs .pulse { fill: #ff7a00; filter: drop-shadow(0 0 8px rgba(255,122,0,0.8)); }

        @keyframes th-pulse-flow {
          0%   { offset-distance: 0%; opacity: 0; }
          3%   { opacity: 1; }
          97%  { opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        .th-pulse-mover {
          offset-path: path('M 120,120 L 400,120 L 680,120');
          animation: th-pulse-flow 8s linear infinite;
        }

        @keyframes th-glow-address { 0%,8%,100% { stroke: rgba(255,122,0,0.35); stroke-width: 1; } 3% { stroke: rgba(255,122,0,1); stroke-width: 2; } }
        @keyframes th-glow-order   { 0%,45%,55%,100% { stroke: rgba(255,122,0,0.35); stroke-width: 1; } 50% { stroke: rgba(255,122,0,1); stroke-width: 2; } }
        @keyframes th-glow-track   { 0%,92%,100% { stroke: rgba(255,122,0,0.35); stroke-width: 1; } 97% { stroke: rgba(255,122,0,1); stroke-width: 2; } }
        .th-node-address .node-ring { animation: th-glow-address 8s ease-in-out infinite; }
        .th-node-order   .node-ring { animation: th-glow-order   8s ease-in-out infinite; }
        .th-node-track   .node-ring { animation: th-glow-track   8s ease-in-out infinite; }

        @keyframes th-ripple-address { 0%,8%,100% { r: 32; opacity: 0; } 1% { opacity: 0.7; r: 32; } 7% { opacity: 0; r: 64; } }
        @keyframes th-ripple-order   { 0%,45%,55%,100% { r: 32; opacity: 0; } 48% { opacity: 0.7; r: 32; } 54% { opacity: 0; r: 64; } }
        @keyframes th-ripple-track   { 0%,92%,100% { r: 32; opacity: 0; } 95% { opacity: 0.7; r: 32; } 99% { opacity: 0; r: 64; } }
        .th-node-address .ripple { animation: th-ripple-address 8s ease-out infinite; }
        .th-node-order   .ripple { animation: th-ripple-order   8s ease-out infinite; }
        .th-node-track   .ripple { animation: th-ripple-track   8s ease-out infinite; }
      `}</style>

      <div className="eyebrow">From hungry to delivered</div>
      <h2 className="title">Three handoffs. No noisy detours.</h2>
      <p className="lede">Drop your address, order direct, and track every handoff in one calm flow.</p>

      <div className="anim-wrap">
        <svg viewBox="0 0 800 240" role="img" aria-label="Order journey from address to checkout to delivery tracking">
          <line className="line" x1="120" y1="120" x2="400" y2="120" />
          <line className="line" x1="400" y1="120" x2="680" y2="120" />

          <g className="th-node-address" transform="translate(120, 120)">
            <circle className="ripple" />
            <circle className="node-ring" r="32" />
            <g className="icon" transform="translate(-7, -8)">
              <path d="M 7,0 C 3,0 0,3 0,7 C 0,11 7,16 7,16 C 7,16 14,11 14,7 C 14,3 11,0 7,0 Z" />
              <circle cx="7" cy="7" r="2.5" />
            </g>
            <text className="step-num" y="-46">01</text>
            <text className="node-label" y="56">Address</text>
            <text className="node-detail" y="74">Drop your location</text>
          </g>

          <g className="th-node-order" transform="translate(400, 120)">
            <circle className="ripple" />
            <circle className="node-ring" r="32" />
            <g className="icon" transform="translate(-8, -9)">
              <path d="M 2,5 L 14,5 L 14,18 L 2,18 Z" />
              <path d="M 5,5 L 5,3 C 5,1.5 6.5,0 8,0 C 9.5,0 11,1.5 11,3 L 11,5" />
            </g>
            <text className="step-num" y="-46">02</text>
            <text className="node-label" y="56">Order</text>
            <text className="node-detail" y="74">Direct &amp; transparent</text>
          </g>

          <g className="th-node-track" transform="translate(680, 120)">
            <circle className="ripple" />
            <circle className="node-ring" r="32" />
            <circle className="icon" r="9" />
            <circle className="icon-fill" r="3" />
            <text className="step-num" y="-46">03</text>
            <text className="node-label" y="56">Track</text>
            <text className="node-detail" y="74">Each handoff</text>
          </g>

          <circle className="pulse th-pulse-mover" r="5" cx="0" cy="0" />
        </svg>
      </div>
    </section>
  );
}
