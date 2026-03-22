import { useState, useEffect, useRef } from "react";
import { DRIVER_TEAMS_BY_YEAR, DRIVER_COLORS_BY_YEAR } from '../constants/driverData'
import { API } from '../config'
import { useNavigate } from "react-router-dom";

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function AnimatedCounter({ end, duration = 2000, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = () => {
          const p = Math.min((performance.now() - t0) / duration, 1);
          setVal(Math.floor(p * end));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

function GridCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame;
    let t = 0;
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      t += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gap = 60;
      ctx.strokeStyle = "rgba(225,6,0,0.04)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < canvas.width; x += gap) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gap) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      const pulseY = (Math.sin(t) * 0.5 + 0.5) * canvas.height;
      const grad = ctx.createLinearGradient(0, pulseY - 40, 0, pulseY + 40);
      grad.addColorStop(0, "rgba(225,6,0,0)");
      grad.addColorStop(0.5, "rgba(225,6,0,0.12)");
      grad.addColorStop(1, "rgba(225,6,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, pulseY - 40, canvas.width, 80);
      frame = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

function SpeedLines() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame;
    const lines = Array.from({ length: 18 }, (_, i) => ({
      y: (i / 18) * window.innerHeight + Math.random() * 60,
      speed: Math.random() * 4 + 2,
      width: Math.random() * 120 + 40,
      opacity: Math.random() * 0.06 + 0.02,
      x: Math.random() * window.innerWidth,
    }));
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      lines.forEach(l => {
        l.x += l.speed;
        if (l.x > canvas.width + l.width) l.x = -l.width;
        const grad = ctx.createLinearGradient(l.x - l.width, 0, l.x, 0);
        grad.addColorStop(0, `rgba(225,6,0,0)`);
        grad.addColorStop(1, `rgba(225,6,0,${l.opacity})`);
        ctx.fillStyle = grad;
        ctx.fillRect(l.x - l.width, l.y, l.width, 1);
      });
      frame = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let frame;
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.4 + 0.1,
    }));
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(225,6,0,${p.opacity})`;
        ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}



function TeamsStrip({ visible }) {
  const teams = DRIVER_TEAMS_BY_YEAR['2026']
  const colors = DRIVER_COLORS_BY_YEAR['2026']

  const teamGroups = {}
  Object.entries(teams).forEach(([code, team]) => {
    if (!teamGroups[team]) teamGroups[team] = { color: colors[code] || '#888', drivers: [] }
    if (teamGroups[team].drivers.length < 2) teamGroups[team].drivers.push(code)
  })

  return (
    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
      {Object.entries(teamGroups).map(([team, { color, drivers }], i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: "8px",
          background: color + "10", border: `0.5px solid ${color}33`,
          borderRadius: "8px", padding: "8px 14px", transition: "all 0.2s",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(10px)",
          transitionDelay: `${i * 40}ms`,
        }}
          onMouseEnter={e => { e.currentTarget.style.background = color + "25"; e.currentTarget.style.borderColor = color + "88" }}
          onMouseLeave={e => { e.currentTarget.style.background = color + "10"; e.currentTarget.style.borderColor = color + "33" }}
        >
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: color, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: "#fff" }}>{team}</div>
            <div style={{ fontSize: "9px", color: "#444", marginTop: "1px" }}>{drivers.join(' · ')}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Next race countdown
const NEXT_RACES = [
  { name: "Japanese Grand Prix", location: "Suzuka", date: "2026-04-05", flag: "🇯🇵" },
  { name: "Bahrain Grand Prix", location: "Sakhir", date: "2026-04-19", flag: "🇧🇭" },
];

function NextRaceCard({ visible }) {
  const [timeLeft, setTimeLeft] = useState({});
  const next = NEXT_RACES[0];

  useEffect(() => {
    function calc() {
      const diff = new Date(next.date) - new Date();
      if (diff <= 0) { setTimeLeft({ done: true }); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ d, h, m, s });
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      background: "rgba(225,6,0,0.04)",
      border: "1px solid rgba(225,6,0,0.15)",
      borderRadius: "16px",
      padding: "24px 28px",
      maxWidth: "600px",
      margin: "0 auto",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(225,6,0,0.4), transparent)"
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "10px", color: "#e10600", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "8px", fontFamily: "'Space Mono', monospace" }}>Next Race</div>
          <div style={{ fontSize: "18px", fontWeight: "800", marginBottom: "4px" }}>
            {next.flag} {next.name}
          </div>
          <div style={{ fontSize: "12px", color: "#555" }}>{next.location} · {new Date(next.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {[
            { val: timeLeft.d, label: "Days" },
            { val: timeLeft.h, label: "Hrs" },
            { val: timeLeft.m, label: "Min" },
            { val: timeLeft.s, label: "Sec" },
          ].map((t, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{
                background: "rgba(225,6,0,0.1)",
                border: "0.5px solid rgba(225,6,0,0.2)",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "22px",
                fontWeight: "900",
                fontFamily: "'Space Mono', monospace",
                color: "#fff",
                minWidth: "52px",
              }}>
                {String(t.val ?? 0).padStart(2, "0")}
              </div>
              <div style={{ fontSize: "9px", color: "#444", marginTop: "4px", textTransform: "uppercase", letterSpacing: "1px" }}>{t.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, color, delay, visible }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: hovered ? `linear-gradient(135deg, ${color}08, ${color}04)` : "rgba(255,255,255,0.02)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${hovered ? color + "44" : "rgba(255,255,255,0.06)"}`,
        borderRadius: "16px",
        padding: "28px 24px",
        cursor: "default",
        transition: "all 0.4s cubic-bezier(0.16,1,0.3,1)",
        transform: visible ? (hovered ? "translateY(-6px)" : "translateY(0)") : "translateY(40px)",
        opacity: visible ? 1 : 0,
        transitionDelay: `${delay}ms`,
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", top: "-50%", left: "-50%",
        width: "200%", height: "200%",
        background: `radial-gradient(circle at 50% 50%, ${color}08, transparent 70%)`,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.4s",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
        background: `linear-gradient(90deg, transparent, ${color}${hovered ? "66" : "22"}, transparent)`,
        transition: "all 0.4s",
      }} />
      <div style={{
        fontSize: "28px", marginBottom: "14px",
        filter: hovered ? `drop-shadow(0 0 8px ${color}66)` : "none",
        transition: "filter 0.3s",
      }}>{icon}</div>
      <div style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: "15px", fontWeight: 700, marginBottom: "8px",
        color: hovered ? color : "#fff",
        transition: "color 0.3s",
        letterSpacing: "-0.01em",
      }}>{title}</div>
      <div style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: "13px", color: "rgba(255,255,255,0.4)",
        lineHeight: 1.7,
      }}>{desc}</div>
      <div style={{
        position: "absolute", bottom: "12px", right: "12px",
        width: "20px", height: "20px",
        borderRight: `1.5px solid ${color}${hovered ? "44" : "11"}`,
        borderBottom: `1.5px solid ${color}${hovered ? "44" : "11"}`,
        transition: "all 0.3s",
      }} />
    </div>
  );
}

