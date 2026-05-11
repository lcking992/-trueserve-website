"use client";

interface Props {
  temperature: number;
  condition: string;
  locationLabel?: string;
}

function getConditionKey(condition: string): "clear" | "rain" | "snow" | "clouds" | "storm" | "mist" {
  const c = condition.toLowerCase();
  if (c.includes("thunder") || c.includes("storm")) return "storm";
  if (c.includes("snow") || c.includes("sleet") || c.includes("hail") || c.includes("flurr")) return "snow";
  if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) return "rain";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze") || c.includes("smoke")) return "mist";
  if (c.includes("cloud") || c.includes("overcast") || c.includes("partly")) return "clouds";
  return "clear";
}

const CONDITION_EMOJI: Record<string, string> = {
  clear: "☀️",
  rain: "Rain",
  snow: "❄️",
  clouds: "☁️",
  storm: "⛈️",
  mist: "Mist",
};

export default function WeatherCard({ temperature, condition, locationLabel }: Props) {
  const key = getConditionKey(condition);
  const emoji = CONDITION_EMOJI[key];

  // Colour tint per condition
  const tint =
    key === "clear"  ? { glow: "rgba(251,191,36,0.18)", border: "rgba(251,191,36,0.25)", text: "#fbbf24" } :
    key === "rain"   ? { glow: "rgba(96,165,250,0.15)", border: "rgba(96,165,250,0.22)", text: "#60a5fa" } :
    key === "snow"   ? { glow: "rgba(186,230,253,0.18)", border: "rgba(186,230,253,0.25)", text: "#bae6fd" } :
    key === "storm"  ? { glow: "rgba(167,139,250,0.18)", border: "rgba(167,139,250,0.3)", text: "#a78bfa" } :
    key === "mist"   ? { glow: "rgba(148,163,184,0.15)", border: "rgba(148,163,184,0.2)", text: "#94a3b8" } :
    /* clouds */       { glow: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.18)", text: "#94a3b8" };

  return (
    <div className="dd-weather-card" style={{
      position: "relative",
      overflow: "hidden",
      background: "#141a18",
      border: `1px solid ${tint.border}`,
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wc-sun-spin   { to { transform: rotate(360deg); } }
        @keyframes wc-ray-pulse  { 0%,100% { opacity:.45; } 50% { opacity:.7; } }
        @keyframes wc-rain-fall  { from { transform: translateY(-20px); opacity:.7; } to { transform: translateY(72px); opacity:0; } }
        @keyframes wc-snow-fall  { from { transform: translateY(-16px) rotate(0deg); opacity:.8; } to { transform: translateY(72px) rotate(180deg); opacity:0; } }
        @keyframes wc-blob-drift { 0%,100% { transform: translateX(0) scaleX(1); } 50% { transform: translateX(12px) scaleX(1.08); } }
        @keyframes wc-flash      { 0%,92%,100% { opacity:0; } 94%,98% { opacity:.55; } }
        @keyframes wc-mist-drift { 0%,100% { transform: translateX(-8px); opacity:.18; } 50% { transform: translateX(8px); opacity:.32; } }
        @keyframes wc-glow-pulse { 0%,100% { opacity:.55; } 50% { opacity:.85; } }
      ` }} />

      {/* ── Condition background animation ── */}
      <div aria-hidden style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>

        {/* CLEAR — rotating sun behind temp */}
        {key === "clear" && (
          <>
            {/* Glow disc */}
            <div style={{
              position:"absolute", right:60, top:"50%", transform:"translateY(-50%)",
              width:80, height:80, borderRadius:"50%",
              background:"radial-gradient(circle, rgba(251,191,36,0.22) 0%, transparent 70%)",
              animation:"wc-glow-pulse 2.4s ease-in-out infinite",
            }}/>
            {/* Rays */}
            <div style={{
              position:"absolute", right:76, top:"50%",
              width:48, height:48,
              transform:"translate(50%,-50%)",
              animation:"wc-sun-spin 12s linear infinite",
            }}>
              {[...Array(8)].map((_,i) => (
                <div key={i} style={{
                  position:"absolute", left:"50%", top:"50%",
                  width:2, height:20,
                  marginLeft:-1, marginTop:-10,
                  background:"rgba(251,191,36,0.5)",
                  borderRadius:2,
                  transformOrigin:"50% 50%",
                  transform:`rotate(${i*45}deg) translateY(-18px)`,
                  animation:`wc-ray-pulse ${1.6 + i*0.15}s ease-in-out infinite`,
                }}/>
              ))}
            </div>
          </>
        )}

        {/* RAIN — falling drops */}
        {(key === "rain") && (
          <>
            {[...Array(14)].map((_,i) => (
              <div key={i} style={{
                position:"absolute",
                left:`${6 + i*7}%`,
                top:0,
                width:1.5,
                height:10,
                borderRadius:2,
                background:"rgba(96,165,250,0.55)",
                animation:`wc-rain-fall ${0.7 + (i%4)*0.18}s linear ${i*0.09}s infinite`,
              }}/>
            ))}
          </>
        )}

        {/* STORM — purple flash + rain */}
        {key === "storm" && (
          <>
            <div style={{
              position:"absolute", inset:0,
              background:"rgba(167,139,250,0.12)",
              animation:"wc-flash 3.8s ease-in-out infinite",
            }}/>
            {[...Array(10)].map((_,i) => (
              <div key={i} style={{
                position:"absolute",
                left:`${4 + i*10}%`,
                top:0,
                width:1.5, height:10,
                borderRadius:2,
                background:"rgba(167,139,250,0.5)",
                animation:`wc-rain-fall ${0.65 + (i%3)*0.2}s linear ${i*0.07}s infinite`,
              }}/>
            ))}
          </>
        )}

        {/* SNOW — drifting flakes */}
        {key === "snow" && (
          <>
            {[...Array(12)].map((_,i) => (
              <div key={i} style={{
                position:"absolute",
                left:`${4 + i*8}%`,
                top:0,
                fontSize: i%3===0 ? 10 : 7,
                opacity:0.7,
                animation:`wc-snow-fall ${1.1 + (i%4)*0.22}s linear ${i*0.11}s infinite`,
                color:"#bae6fd",
                userSelect:"none",
              }}>❄</div>
            ))}
          </>
        )}

        {/* CLOUDS — drifting blobs */}
        {key === "clouds" && (
          <>
            {[
              { w:90, h:28, r:14, top:"20%", left:"30%", delay:"0s", dur:"7s" },
              { w:60, h:20, r:10, top:"55%", left:"55%", delay:"2s", dur:"9s" },
            ].map((c,i) => (
              <div key={i} style={{
                position:"absolute",
                top:c.top, left:c.left,
                width:c.w, height:c.h,
                borderRadius:c.r,
                background:"rgba(148,163,184,0.13)",
                animation:`wc-blob-drift ${c.dur} ease-in-out ${c.delay} infinite`,
              }}/>
            ))}
          </>
        )}

        {/* MIST — drifting horizontal bands */}
        {key === "mist" && (
          <>
            {[
              { top:"25%", delay:"0s" },
              { top:"55%", delay:"1.8s" },
              { top:"75%", delay:"3.2s" },
            ].map((m,i) => (
              <div key={i} style={{
                position:"absolute",
                top:m.top, left:0, right:0,
                height:6,
                borderRadius:4,
                background:"rgba(148,163,184,0.22)",
                animation:`wc-mist-drift 5s ease-in-out ${m.delay} infinite`,
              }}/>
            ))}
          </>
        )}

        {/* Subtle edge glow on all */}
        <div style={{
          position:"absolute", inset:0,
          background:`radial-gradient(ellipse at 85% 50%, ${tint.glow} 0%, transparent 65%)`,
          pointerEvents:"none",
        }}/>
      </div>

      {/* ── Content ── */}
      <div style={{ position:"relative", zIndex:1 }}>
        <div className="dd-weather-label">Weather</div>
        <div className="dd-weather-temp" style={{ color: tint.text }}>
          {temperature}°F
        </div>
      </div>

      <div style={{ position:"relative", zIndex:1, textAlign:"right" }}>
        <div style={{ fontSize:22, lineHeight:1, marginBottom:4 }}>{emoji}</div>
        <div style={{ fontSize:11, color:"#666" }}>{condition}</div>
        {locationLabel && (
          <div style={{ marginTop:3, fontSize:10, color:"#3a3a3a" }}>{locationLabel}</div>
        )}
      </div>
    </div>
  );
}
