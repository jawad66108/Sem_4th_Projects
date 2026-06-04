import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DeanList from "./DeanList";
import ProjectsPage from "./ProjectsPage";

/* ─── Icons ─── */
const IconGradCap = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const IconBook = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const IconChart = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconLogout = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const IconMedal = () => (
  <svg
    width="36"
    height="36"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="14" r="6" />
    <path d="M8 6l-2-4h12l-2 4" />
    <path d="M12 10v4l2 2" />
  </svg>
);
const IconMedalSm = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="14" r="6" />
    <path d="M8 6l-2-4h12l-2 4" />
    <path d="M12 10v4l2 2" />
  </svg>
);

/* ─── Nav Items ─── */
const navItems = [
  { id: "home", label: "CGPA Analysis", icon: <IconChart /> },
  { id: "dean", label: "Dean List", icon: <IconMedalSm /> },
  { id: "project", label: "My Project", icon: <IconBook /> },
];

/* ─── Helper ─── */
const getGrade = (cgpa) =>
  cgpa >= 3.7
    ? "A+"
    : cgpa >= 3.3
      ? "A"
      : cgpa >= 3.0
        ? "B+"
        : cgpa >= 2.7
          ? "B"
          : "C";

/* ─── Main Component ─── */
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [student, setStudent] = useState(null);
  const [deanInfo, setDeanInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("rankify_user") || "{}");

  useEffect(() => {
    if (!user?.user_id) {
      navigate("/login");
      return;
    }
    if (user.role?.toLowerCase() !== "student") {
      navigate("/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("rankify_token");
      const headers = { Authorization: `Bearer ${token}` };
      const [studRes, deanRes] = await Promise.all([
        axios.get("http://localhost:5000/api/students", { headers }),
        axios.get("http://localhost:5000/api/deanlist", { headers }),
      ]);
      const all = studRes.data.data;
      const rank = all.findIndex((s) => s.FULL_NAME === user.full_name) + 1;
      const me = all.find((s) => s.FULL_NAME === user.full_name);
      if (me) {
        // Fetch latest SGPA separately from CGPA_RECORDS
        let sgpaVal = null;
        try {
          const gpaRes = await axios.get(
            `http://localhost:5000/api/students/my/gpa/${me.STUDENT_ID}`,
            { headers },
          );
          if (gpaRes.data.data) {
            sgpaVal = gpaRes.data.data.SGPA;
          }
        } catch (e) {
          console.error("SGPA fetch failed", e);
        }
        setStudent({ ...me, rank, total: all.length, SGPA: sgpaVal });
      }
      const dean = deanRes.data.data.find(
        (d) => d.FULL_NAME === user.full_name,
      );
      if (dean) setDeanInfo(dean);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ── Computed values from real data ── */
  const cgpa = student?.CGPA || 0;
  const sgpa = student?.SGPA ?? cgpa; // real SGPA from CGPA_RECORDS, fallback to CGPA
  const rank = student?.rank || "—";
  const total = student?.total || 0;
  const percentile =
    rank && total ? Math.round(((total - rank) / total) * 100) : 0;
  const grade = getGrade(cgpa);
  const regNumber = student?.REG_NUMBER || "—";

  return (
    <div style={styles.page}>
      {/* ── Sidebar ── */}
      <aside style={styles.sidebar}>
        {/* Watermark */}
        <div style={styles.sidebarWatermark}>R</div>

        {/* Brand */}
        <div style={styles.brand}>
          <span style={styles.brandText}>RANKIFY</span>
          <span style={styles.brandPro}>PRO</span>
        </div>
        <p style={styles.brandSub}>Academic Dashboard</p>

        <div style={styles.sidebarDivider} />

        {/* Nav */}
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            const isHov = hoveredNav === item.id;
            return (
              <button
                key={item.id}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                  ...(isHov && !isActive ? styles.navItemHover : {}),
                }}
                onClick={() => setActiveNav(item.id)}
                onMouseEnter={() => setHoveredNav(item.id)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <span
                  style={{
                    ...styles.navIcon,
                    color: isActive ? "#111" : "rgba(0,0,0,0.5)",
                  }}
                >
                  {item.icon}
                </span>
                <span style={styles.navLabel}>{item.label}</span>
                {isActive && <span style={styles.navDot} />}
              </button>
            );
          })}
        </nav>

        {/* Calculator Illustration */}
        <div style={styles.illustrationBox}>
          <div style={styles.calcIllustration}>
            <div style={styles.calcScreen}>
              <span style={styles.calcScreenText}>
                {loading ? "..." : cgpa.toFixed(2)}
              </span>
            </div>
            <div style={styles.calcButtons}>
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.calcBtn,
                    background: i < 3 ? "#1a1a2e" : "rgba(0,0,0,0.15)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          style={{
            ...styles.logoutBtn,
            ...(hoveredNav === "logout" ? styles.logoutHover : {}),
          }}
          onMouseEnter={() => setHoveredNav("logout")}
          onMouseLeave={() => setHoveredNav(null)}
          onClick={handleLogout}
        >
          <IconLogout />
          <span>Logout</span>
        </button>

        <p style={styles.sidebarFooter}>© RANKIFY PRO</p>
      </aside>

      {/* ── Main Content ── */}
      <main style={styles.main}>
        {/* ── HOME PAGE ── */}
        {activeNav === "home" && (
          <>
            {/* Top bar */}
            <div style={styles.topBar}>
              <div>
                <p style={styles.welcomeLabel}>ACADEMIC PORTAL</p>
                <h1 style={styles.welcomeTitle}>
                  Welcome,
                  <br />
                  <span style={styles.studentName}>
                    {loading ? "Loading..." : user.full_name}
                  </span>
                </h1>
                <div style={styles.regNumRow}>
                  <span style={styles.regBadge}>{regNumber}</span>
                  <span style={styles.semBadge}>Spring-2026</span>
                </div>
              </div>
              <div style={styles.topIcons}>
                <div style={styles.topIconBtn}>
                  <IconGradCap />
                </div>
                <div style={styles.topIconBtn}>
                  <IconBook />
                </div>
                <div style={styles.topIconBtn}>
                  <IconChart />
                </div>
              </div>
            </div>

            {/* Dean List Banner */}
            {!loading &&
              (deanInfo ? (
                <div style={styles.deanBanner}>
                  <span style={styles.deanBannerText}>
                    🏅 Congratulations! You made the Dean's List for{" "}
                    <strong>{deanInfo.SEMESTER}</strong>
                  </span>
                  <div style={styles.deanMedalIcon}>
                    <IconMedal />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    ...styles.deanBanner,
                    background: "rgba(0,0,0,0.05)",
                    boxShadow: "none",
                  }}
                >
                  <span
                    style={{
                      ...styles.deanBannerText,
                      color: "rgba(0,0,0,0.45)",
                    }}
                  >
                    📚 Keep pushing — Dean List requires CGPA ≥ 3.5
                  </span>
                </div>
              ))}

            {/* Stats Row 1 */}
            {loading ? (
              <div style={{ color: "#aaa", fontSize: 18, padding: "40px 0" }}>
                Loading your data...
              </div>
            ) : (
              <>
                <div style={styles.statsRow}>
                  {/* SGPA */}
                  <div
                    style={{
                      ...styles.card,
                      ...styles.cardLarge,
                      ...(hoveredCard === "sgpa" ? styles.cardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCard("sgpa")}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <p style={styles.cardLabel}>Current Semester GPA</p>
                    <p style={styles.cardValue}>{sgpa.toFixed(2)}</p>
                    <div style={styles.cardBar}>
                      <div
                        style={{
                          ...styles.cardBarFill,
                          width: `${(sgpa / 4) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* CGPA */}
                  <div
                    style={{
                      ...styles.card,
                      ...styles.cardLarge,
                      ...(hoveredCard === "cgpa" ? styles.cardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCard("cgpa")}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <p style={styles.cardLabel}>
                      Cumulative Grade Point Average
                    </p>
                    <p style={styles.cardValue}>{cgpa.toFixed(2)}</p>
                    <div style={styles.cardBar}>
                      <div
                        style={{
                          ...styles.cardBarFill,
                          width: `${(cgpa / 4) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats Row 2 */}
                <div style={styles.statsRow}>
                  {/* Class Rank */}
                  <div
                    style={{
                      ...styles.card,
                      ...styles.cardSmall,
                      ...(hoveredCard === "rank" ? styles.cardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCard("rank")}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <p style={styles.cardLabelSmall}>Class Rank</p>
                    <p style={styles.cardSubLabel}>Out of {total}</p>
                    <p style={styles.cardValueBig}>#{rank}</p>
                  </div>

                  {/* Percentile */}
                  <div
                    style={{
                      ...styles.card,
                      ...styles.cardSmall,
                      ...(hoveredCard === "pct" ? styles.cardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCard("pct")}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <p style={styles.cardLabelSmall}>Percentile Ranking</p>
                    <p style={styles.cardSubLabel}>Top of class</p>
                    <p style={styles.cardValueBig}>{percentile}%</p>
                  </div>

                  {/* Overall Grade */}
                  <div
                    style={{
                      ...styles.card,
                      ...styles.cardSmall,
                      ...(hoveredCard === "grade" ? styles.cardHover : {}),
                    }}
                    onMouseEnter={() => setHoveredCard("grade")}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <p style={styles.cardLabelSmall}>Overall Grade</p>
                    <p style={styles.cardSubLabel}>This semester</p>
                    <p style={styles.cardValueBig}>{grade}</p>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ── DEAN LIST PAGE ── */}
        {activeNav === "dean" && <DeanList user={user} />}

        {/* ── MY PROJECT PAGE ── */}
        {activeNav === "project" && <ProjectsPage user={user} />}
      </main>
    </div>
  );
}

/* ─── Styles ─── */
const YELLOW = "#F5C400";
const BLACK = "#111111";
const WHITE = "#FFFFFF";

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
    background: WHITE,
  },

  /* SIDEBAR */
  sidebar: {
    width: 280,
    minWidth: 280,
    background: YELLOW,
    display: "flex",
    flexDirection: "column",
    padding: "36px 28px",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    zIndex: 2,
  },
  sidebarWatermark: {
    position: "absolute",
    bottom: -40,
    left: -20,
    fontSize: 260,
    fontWeight: 900,
    color: "rgba(0,0,0,0.05)",
    pointerEvents: "none",
    userSelect: "none",
    lineHeight: 1,
    zIndex: 0,
  },
  brand: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    position: "relative",
    zIndex: 1,
  },
  brandText: {
    fontSize: 36,
    fontWeight: 900,
    color: WHITE,
    letterSpacing: -1,
    textShadow: "2px 2px 0 rgba(0,0,0,0.12)",
    lineHeight: 1,
  },
  brandPro: {
    fontSize: 12,
    fontWeight: 900,
    background: BLACK,
    color: YELLOW,
    padding: "3px 7px",
    borderRadius: 3,
    marginBottom: 4,
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(0,0,0,0.5)",
    margin: "4px 0 0",
    letterSpacing: 2,
    textTransform: "uppercase",
    position: "relative",
    zIndex: 1,
  },
  sidebarDivider: {
    width: "100%",
    height: 2,
    background: "rgba(0,0,0,0.12)",
    borderRadius: 2,
    margin: "20px 0",
    position: "relative",
    zIndex: 1,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    position: "relative",
    zIndex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    borderRadius: 12,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 700,
    color: "rgba(0,0,0,0.6)",
    letterSpacing: 0.5,
    textAlign: "left",
    transition: "all 0.18s ease",
    position: "relative",
  },
  navItemActive: {
    background: WHITE,
    color: BLACK,
    boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
  },
  navItemHover: { background: "rgba(255,255,255,0.45)", color: BLACK },
  navIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    transition: "color 0.18s",
  },
  navLabel: { flex: 1 },
  navDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: YELLOW,
    border: "2px solid " + BLACK,
    flexShrink: 0,
  },

  /* Calculator illustration */
  illustrationBox: {
    flex: 1,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
    paddingBottom: 12,
  },
  calcIllustration: {
    width: 120,
    background: "#1a1a2e",
    borderRadius: 16,
    padding: 12,
    boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
  },
  calcScreen: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "8px 12px",
    marginBottom: 10,
    textAlign: "right",
  },
  calcScreenText: {
    fontSize: 22,
    fontWeight: 900,
    color: YELLOW,
    letterSpacing: 1,
  },
  calcButtons: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 6,
  },
  calcBtn: { height: 20, borderRadius: 4 },

  /* Logout */
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 16px",
    borderRadius: 12,
    border: "2px solid rgba(0,0,0,0.15)",
    background: "transparent",
    color: "rgba(0,0,0,0.55)",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: 0.5,
    transition: "all 0.18s ease",
    position: "relative",
    zIndex: 1,
    marginBottom: 10,
  },
  logoutHover: {
    background: "#E53E3E",
    color: WHITE,
    border: "2px solid #E53E3E",
  },
  sidebarFooter: {
    fontSize: 9,
    letterSpacing: 3,
    color: "rgba(0,0,0,0.35)",
    fontWeight: 700,
    margin: 0,
    position: "relative",
    zIndex: 1,
  },

  /* MAIN */
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "40px 48px",
    overflowY: "auto",
    gap: 24,
    background: "#fafafa",
    boxSizing: "border-box",
  },

  /* Top bar */
  topBar: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  welcomeLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 4,
    color: "rgba(0,0,0,0.35)",
    margin: "0 0 8px",
    textTransform: "uppercase",
  },
  welcomeTitle: {
    fontSize: 52,
    fontWeight: 900,
    color: BLACK,
    margin: 0,
    lineHeight: 1.05,
    letterSpacing: -1.5,
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },
  studentName: { color: "#b89000" },
  regNumRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "12px 0 0",
    flexWrap: "wrap",
  },
  regBadge: {
    fontSize: 14,
    fontWeight: 900,
    color: BLACK,
    background: YELLOW,
    padding: "6px 16px",
    borderRadius: 50,
    letterSpacing: 1.5,
    boxShadow: "0 3px 10px rgba(245,196,0,0.4)",
    display: "inline-block",
  },
  semBadge: {
    fontSize: 13,
    fontWeight: 800,
    color: BLACK,
    background: "rgba(0,0,0,0.08)",
    border: "2px solid rgba(0,0,0,0.12)",
    padding: "5px 14px",
    borderRadius: 50,
    letterSpacing: 1,
    display: "inline-block",
  },
  topIcons: { display: "flex", gap: 12, paddingTop: 4 },
  topIconBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    border: "2px solid rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgba(0,0,0,0.4)",
    background: WHITE,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },

  /* Dean Banner */
  deanBanner: {
    background: YELLOW,
    borderRadius: 50,
    padding: "18px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 4px 20px rgba(245,196,0,0.35)",
  },
  deanBannerText: {
    fontSize: 16,
    fontWeight: 700,
    color: BLACK,
    letterSpacing: 0.3,
  },
  deanMedalIcon: { color: BLACK, display: "flex", alignItems: "center" },

  /* Stats */
  statsRow: { display: "flex", gap: 20, flex: "0 0 auto" },
  card: {
    background: YELLOW,
    borderRadius: 20,
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    transition: "all 0.2s ease",
    cursor: "default",
    position: "relative",
    overflow: "hidden",
  },
  cardLarge: { flex: 1, minHeight: 160 },
  cardSmall: { flex: 1, minHeight: 140 },
  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 12px 32px rgba(245,196,0,0.45)",
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(0,0,0,0.5)",
    letterSpacing: 1,
    textTransform: "uppercase",
    margin: "0 0 8px",
  },
  cardLabelSmall: {
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(0,0,0,0.5)",
    letterSpacing: 1,
    textTransform: "uppercase",
    margin: "0 0 2px",
  },
  cardSubLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(0,0,0,0.35)",
    margin: "0 0 10px",
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: 56,
    fontWeight: 900,
    color: WHITE,
    margin: "0 0 12px",
    lineHeight: 1,
    letterSpacing: -1,
    textShadow: "2px 2px 0 rgba(0,0,0,0.1)",
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },
  cardValueBig: {
    fontSize: 48,
    fontWeight: 900,
    color: WHITE,
    margin: 0,
    lineHeight: 1,
    letterSpacing: -1,
    textShadow: "2px 2px 0 rgba(0,0,0,0.1)",
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },
  cardBar: {
    width: "100%",
    height: 5,
    background: "rgba(0,0,0,0.12)",
    borderRadius: 10,
    overflow: "hidden",
  },
  cardBarFill: {
    height: "100%",
    background: WHITE,
    borderRadius: 10,
    transition: "width 0.6s ease",
  },
};