function StatItem({ value, label, delay, visible }) {
  return (
    <div style={{
      textAlign: "center",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(30px)",
      transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
      transitionDelay: `${delay}ms`,
    }}>
      <div style={{
        fontFamily: "'Space Mono', monospace",
        fontSize: "28px", fontWeight: 700, color: "#fff",
        letterSpacing: "-0.02em",
      }}>{value}</div>
      <div style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: "11px", color: "rgba(255,255,255,0.3)",
        marginTop: "6px", textTransform: "uppercase",
        letterSpacing: "1.5px",
      }}>{label}</div>
    </div>
  );
}

function Tag({ text }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "5px 14px", borderRadius: "100px",
      fontSize: "12px", color: "rgba(255,255,255,0.35)",
      fontFamily: "'Outfit', sans-serif",
      letterSpacing: "0.01em",
    }}>{text}</div>
  );
}


function LatestResultBanner() {
  const [result, setResult] = useState(null)

  useEffect(() => {
    fetch(`${API}/standings/drivers?year=2026`)
      .then(r => r.json())
      .then(data => {
        if (data.standings) setResult(data)
      })
      .catch(() => {})
  }, [])

  const COLORS = {
    RUS: '#00d2be', ANT: '#00d2be', NOR: '#ff8000', PIA: '#ff8000',
    LEC: '#e8002d', HAM: '#e8002d', VER: '#3671c6', HAD: '#3671c6',
    ALB: '#005aff', SAI: '#005aff', ALO: '#52e252', STR: '#52e252',
  }

  if (!result) return null

  const top3 = result.standings.slice(0, 3)

  return (
    <div style={{
      position: 'relative', zIndex: 2,
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(10px)',
      borderBottom: '0.5px solid rgba(255,255,255,0.04)',
      padding: '8px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '32px',
      marginTop: '64px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#e10600', animation: 'pulse 2s infinite' }} />
        <span style={{
          fontSize: '9px', color: '#e10600',
          fontFamily: "'Space Mono', monospace",
          letterSpacing: '2px', textTransform: 'uppercase',
        }}>2026 Championship</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {top3.map((d, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            <span style={{
              fontSize: '9px', color: '#333',
              fontFamily: "'Space Mono', monospace",
            }}>P{d.position}</span>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: (COLORS[d.code] || '#888') + '20',
              border: `1.5px solid ${COLORS[d.code] || '#888'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '7px', fontWeight: '900',
              color: COLORS[d.code] || '#888',
            }}>{d.code}</div>
            <span style={{
              fontSize: '11px', fontWeight: '700',
              color: i === 0 ? '#fff' : '#555',
              fontFamily: "'Space Mono', monospace",
            }}>{Math.round(d.points)}<span style={{ fontSize: '8px', color: '#333', marginLeft: '2px' }}>pts</span></span>
          </div>
        ))}
      </div>

      <div style={{
        fontSize: '9px', color: '#333',
        fontFamily: "'Space Mono', monospace",
        letterSpacing: '1px',
      }}>After Round {result.round}</div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate();
  const [heroRef, heroVisible] = useInView(0.1);
  const [featRef, featVisible] = useInView(0.1);
  const [statRef, statVisible] = useInView(0.2);
  const [ctaRef, ctaVisible] = useInView(0.2);
  const [previewRef, previewVisible] = useInView(0.1);
  const [teamsRef, teamsVisible] = useInView(0.1);
  const [nextRaceRef, nextRaceVisible] = useInView(0.1);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolledPast(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const features = [
    { icon: "🏎️", title: "Race Replay", desc: "Position battles, lap times, tire strategy and sector data for every race since 2018. Watch the race unfold lap by lap.", color: "#3671c6" },
    { icon: "⚔️", title: "Head to Head", desc: "Settle the debate. Compare any two drivers across a full season — points, wins, poles, qualifying and race pace.", color: "#e10600" },
    { icon: "🤖", title: "AI Race Engineer", desc: "Ask anything about any race. Our AI analyst reads the actual telemetry and gives you real, specific answers.", color: "#52e252" },
    { icon: "📊", title: "Gap Analysis", desc: "See exactly when gaps opened up, when the safety car bunched the field, and who had the pace when it mattered.", color: "#ff8000" },
    { icon: "🔄", title: "Tire Strategy", desc: "Visual breakdown of every stint — compound, duration, degradation. See who nailed the strategy call.", color: "#f5c842" },
    { icon: "⚡", title: "Sector Times", desc: "Drill into S1, S2, S3 pace. Find out exactly where your driver was flying — or losing time.", color: "#00d2be" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#050505",
      color: "#fff",
      fontFamily: "'Outfit', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-10px); } }
        @keyframes glowPulse { 0%,100% { box-shadow:0 0 20px rgba(225,6,0,0.2),0 0 60px rgba(225,6,0,0.1); } 50% { box-shadow:0 0 30px rgba(225,6,0,0.4),0 0 80px rgba(225,6,0,0.15); } }
        @keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
        @keyframes scanline { 0% { top:-10%; } 100% { top:110%; } }
        @keyframes drawLine { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
        * { box-sizing:border-box; }
        ::selection { background:rgba(225,6,0,0.3); color:#fff; }
        html { scroll-behavior:smooth; }
        .cta-primary { position:relative; overflow:hidden; transition: all 0.2s; }
        .cta-primary::after { content:''; position:absolute; top:50%; left:50%; width:300%; height:300%; background:radial-gradient(circle,rgba(255,255,255,0.15),transparent 60%); transform:translate(-50%,-50%) scale(0); transition:transform 0.5s; border-radius:50%; }
        .cta-primary:hover::after { transform:translate(-50%,-50%) scale(1); }
        .cta-primary:hover { transform: scale(1.03); }
        .nav-link { position:relative; }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1px; background:#e10600; transition:width 0.3s; }
        .nav-link:hover::after { width:100%; }
      `}</style>

      <GridCanvas />
      <SpeedLines />      

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 40px", height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolledPast ? "rgba(5,5,5,0.9)" : "transparent",
        backdropFilter: scrolledPast ? "blur(20px)" : "none",
        WebkitBackdropFilter: scrolledPast ? "blur(20px)" : "none",
        borderBottom: scrolledPast ? "1px solid rgba(255,255,255,0.05)" : "1px solid transparent",
        transition: "all 0.4s",
      }}>
        <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
          <div style={{
            width: "34px", height: "34px",
            background: "linear-gradient(135deg, #e10600, #b30500)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700, fontSize: "12px", color: "#fff",
            boxShadow: "0 0 20px rgba(225,6,0,0.3)",
          }}>PW</div>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.02em" }}>PitWall</div>
            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", letterSpacing: "2px", textTransform: "uppercase" }}>Race Intelligence</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "28px", alignItems: "center" }}>
          {[
            { label: "Race Replay", path: "/replay" },
            { label: "Head to Head", path: "/h2h" },
            { label: "Drivers", path: "/drivers" },
            { label: "Calendar", path: "/calendar" },
            { label: "Support", path: "/support" },
          ].map(({ label, path }) => (
            <a key={label} className="nav-link" onClick={() => navigate(path)}
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "13px", color: "rgba(255,255,255,0.5)",
                textDecoration: "none", cursor: "pointer",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => e.target.style.color = "#fff"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
            >{label}</a>
          ))}
          <button onClick={() => navigate("/replay")} style={{
            background: "linear-gradient(135deg, #e10600, #c00500)",
            border: "none", color: "#fff",
            padding: "8px 20px", borderRadius: "8px",
            fontSize: "13px", fontWeight: 600, cursor: "pointer",
            boxShadow: "0 0 20px rgba(225,6,0,0.3)",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >Launch app</button>
        </div>
      </nav>

      <LatestResultBanner />


      {/* HERO */}
      <section ref={heroRef} style={{
        position: "relative",
        minHeight: "92vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 40px 80px",
        textAlign: "center",
      }}>
        <Particles />
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "700px", height: "500px",
          background: "radial-gradient(ellipse, rgba(225,6,0,0.08), transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Live badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          background: "rgba(225,6,0,0.08)",
          border: "1px solid rgba(225,6,0,0.2)",
          padding: "6px 18px", borderRadius: "100px",
          marginBottom: "32px",
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
          position: "relative", zIndex: 1,
        }}>
          <div style={{
            width: "6px", height: "6px", borderRadius: "50%",
            background: "#e10600",
            boxShadow: "0 0 8px rgba(225,6,0,0.8)",
            animation: "pulse 2s infinite",
          }} />
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: "10px", color: "#e10600",
            letterSpacing: "2px", textTransform: "uppercase",
          }}>2026 Season Live</span>
        </div>

        {/* Heading */}
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "clamp(42px, 6vw, 76px)",
          fontWeight: 900, lineHeight: 1.05,
          letterSpacing: "-0.03em",
          marginBottom: "24px",
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s",
          position: "relative", zIndex: 1,
        }}>
          The F1 data tool
          <br />
          <span style={{
            background: "linear-gradient(135deg, #e10600, #ff4040)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>fans actually want</span>
        </h1>

        <div style={{
          width: heroVisible ? "80px" : "0px",
          height: "3px",
          background: "linear-gradient(90deg, #e10600, #ff4040)",
          borderRadius: "2px",
          margin: "0 auto 28px",
          transition: "width 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s",
          boxShadow: "0 0 20px rgba(225,6,0,0.5)",
          position: "relative", zIndex: 1,
        }} />

        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "17px", fontWeight: 300,
          color: "rgba(255,255,255,0.45)",
          lineHeight: 1.8, maxWidth: "520px",
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s",
          marginBottom: "44px",
          position: "relative", zIndex: 1,
        }}>
          Race replays, driver comparisons, tire strategy, sector times and AI-powered race analysis. All in one place. Free forever.
        </p>

        <div style={{
          display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center",
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1) 0.45s",
          position: "relative", zIndex: 1,
        }}>
          <button className="cta-primary" onClick={() => navigate("/replay")} style={{
            fontFamily: "'Outfit', sans-serif",
            background: "linear-gradient(135deg, #e10600, #c00500)",
            color: "#fff", border: "none",
            padding: "15px 36px", borderRadius: "12px",
            fontSize: "15px", fontWeight: 700,
            cursor: "pointer",
            animation: "glowPulse 3s infinite",
            letterSpacing: "-0.01em",
          }}>
            Analyze a race →
          </button>
          <button onClick={() => navigate("/drivers")} style={{
            fontFamily: "'Outfit', sans-serif",
            background: "rgba(255,255,255,0.03)",
            color: "rgba(255,255,255,0.7)",
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "15px 36px", borderRadius: "12px",
            fontSize: "15px", fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            transition: "all 0.3s",
            letterSpacing: "-0.01em",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          >
            Driver profiles
          </button>
        </div>

        <div style={{
          display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center",
          marginTop: "32px",
          opacity: heroVisible ? 1 : 0,
          transition: "opacity 0.8s 0.6s",
          position: "relative", zIndex: 1,
        }}>
          {["No signup", "No paywall", "2018—2026", "Real telemetry", "AI analyst", "Free forever"].map((t, i) => (
            <Tag key={i} text={t} />
          ))}
        </div>

        <div style={{
          position: "absolute", bottom: "40px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
          opacity: heroVisible ? 0.3 : 0,
          transition: "opacity 1s 1s",
          animation: "float 2.5s ease-in-out infinite",
          zIndex: 1,
        }}>
          <div style={{ fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>Scroll</div>
          <div style={{ width: "1px", height: "24px", background: "linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)" }} />
        </div>
      </section>

      {/* NEXT RACE COUNTDOWN */}
      <section ref={nextRaceRef} style={{
        position: "relative", zIndex: 1,
        maxWidth: "900px", margin: "0 auto",
        padding: "0 40px 60px",
      }}>
        <NextRaceCard visible={nextRaceVisible} />
      </section>

      {/* PREVIEW */}
      <section ref={previewRef} style={{
        position: "relative", zIndex: 1,
        maxWidth: "900px", margin: "0 auto",
        padding: "0 40px 80px",
        opacity: previewVisible ? 1 : 0,
        transform: previewVisible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "20px", padding: "24px", overflow: "hidden",
          position: "relative",
        }}>
          <div style={{
            position: "absolute", left: 0, right: 0, height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(225,6,0,0.3), transparent)",
            animation: "scanline 4s linear infinite",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.01em" }}>2026 Chinese Grand Prix</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px", fontFamily: "'Space Mono', monospace" }}>56 laps · 22 drivers · Live data</div>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              {["positions", "laptimes", "tires", "gap", "sectors"].map((t, i) => (
                <div key={i} style={{
                  background: i === 0 ? "rgba(225,6,0,0.2)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${i === 0 ? "rgba(225,6,0,0.4)" : "rgba(255,255,255,0.06)"}`,
                  padding: "4px 10px", borderRadius: "6px",
                  fontSize: "10px", color: i === 0 ? "#e10600" : "rgba(255,255,255,0.3)",
                  fontFamily: "'Space Mono', monospace",
                }}>{t}</div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "10px", marginBottom: "20px" }}>
            {[
              { val: "ANT", lbl: "Race winner", color: "#00d2be" },
              { val: "56", lbl: "Total laps", color: "#fff" },
              { val: "22", lbl: "Drivers", color: "#fff" },
              { val: "Live", lbl: "2026 season", color: "#e10600" },
            ].map((s, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "10px", padding: "12px 14px"
              }}>
                <div style={{ fontSize: "18px", fontWeight: 700, fontFamily: "'Space Mono', monospace", color: s.color }}>{s.val}</div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", marginTop: "3px" }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "16px" }}>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)", marginBottom: "12px", fontFamily: "'Space Mono', monospace", letterSpacing: "1px" }}>POSITION CHANGES — EVERY LAP</div>
            <svg width="100%" height="100" viewBox="0 0 800 100" preserveAspectRatio="none">
              {[
                { points: "0,10 80,10 160,8 240,6 320,6 400,6 480,6 560,6 640,6 720,6 800,6", color: "#00d2be", width: 2.5 },
                { points: "0,20 80,22 160,18 240,14 320,12 400,14 480,18 560,14 640,12 720,10 800,8", color: "#e8002d", width: 2 },
                { points: "0,55 80,45 160,38 240,30 320,25 400,22 480,20 560,22 640,20 720,18 800,14", color: "#ff8000", width: 2 },
                { points: "0,35 80,40 160,45 240,38 320,32 400,28 480,25 560,28 640,25 720,22 800,18", color: "#3671c6", width: 1.5 },
                { points: "0,45 80,55 160,55 240,50 320,45 400,40 480,38 560,35 640,30 720,28 800,25", color: "#52e252", width: 1.5 },
                { points: "0,65 80,60 160,62 240,58 320,55 400,50 480,45 560,42 640,40 720,38 800,35", color: "#f5c842", width: 1 },
              ].map((line, i) => (
                <polyline key={i} points={line.points} fill="none" stroke={line.color} strokeWidth={line.width} strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
              ))}
            </svg>
            <div style={{ display: "flex", gap: "16px", marginTop: "10px", flexWrap: "wrap" }}>
              {[
                { code: "ANT", color: "#00d2be" },
                { code: "RUS", color: "#00d2be" },
                { code: "LEC", color: "#e8002d" },
                { code: "NOR", color: "#ff8000" },
                { code: "VER", color: "#3671c6" },
              ].map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "20px", height: "2px", background: d.color, borderRadius: "1px" }} />
                  <span style={{ fontSize: "10px", color: "#555", fontFamily: "'Space Mono', monospace" }}>{d.code}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => navigate("/replay")} style={{
            marginTop: "16px", width: "100%",
            background: "rgba(225,6,0,0.06)",
            border: "1px solid rgba(225,6,0,0.2)",
            color: "#e10600", padding: "11px",
            borderRadius: "10px", fontSize: "13px",
            fontWeight: 600, cursor: "pointer",
            fontFamily: "'Outfit', sans-serif",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(225,6,0,0.12)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(225,6,0,0.06)"}
          >Open full race replay →</button>
        </div>
      </section>

      {/* 2026 TEAMS */}
      <section ref={teamsRef} style={{
        position: "relative", zIndex: 1,
        maxWidth: "1000px", margin: "0 auto",
        padding: "0 40px 80px",
      }}>
        <div style={{
          textAlign: "center", marginBottom: "32px",
          opacity: teamsVisible ? 1 : 0,
          transform: teamsVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#e10600", marginBottom: "8px" }}>
            2026 Grid
          </div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "26px", fontWeight: 800, letterSpacing: "-0.02em" }}>
            11 teams. 22 drivers. Every race.
          </div>
        </div>
        <TeamsStrip visible={teamsVisible} />
      </section>

      {/* FEATURES */}
      <section ref={featRef} style={{
        position: "relative", zIndex: 1,
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "40px 40px 100px",
      }}>
        <div style={{
          textAlign: "center", marginBottom: "56px",
          opacity: featVisible ? 1 : 0,
          transform: featVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", letterSpacing: "3px", textTransform: "uppercase", color: "#e10600", marginBottom: "12px" }}>What's inside</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "32px", fontWeight: 800, letterSpacing: "-0.02em" }}>Every tool you need</div>
        </div>

        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} delay={i * 80} visible={featVisible} />
          ))}
        </div>
      </section>

      {/* STATS */}
      <section ref={statRef} style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        padding: "56px 40px",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px", height: "200px",
          background: "radial-gradient(ellipse, rgba(225,6,0,0.06), transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          display: "flex", justifyContent: "center", gap: "80px",
          maxWidth: "900px", margin: "0 auto",
          flexWrap: "wrap",
        }}>
          <StatItem value={<><AnimatedCounter end={9} duration={1200} />+ seasons</>} label="Race data" delay={0} visible={statVisible} />
          <StatItem value={<><AnimatedCounter end={200} duration={1500} />+</>} label="Races analyzed" delay={100} visible={statVisible} />
          <StatItem value={<AnimatedCounter end={22} duration={1000} />} label="Drivers tracked" delay={200} visible={statVisible} />
          <StatItem value="Free" label="Always" delay={300} visible={statVisible} />
        </div>
      </section>

      {/* CTA */}
      <section ref={ctaRef} style={{
        position: "relative", zIndex: 1,
        padding: "100px 40px",
        textAlign: "center",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px", height: "500px",
          background: "radial-gradient(circle, rgba(225,6,0,0.08), transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          opacity: ctaVisible ? 1 : 0,
          transform: ctaVisible ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.8s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "10px", color: "rgba(255,255,255,0.2)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "20px" }}>Ready to go deeper?</div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "16px", lineHeight: 1.1 }}>
            The race data you've<br />
            <span style={{ background: "linear-gradient(135deg, #e10600, #ff4040)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>always wanted</span>
          </div>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: "15px", color: "rgba(255,255,255,0.25)", marginBottom: "40px" }}>
            No signup. No paywall. No nonsense. Just real F1 data.
          </div>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
            <button className="cta-primary" onClick={() => navigate("/replay")} style={{
              fontFamily: "'Outfit', sans-serif",
              background: "linear-gradient(135deg, #e10600, #c00500)",
              color: "#fff", border: "none",
              padding: "16px 48px", borderRadius: "12px",
              fontSize: "16px", fontWeight: 700,
              cursor: "pointer",
              animation: "glowPulse 3s infinite",
              letterSpacing: "-0.01em",
            }}>
              Analyze a race →
            </button>
            <button onClick={() => navigate("/h2h")} style={{
              fontFamily: "'Outfit', sans-serif",
              background: "rgba(255,255,255,0.03)",
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.1)",
              padding: "16px 48px", borderRadius: "12px",
              fontSize: "16px", fontWeight: 600,
              cursor: "pointer", transition: "all 0.3s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
            >
              Compare drivers
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "28px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <div onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <div style={{
            width: "24px", height: "24px",
            background: "linear-gradient(135deg, #e10600, #b30500)",
            borderRadius: "5px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Space Mono', monospace",
            fontWeight: 700, fontSize: "8px", color: "#fff",
          }}>PW</div>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>PitWall — F1 Race Intelligence</span>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          {["Support", "Contact"].map(l => (
            <a key={l} onClick={() => navigate(`/${l.toLowerCase()}`)} style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "12px", color: "rgba(255,255,255,0.25)",
              textDecoration: "none", cursor: "pointer",
              transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "rgba(255,255,255,0.6)"}
              onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.25)"}
            >{l}</a>
          ))}
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.1)" }}>Data from FastF1 & Jolpica · Not affiliated with Formula 1</span>
        </div>
      </footer>
    </div>
  );
}