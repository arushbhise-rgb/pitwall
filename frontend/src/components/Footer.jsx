import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer style={{
      borderTop: "0.5px solid #1a1a1a",
      padding: "20px 40px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "12px",
      background: "#050505",
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
  )
}
