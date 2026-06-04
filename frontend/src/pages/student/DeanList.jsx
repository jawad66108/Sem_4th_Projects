import { useState, useEffect, useRef } from "react";
import axios from "axios";

const YELLOW = "#F5C400";
const RED = "#C0395A";
const BLACK = "#111111";
const WHITE = "#FFFFFF";

const BATCHES = []; // will be loaded from DB
const SEMESTERS = []; // will be loaded from DB

const rankColors = {
  1: { bg: "#FFD700", text: "#111" },
  2: { bg: "#C0C0C0", text: "#111" },
  3: { bg: "#CD7F32", text: "#fff" },
};

/* ─── Custom Dropdown ─── */
function Dropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={styles.dropWrapper}>
      <button style={styles.dropBtn} onClick={() => setOpen(!open)}>
        <span style={styles.dropLabel}>{label}</span>
        <span style={styles.dropValue}>{value}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={BLACK}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={styles.dropMenu}>
          {options.map((opt) => (
            <button
              key={opt}
              style={{
                ...styles.dropOption,
                ...(opt === value ? styles.dropOptionActive : {}),
              }}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt === value && (
                <span
                  style={{ color: YELLOW, marginRight: 8, fontWeight: 900 }}
                >
                  ✓
                </span>
              )}
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const IconMedal = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke={WHITE}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="14" r="6" />
    <path d="M8 6l-2-4h12l-2 4" />
    <path d="M12 10v4l2 2" />
  </svg>
);

const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={YELLOW} stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconTrophy = () => (
  <svg
    width="90"
    height="90"
    viewBox="0 0 24 24"
    fill="none"
    stroke="rgba(0,0,0,0.2)"
    strokeWidth="1.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);

/* ─── Main Component ─── */
export default function DeanList({ user }) {
  const [selBatch, setSelBatch] = useState(null);
  const [selSemester, setSelSemester] = useState(null);
  const [batches, setBatches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);

  // Load batches & semesters from DB on mount
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const token = localStorage.getItem("rankify_token");
        const res = await axios.get(
          "http://localhost:5000/api/deanlist/filters/options",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const b = res.data.batches || [];
        const s = res.data.semesters || [];
        setBatches(b);
        setSemesters(s);
        if (b.length > 0) setSelBatch(b[0]);
        if (s.length > 0) setSelSemester(s[0]);
      } catch (err) {
        console.error("Filter load failed", err);
      } finally {
        setFiltersLoading(false);
      }
    };
    loadFilters();
  }, []);

  useEffect(() => {
    if (selBatch && selSemester) fetchDeanList();
  }, [selBatch, selSemester]);

  const fetchDeanList = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("rankify_token");
      const res = await axios.get(
        `http://localhost:5000/api/deanlist/semester/${selSemester}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const filtered = (res.data.data || [])
        .filter((s) => s.BATCH_NAME === selBatch)
        .sort((a, b) => b.CGPA - a.CGPA)
        .map((s, i) => ({
          name: s.FULL_NAME,
          regNumber: s.REG_NUMBER,
          sgpa: s.CGPA,
          section: s.SECTION_NAME,
          rank: i + 1,
        }));
      setRawData(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  if (filtersLoading) {
    return (
      <div
        style={{ padding: 40, fontSize: 18, color: "#aaa", fontWeight: 700 }}
      >
        Loading filters...
      </div>
    );
  }

  if (!selBatch || !selSemester) {
    return (
      <div
        style={{ padding: 40, fontSize: 16, color: "#aaa", fontWeight: 700 }}
      >
        No batch or semester data found in database.
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* ── HEADER CARD ── */}
      <div style={styles.headerCard}>
        <div style={styles.circle1} />
        <div style={styles.circle2} />

        <div style={styles.headerInner}>
          {/* Left */}
          <div style={styles.headerLeft}>
            <div style={styles.deanTitle}>
              <div style={styles.medalIconBox}>
                <IconMedal />
              </div>
              Dean List
            </div>
            <p style={styles.batchLabel}>
              BATCH {selBatch} · {selSemester.toUpperCase()}
            </p>
            <div style={styles.headerBadges}>
              <span style={styles.minBadge}>Min SGPA 3.5+</span>
              <span style={styles.countBadge}>
                {loading ? "..." : rawData.length} Students Qualified
              </span>
            </div>
          </div>

          {/* Center count */}
          <div style={styles.headerStat}>
            <p style={styles.headerStatNum}>{loading ? "—" : rawData.length}</p>
            <p style={styles.headerStatLabel}>on Dean's List</p>
            <p style={styles.headerStatSub}>SEMESTER GPA ≥ 3.5</p>
          </div>

          {/* Right dropdowns */}
          <div style={styles.dropdowns}>
            <Dropdown
              label="BATCH"
              options={batches}
              value={selBatch || ""}
              onChange={setSelBatch}
            />
            <Dropdown
              label="SEMESTER"
              options={semesters}
              value={selSemester || ""}
              onChange={setSelSemester}
            />
          </div>
        </div>
      </div>

      {/* ── COLUMN HEADERS ── */}
      <div style={styles.colHeader}>
        <div style={{ width: 52 }}>#</div>
        <div style={{ flex: 1 }}>STUDENT</div>
        <div style={{ width: 160 }}>REG NUMBER</div>
        <div style={{ width: 80, textAlign: "center" }}>SECTION</div>
        <div style={{ width: 90, textAlign: "right" }}>SEM GPA</div>
      </div>

      {/* ── LIST ── */}
      {loading ? (
        <div style={styles.emptyState}>Loading...</div>
      ) : rawData.length === 0 ? (
        <div style={styles.emptyState}>
          <IconTrophy />
          <p>No students on dean list for this selection.</p>
        </div>
      ) : (
        <div style={styles.listContainer}>
          {rawData.map((s, i) => {
            const isTop3 = s.rank <= 3;
            const rankCol = rankColors[s.rank] || {
              bg: "rgba(0,0,0,0.08)",
              text: BLACK,
            };
            const isHov = hoveredRow === i;
            return (
              <div
                key={i}
                style={{
                  ...styles.row,
                  ...(isTop3 ? styles.rowTop3 : {}),
                  ...(isHov ? styles.rowHover : {}),
                }}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <div
                  style={{
                    ...styles.rankBubble,
                    background: rankCol.bg,
                    color: rankCol.text,
                  }}
                >
                  {s.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      ...styles.namePill,
                      ...(isTop3 ? styles.namePillTop3 : {}),
                    }}
                  >
                    {isTop3 && (
                      <span style={styles.starIcon}>
                        <IconStar />
                      </span>
                    )}
                    {s.name}
                  </div>
                </div>
                <div style={styles.regText}>{s.regNumber || "—"}</div>
                <div style={styles.sectionChip}>{s.section || "—"}</div>
                <div style={styles.sgpaBox}>
                  <span style={styles.sgpaVal}>{s.sgpa?.toFixed(2)}</span>
                  <div style={styles.sgpaMini}>
                    <div
                      style={{
                        ...styles.sgpaMiniFill,
                        width: `${Math.min(((s.sgpa - 3.5) / 0.5) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Styles ─── */
const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    maxWidth: 900,
    width: "100%",
  },

  headerCard: {
    background: YELLOW,
    borderRadius: 24,
    padding: "28px 32px",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
    boxShadow: "0 6px 28px rgba(245,196,0,0.35)",
  },
  circle1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.12)",
    pointerEvents: "none",
  },
  circle2: {
    position: "absolute",
    bottom: -60,
    right: 60,
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.06)",
    pointerEvents: "none",
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 1,
    gap: 20,
    flexWrap: "wrap",
  },
  headerLeft: { display: "flex", flexDirection: "column", gap: 6 },
  deanTitle: {
    fontSize: 40,
    fontWeight: 900,
    color: RED,
    letterSpacing: -1,
    display: "flex",
    alignItems: "center",
    gap: 10,
    lineHeight: 1,
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
    textShadow: "2px 2px 0 rgba(0,0,0,0.08)",
  },
  medalIconBox: {
    background: RED,
    color: WHITE,
    width: 48,
    height: 48,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(200,41,58,0.35)",
  },
  batchLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "rgba(0,0,0,0.55)",
    margin: 0,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerBadges: { display: "flex", gap: 10, marginTop: 2 },
  minBadge: {
    background: BLACK,
    color: YELLOW,
    fontSize: 12,
    fontWeight: 900,
    padding: "5px 14px",
    borderRadius: 50,
    letterSpacing: 1,
  },
  countBadge: {
    background: "rgba(0,0,0,0.12)",
    color: BLACK,
    fontSize: 12,
    fontWeight: 800,
    padding: "5px 14px",
    borderRadius: 50,
    letterSpacing: 0.5,
  },
  headerStat: { textAlign: "center" },
  headerStatNum: {
    fontSize: 68,
    fontWeight: 900,
    color: WHITE,
    margin: 0,
    lineHeight: 1,
    letterSpacing: -2,
    textShadow: "3px 3px 0 rgba(0,0,0,0.1)",
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },
  headerStatLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(0,0,0,0.55)",
    margin: "2px 0 0",
    letterSpacing: 1,
  },
  headerStatSub: {
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(0,0,0,0.35)",
    margin: "2px 0 0",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  dropdowns: { display: "flex", gap: 12, flexDirection: "column" },
  dropWrapper: { position: "relative" },
  dropBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    borderRadius: 12,
    border: "2px solid rgba(0,0,0,0.18)",
    background: WHITE,
    cursor: "pointer",
    fontFamily: "inherit",
    minWidth: 200,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "all 0.18s ease",
  },
  dropLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(0,0,0,0.4)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  dropValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: 900,
    color: BLACK,
    letterSpacing: 0.5,
    textAlign: "left",
  },
  dropMenu: {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: WHITE,
    borderRadius: 12,
    border: "2px solid rgba(0,0,0,0.1)",
    boxShadow: "0 8px 28px rgba(0,0,0,0.15)",
    zIndex: 100,
    overflow: "hidden",
  },
  dropOption: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "11px 16px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 700,
    color: BLACK,
    textAlign: "left",
    transition: "background 0.15s",
  },
  dropOptionActive: { background: "rgba(245,196,0,0.15)", color: BLACK },

  colHeader: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "0 20px 8px",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 2,
    color: "rgba(0,0,0,0.35)",
    textTransform: "uppercase",
    borderBottom: "2px solid rgba(0,0,0,0.06)",
  },
  listContainer: { display: "flex", flexDirection: "column", gap: 10 },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "13px 20px",
    borderRadius: 16,
    background: WHITE,
    border: "2px solid rgba(0,0,0,0.05)",
    transition: "all 0.18s ease",
    cursor: "default",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  rowHover: {
    border: `2px solid ${YELLOW}`,
    transform: "translateX(4px)",
    boxShadow: "0 4px 18px rgba(245,196,0,0.2)",
  },
  rowTop3: {
    border: "2px solid rgba(245,196,0,0.3)",
    background: "rgba(245,196,0,0.04)",
  },
  rankBubble: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 900,
    flexShrink: 0,
    fontFamily: "'Barlow Condensed', Arial, sans-serif",
  },
  namePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: RED,
    color: WHITE,
    fontSize: 15,
    fontWeight: 800,
    padding: "9px 22px",
    borderRadius: 50,
    letterSpacing: 0.5,
    boxShadow: "0 3px 10px rgba(200,41,58,0.25)",
  },
  namePillTop3: { boxShadow: "0 4px 16px rgba(200,41,58,0.35)" },
  starIcon: { color: YELLOW, display: "flex", alignItems: "center" },
  regText: {
    width: 160,
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(0,0,0,0.4)",
    letterSpacing: 0.8,
    fontFamily: "monospace",
    flexShrink: 0,
  },
  sectionChip: {
    width: 80,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 800,
    color: BLACK,
    background: "rgba(245,196,0,0.25)",
    border: `1.5px solid ${YELLOW}`,
    padding: "4px 0",
    borderRadius: 8,
    letterSpacing: 1,
    flexShrink: 0,
  },
  sgpaBox: {
    width: 90,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
  },
  sgpaVal: {
    fontSize: 20,
    fontWeight: 900,
    color: BLACK,
    letterSpacing: -0.5,
    fontFamily: "'Barlow Condensed', Arial, sans-serif",
  },
  sgpaMini: {
    width: "100%",
    height: 4,
    background: "rgba(0,0,0,0.08)",
    borderRadius: 10,
    overflow: "hidden",
  },
  sgpaMiniFill: {
    height: "100%",
    background: YELLOW,
    borderRadius: 10,
    transition: "width 0.5s ease",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    color: "rgba(0,0,0,0.25)",
    fontSize: 16,
    fontWeight: 700,
    padding: "60px 0",
  },
};
