import { useState, useEffect } from "react";
import axios from "axios";

const YELLOW = "#F5C400";
const BLACK = "#111111";
const WHITE = "#FFFFFF";
const RED = "#C8293A";
const GREEN = "#16a34a";

const SEMESTERS = [];
const BATCHES = [];
const rankColors = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };

const IconMedal = () => (
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
  </svg>
);
const IconRefresh = () => (
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
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const IconDownload = () => (
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
    <polyline points="8 17 12 21 16 17" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
  </svg>
);
const IconStar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={YELLOW} stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("rankify_token")}` },
});
const BASE = "http://localhost:5000/api";

export default function AdminDeanList() {
  const [selSemester, setSelSemester] = useState(null);
  const [selBatch, setSelBatch] = useState("All");
  const [semesters, setSemesters] = useState([]);
  const [batches, setBatches] = useState(["All"]);
  const [deanData, setDeanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await axios.get(`${BASE}/deanlist/filters/options`, api());
        const s = res.data.semesters || [];
        const b = res.data.batches || [];
        setSemesters(s);
        setBatches(["All", ...b]);
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
    if (selSemester) fetchDeanList();
  }, [selSemester]);

  const fetchDeanList = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE}/deanlist/semester/${selSemester}`,
        api(),
      );
      setDeanData(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await axios.post(
        `${BASE}/admin/generate-deanlist`,
        { semester: selSemester },
        api(),
      );
      showSuccess(`✅ Dean list regenerated for ${selSemester}`);
      fetchDeanList();
    } catch (err) {
      alert("Failed: " + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!filtered.length) {
      alert("No data to download.");
      return;
    }
    const headers = [
      "Rank",
      "Full Name",
      "Reg Number",
      "Batch",
      "Section",
      "CGPA",
    ];
    const rows = filtered.map((s, i) =>
      [
        i + 1,
        s.FULL_NAME,
        s.REG_NUMBER,
        s.BATCH_NAME,
        s.SECTION_NAME,
        s.CGPA?.toFixed(2),
      ].join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DeanList_${selSemester}_${selBatch}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filtered = deanData
    .filter((s) => selBatch === "All" || s.BATCH_NAME === selBatch)
    .sort((a, b) => b.CGPA - a.CGPA);

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <p style={styles.pageLabel}>ADMIN PANEL</p>
          <h1 style={styles.pageTitle}>
            Dean <span style={{ color: YELLOW }}>List</span>
          </h1>
          <p style={styles.pageSub}>
            View, regenerate and download the dean list by semester and batch.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            style={{
              ...styles.actionBtn,
              background: BLACK,
              color: WHITE,
              opacity: generating ? 0.7 : 1,
            }}
            onClick={handleGenerate}
            disabled={generating}
          >
            <IconRefresh />{" "}
            {generating ? "Generating..." : "Regenerate Dean List"}
          </button>
          <button
            style={{ ...styles.actionBtn, background: YELLOW, color: BLACK }}
            onClick={handleDownload}
          >
            <IconDownload /> Download CSV
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div style={styles.successBanner}>
          <IconCheck /> {successMsg}
        </div>
      )}

      {/* Header Stats Card */}
      <div style={styles.headerCard}>
        <div style={styles.circle1} />
        <div style={styles.circle2} />
        <div style={styles.headerCardInner}>
          <div style={styles.headerCardLeft}>
            <div style={styles.medalBox}>
              <IconMedal />
            </div>
            <div>
              <h2 style={styles.headerCardTitle}>Dean List</h2>
              <p style={styles.headerCardSub}>
                BATCH {selBatch} · {selSemester?.toUpperCase()}
              </p>
              <div style={styles.headerBadges}>
                <span style={styles.minBadge}>Min CGPA 3.5+</span>
                <span style={styles.countBadge}>
                  {loading ? "..." : filtered.length} Qualified
                </span>
              </div>
            </div>
          </div>
          <div style={styles.headerCardStat}>
            <p style={styles.bigNum}>{loading ? "—" : filtered.length}</p>
            <p style={styles.bigNumLabel}>on Dean's List</p>
            <p style={styles.bigNumSub}>CGPA ≥ 3.5</p>
          </div>
          <div style={styles.filtersCol}>
            {/* Semester */}
            <div style={styles.filterGroup}>
              <p style={styles.filterLabel}>SEMESTER</p>
              <div style={styles.chipRow}>
                {semesters.map((s) => (
                  <button
                    key={s}
                    style={{
                      ...styles.chip,
                      ...(selSemester === s ? styles.chipActive : {}),
                    }}
                    onClick={() => setSelSemester(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* Batch */}
            <div style={styles.filterGroup}>
              <p style={styles.filterLabel}>BATCH</p>
              <div style={styles.chipRow}>
                {batches.map((b) => (
                  <button
                    key={b}
                    style={{
                      ...styles.chip,
                      ...(selBatch === b ? styles.chipActive : {}),
                    }}
                    onClick={() => setSelBatch(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div style={styles.colHeader}>
        <div style={{ width: 52 }}>#</div>
        <div style={{ flex: 1 }}>STUDENT</div>
        <div style={{ width: 160 }}>REG NUMBER</div>
        <div style={{ width: 100 }}>BATCH</div>
        <div style={{ width: 80, textAlign: "center" }}>SECTION</div>
        <div style={{ width: 90, textAlign: "right" }}>CGPA</div>
      </div>

      {/* List */}
      {loading ? (
        <div style={styles.emptyState}>Loading dean list...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <IconMedal />
          <p>No students on dean list for this selection.</p>
          <button
            style={{ ...styles.actionBtn, background: BLACK, color: WHITE }}
            onClick={handleGenerate}
          >
            <IconRefresh /> Generate Now
          </button>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map((s, i) => {
            const rank = i + 1;
            const isTop3 = rank <= 3;
            const rankCol = rankColors[rank] || "rgba(0,0,0,0.08)";
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
                    background: rankCol,
                    color: rank <= 2 ? BLACK : WHITE,
                  }}
                >
                  {rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      ...styles.namePill,
                      ...(isTop3
                        ? { boxShadow: "0 4px 16px rgba(200,41,58,0.35)" }
                        : {}),
                    }}
                  >
                    {isTop3 && (
                      <span style={{ color: YELLOW }}>
                        <IconStar />
                      </span>
                    )}
                    {s.FULL_NAME}
                  </div>
                </div>
                <div style={styles.regText}>{s.REG_NUMBER || "—"}</div>
                <div style={styles.batchChip}>{s.BATCH_NAME}</div>
                <div style={styles.sectionChip}>{s.SECTION_NAME || "—"}</div>
                <div style={styles.cgpaBox}>
                  <span style={styles.cgpaVal}>{s.CGPA?.toFixed(2)}</span>
                  <div style={styles.cgpaMini}>
                    <div
                      style={{
                        ...styles.cgpaMiniFill,
                        width: `${Math.min(((s.CGPA - 3.5) / 0.5) * 100, 100)}%`,
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

const styles = {
  page: { display: "flex", flexDirection: "column", gap: 20, maxWidth: 1000 },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
  },
  pageLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(0,0,0,0.35)",
    letterSpacing: 3,
    textTransform: "uppercase",
    margin: 0,
  },
  pageTitle: {
    fontSize: 42,
    fontWeight: 900,
    color: BLACK,
    margin: "4px 0 0",
    letterSpacing: -1,
    fontFamily: "'Barlow Condensed','Arial Black',sans-serif",
  },
  pageSub: {
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(0,0,0,0.4)",
    margin: "6px 0 0",
  },
  headerActions: { display: "flex", gap: 12, flexShrink: 0, flexWrap: "wrap" },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 20px",
    borderRadius: 12,
    border: "none",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    transition: "all 0.18s",
    letterSpacing: 0.3,
    boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
  },
  successBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(22,163,74,0.1)",
    border: "1.5px solid rgba(22,163,74,0.3)",
    color: GREEN,
    borderRadius: 12,
    padding: "12px 18px",
    fontSize: 14,
    fontWeight: 800,
  },

  headerCard: {
    background: YELLOW,
    borderRadius: 24,
    padding: "28px 32px",
    position: "relative",
    overflow: "hidden",
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
  headerCardInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 1,
    gap: 20,
    flexWrap: "wrap",
  },
  headerCardLeft: { display: "flex", alignItems: "center", gap: 16 },
  medalBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: RED,
    color: WHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(200,41,58,0.35)",
  },
  headerCardTitle: {
    fontSize: 36,
    fontWeight: 900,
    color: RED,
    margin: 0,
    fontFamily: "'Barlow Condensed','Arial Black',sans-serif",
    letterSpacing: -1,
  },
  headerCardSub: {
    fontSize: 13,
    fontWeight: 700,
    color: "rgba(0,0,0,0.5)",
    margin: "4px 0 0",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerBadges: { display: "flex", gap: 8, marginTop: 8 },
  minBadge: {
    background: BLACK,
    color: YELLOW,
    fontSize: 11,
    fontWeight: 900,
    padding: "4px 12px",
    borderRadius: 50,
    letterSpacing: 1,
  },
  countBadge: {
    background: "rgba(0,0,0,0.12)",
    color: BLACK,
    fontSize: 11,
    fontWeight: 800,
    padding: "4px 12px",
    borderRadius: 50,
  },
  headerCardStat: { textAlign: "center" },
  bigNum: {
    fontSize: 64,
    fontWeight: 900,
    color: WHITE,
    margin: 0,
    lineHeight: 1,
    fontFamily: "'Barlow Condensed','Arial Black',sans-serif",
  },
  bigNumLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(0,0,0,0.5)",
    margin: "2px 0 0",
  },
  bigNumSub: {
    fontSize: 10,
    fontWeight: 700,
    color: "rgba(0,0,0,0.35)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  filtersCol: { display: "flex", flexDirection: "column", gap: 12 },
  filterGroup: { display: "flex", flexDirection: "column", gap: 6 },
  filterLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(0,0,0,0.45)",
    letterSpacing: 2,
    textTransform: "uppercase",
    margin: 0,
  },
  chipRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  chip: {
    padding: "6px 12px",
    borderRadius: 50,
    border: "2px solid rgba(0,0,0,0.15)",
    background: "rgba(255,255,255,0.5)",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 800,
    color: BLACK,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  chipActive: { background: BLACK, color: WHITE, border: "2px solid " + BLACK },

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
  list: { display: "flex", flexDirection: "column", gap: 10 },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: "13px 20px",
    borderRadius: 16,
    background: WHITE,
    border: "2px solid rgba(0,0,0,0.05)",
    transition: "all 0.18s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  rowTop3: {
    border: "2px solid rgba(245,196,0,0.3)",
    background: "rgba(245,196,0,0.04)",
  },
  rowHover: {
    border: `2px solid ${YELLOW}`,
    transform: "translateX(4px)",
    boxShadow: "0 4px 18px rgba(245,196,0,0.2)",
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
    fontFamily: "'Barlow Condensed',Arial,sans-serif",
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
  regText: {
    width: 160,
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(0,0,0,0.4)",
    letterSpacing: 0.8,
    fontFamily: "monospace",
    flexShrink: 0,
  },
  batchChip: {
    width: 100,
    fontSize: 12,
    fontWeight: 800,
    color: BLACK,
    background: "rgba(245,196,0,0.25)",
    border: `1.5px solid ${YELLOW}`,
    padding: "4px 10px",
    borderRadius: 8,
    letterSpacing: 0.5,
    textAlign: "center",
    flexShrink: 0,
  },
  sectionChip: {
    width: 80,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 800,
    color: BLACK,
    background: "rgba(0,0,0,0.06)",
    padding: "4px 0",
    borderRadius: 8,
    letterSpacing: 1,
    flexShrink: 0,
  },
  cgpaBox: {
    width: 90,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
  },
  cgpaVal: {
    fontSize: 20,
    fontWeight: 900,
    color: BLACK,
    letterSpacing: -0.5,
    fontFamily: "'Barlow Condensed',Arial,sans-serif",
  },
  cgpaMini: {
    width: "100%",
    height: 4,
    background: "rgba(0,0,0,0.08)",
    borderRadius: 10,
    overflow: "hidden",
  },
  cgpaMiniFill: {
    height: "100%",
    background: YELLOW,
    borderRadius: 10,
    transition: "width 0.5s ease",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: "60px 0",
    color: "rgba(0,0,0,0.3)",
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
  },
};
