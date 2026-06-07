import { useState, useEffect } from "react";
import axios from "axios";

const YELLOW = "#F5C400";
const BLACK = "#111111";
const WHITE = "#FFFFFF";
const RED = "#C8293A";
const GREEN = "#16a34a";
const BLUE = "#2563eb";

const STATUSES = ["All", "PENDING", "REVIEWED", "APPROVED", "REJECTED"];
// Change this line at the top of ProjectManagement.jsx
const BASE = "http://localhost:5000/api/admin";
const IconBook = () => (
  <svg
    width="20"
    height="20"
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
const IconX = () => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconAI = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
  </svg>
);
const IconChevron = ({ open }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
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
);
const IconSearch = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconTrophy = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
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

const statusStyles = {
  PENDING: { bg: "rgba(0,0,0,0.07)", color: BLACK, label: "PENDING" },
  REVIEWED: { bg: "rgba(37,99,235,0.12)", color: BLUE, label: "REVIEWED" },
  APPROVED: { bg: "rgba(22,163,74,0.12)", color: GREEN, label: "APPROVED" },
  REJECTED: { bg: "rgba(200,41,58,0.12)", color: RED, label: "REJECTED" },
};

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("rankify_token")}` },
});
// const BASE = "http://localhost:5000/api/admin";

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState(["All"]);
  const [selBatch, setSelBatch] = useState("All");
  const [selStatus, setSelStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [approvals, setApprovals] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${BASE}/batches`, api());
      const names = res.data.data.map((b) => b.BATCH_NAME);
      setBatches(["All", ...names]);
    } catch (err) {
      console.error("Failed to load batches", err);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/all-projects`, api());
      const data = res.data.data || [];
      setProjects(data);
      setApprovals(
        data.reduce((acc, p) => ({ ...acc, [p.PROJECT_ID]: p.STATUS }), {}),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await axios.put(`${BASE}/projects/${id}/status`, { status }, api());
      setApprovals((a) => ({ ...a, [id]: status }));
      showSuccess(`✅ Project ${status.toLowerCase()} successfully`);
    } catch (err) {
      alert("Failed: " + (err.response?.data?.message || err.message));
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const filtered = projects.filter((p) => {
    const matchBatch = selBatch === "All" || p.BATCH_NAME === selBatch;
    const matchStatus =
      selStatus === "All" || approvals[p.PROJECT_ID] === selStatus;
    const matchSearch =
      !search ||
      p.TITLE?.toLowerCase().includes(search.toLowerCase()) ||
      p.FULL_NAME?.toLowerCase().includes(search.toLowerCase());
    return matchBatch && matchStatus && matchSearch;
  });

  /* Stats */
  const stats = {
    total: projects.length,
    pending: projects.filter((p) => approvals[p.PROJECT_ID] === "PENDING")
      .length,
    approved: projects.filter((p) => approvals[p.PROJECT_ID] === "APPROVED")
      .length,
    reviewed: projects.filter((p) => approvals[p.PROJECT_ID] === "REVIEWED")
      .length,
  };

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <p style={styles.pageLabel}>ADMIN PANEL</p>
          <h1 style={styles.pageTitle}>
            Project <span style={{ color: YELLOW }}>Management</span>
          </h1>
          <p style={styles.pageSub}>
            View all projects, approve or reject, see AI scores.
          </p>
        </div>
        {/* Mini stats */}
        <div style={styles.miniStats}>
          {[
            { label: "Total", val: stats.total, color: BLACK },
            { label: "Pending", val: stats.pending, color: RED },
            { label: "Reviewed", val: stats.reviewed, color: BLUE },
            { label: "Approved", val: stats.approved, color: GREEN },
          ].map((s) => (
            <div
              key={s.label}
              style={{ ...styles.miniStat, borderTop: `4px solid ${s.color}` }}
            >
              <span style={{ ...styles.miniStatVal, color: s.color }}>
                {s.val}
              </span>
              <span style={styles.miniStatLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Success Banner */}
      {successMsg && (
        <div style={styles.successBanner}>
          <IconCheck /> {successMsg}
        </div>
      )}

      {/* Filters */}
      <div style={styles.filtersRow}>
        {/* Search */}
        <div style={styles.searchBox}>
          <IconSearch />
          <input
            style={styles.searchInput}
            placeholder="Search by project title or student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* Batch filter */}
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>BATCH:</span>
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
        {/* Status filter */}
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>STATUS:</span>
          <div style={styles.chipRow}>
            {STATUSES.map((s) => (
              <button
                key={s}
                style={{
                  ...styles.chip,
                  ...(selStatus === s ? styles.chipActive : {}),
                }}
                onClick={() => setSelStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p style={styles.resultsCount}>
        Showing <strong>{filtered.length}</strong> of {projects.length} projects
      </p>

      {/* Projects List */}
      {loading ? (
        <div style={styles.emptyState}>Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div style={styles.emptyState}>
          <IconBook />
          <p>No projects found for this filter.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {filtered.map((p, i) => {
            const status = approvals[p.PROJECT_ID] || p.STATUS;
            const ss = statusStyles[status] || statusStyles.PENDING;
            const isExp = expanded === p.PROJECT_ID;
            const isHov = hoveredRow === i;

            return (
              <div
                key={p.PROJECT_ID}
                style={{
                  ...styles.card,
                  ...(isExp ? styles.cardExpanded : {}),
                  ...(isHov && !isExp ? styles.cardHover : {}),
                }}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {/* Card Top Row */}
                <div style={styles.cardTop}>
                  {/* Rank */}
                  <div style={styles.rankNum}>#{i + 1}</div>

                  {/* Title + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={styles.cardTitle}>{p.TITLE}</h3>
                    <div style={styles.cardMeta}>
                      <span style={styles.studentName}>{p.FULL_NAME}</span>
                      <span style={styles.batchChip}>{p.BATCH_NAME}</span>
                      <span style={styles.sectionChip}>{p.SECTION_NAME}</span>
                      <span style={styles.semChip}>{p.SEMESTER}</span>
                    </div>
                  </div>

                  {/* AI Score */}
                  <div style={styles.scoreBox}>
                    <div style={styles.scoreBoxInner}>
                      <span style={styles.scoreIcon}>
                        <IconAI />
                      </span>
                      <span style={styles.scoreVal}>{p.AI_SCORE || "—"}</span>
                    </div>
                    <span style={styles.scoreLabel}>AI Score</span>
                  </div>

                  {/* Final Score */}
                  <div style={styles.scoreBox}>
                    <div
                      style={{
                        ...styles.scoreBoxInner,
                        background: "rgba(245,196,0,0.15)",
                      }}
                    >
                      <span style={styles.scoreIcon}>
                        <IconTrophy />
                      </span>
                      <span style={styles.scoreVal}>
                        {p.FINAL_SCORE || "—"}
                      </span>
                    </div>
                    <span style={styles.scoreLabel}>Final</span>
                  </div>

                  {/* Status */}
                  <span
                    style={{
                      ...styles.statusChip,
                      background: ss.bg,
                      color: ss.color,
                    }}
                  >
                    {ss.label}
                  </span>

                  {/* Actions */}
                  <div style={styles.actions}>
                    <button
                      style={styles.expandBtn}
                      onClick={() => setExpanded(isExp ? null : p.PROJECT_ID)}
                    >
                      Details <IconChevron open={isExp} />
                    </button>
                    {status !== "APPROVED" && (
                      <button
                        style={styles.approveBtn}
                        onClick={() => handleStatus(p.PROJECT_ID, "APPROVED")}
                      >
                        <IconCheck />
                      </button>
                    )}
                    {status !== "REJECTED" && (
                      <button
                        style={styles.rejectBtn}
                        onClick={() => handleStatus(p.PROJECT_ID, "REJECTED")}
                      >
                        <IconX />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExp && (
                  <div style={styles.expandedBody}>
                    <div style={styles.expandDivider} />
                    <div style={styles.expandGrid}>
                      <div style={styles.expandCol}>
                        <span style={styles.expandLabel}>MEMBERS</span>
                        <div
                          style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                        >
                          {p.MEMBERS ? (
                            p.MEMBERS.split(",").map((m, i) => (
                              <span
                                key={i}
                                style={{
                                  background: "rgba(245,196,0,0.25)",
                                  border: "1.5px solid #F5C400",
                                  borderRadius: 50,
                                  padding: "4px 12px",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: BLACK,
                                }}
                              >
                                {m.trim()}
                              </span>
                            ))
                          ) : (
                            <span style={styles.expandValue}>—</span>
                          )}
                        </div>
                      </div>
                      <div style={styles.expandCol}>
                        <span style={styles.expandLabel}>DESCRIPTION</span>
                        <p style={styles.expandValue}>
                          {p.DESCRIPTION || "No description provided."}
                        </p>
                      </div>
                      <div style={styles.expandCol}>
                        <span style={styles.expandLabel}>SUBMITTED</span>
                        <span style={styles.expandValue}>
                          {p.SUBMITTED_AT || "—"}
                        </span>
                      </div>
                      <div style={styles.expandCol}>
                        <span style={styles.expandLabel}>AI SCORE</span>
                        <span
                          style={{
                            ...styles.expandValue,
                            fontSize: 28,
                            fontWeight: 900,
                            color: RED,
                          }}
                        >
                          {p.AI_SCORE || "Not scored"}
                        </span>
                      </div>
                      <div style={styles.expandCol}>
                        <span style={styles.expandLabel}>FINAL SCORE</span>
                        <span
                          style={{
                            ...styles.expandValue,
                            fontSize: 28,
                            fontWeight: 900,
                            color: YELLOW,
                          }}
                        >
                          {p.FINAL_SCORE || "Pending"}
                        </span>
                      </div>
                    </div>
                    {/* Quick approve/reject buttons at bottom */}
                    <div style={styles.expandActions}>
                      <button
                        style={{
                          ...styles.bigApproveBtn,
                          opacity: status === "APPROVED" ? 0.5 : 1,
                        }}
                        onClick={() => handleStatus(p.PROJECT_ID, "APPROVED")}
                        disabled={status === "APPROVED"}
                      >
                        <IconCheck /> Approve Project
                      </button>
                      <button
                        style={{
                          ...styles.bigRejectBtn,
                          opacity: status === "REJECTED" ? 0.5 : 1,
                        }}
                        onClick={() => handleStatus(p.PROJECT_ID, "REJECTED")}
                        disabled={status === "REJECTED"}
                      >
                        <IconX /> Reject Project
                      </button>
                      <button
                        style={styles.bigReviewBtn}
                        onClick={() => handleStatus(p.PROJECT_ID, "REVIEWED")}
                      >
                        Mark as Reviewed
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  // page: { display: "flex", flexDirection: "column", gap: 20, maxWidth: 1050 },
  // pageHeader: {
  //   display: "flex",
  //   alignItems: "flex-start",
  //   justifyContent: "space-between",
  //   gap: 20,
  //   flexWrap: "wrap",
  // },

  page: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    width: "100%", // ← was maxWidth: 1050, change to full width
    boxSizing: "border-box",
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
  miniStats: { display: "flex", gap: 12, flexShrink: 0, flexWrap: "wrap" },
  miniStat: {
    background: WHITE,
    borderRadius: 14,
    padding: "12px 18px",
    textAlign: "center",
    boxShadow: "0 3px 12px rgba(0,0,0,0.07)",
    minWidth: 72,
  },
  miniStatVal: {
    display: "block",
    fontSize: 28,
    fontWeight: 900,
    lineHeight: 1,
    fontFamily: "'Barlow Condensed',Arial,sans-serif",
  },
  miniStatLabel: {
    display: "block",
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(0,0,0,0.35)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: 3,
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

  filtersRow: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: WHITE,
    borderRadius: 20,
    padding: "20px 24px",
    boxShadow: "0 3px 14px rgba(0,0,0,0.06)",
    border: "1.5px solid rgba(0,0,0,0.06)",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fafafa",
    border: "2px solid rgba(0,0,0,0.1)",
    borderRadius: 12,
    padding: "10px 14px",
  },
  searchInput: {
    flex: 1,
    border: "none",
    background: "transparent",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 600,
    color: BLACK,
    outline: "none",
  },
  filterGroup: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: 800,
    color: "rgba(0,0,0,0.4)",
    letterSpacing: 2,
    textTransform: "uppercase",
    flexShrink: 0,
  },
  chipRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  chip: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "2px solid rgba(0,0,0,0.1)",
    background: "#f5f5f5",
    fontFamily: "inherit",
    fontSize: 11,
    fontWeight: 800,
    color: "rgba(0,0,0,0.45)",
    cursor: "pointer",
    letterSpacing: 0.8,
    transition: "all 0.15s",
  },
  chipActive: { background: BLACK, color: WHITE, border: "2px solid " + BLACK },

  resultsCount: {
    fontSize: 13,
    fontWeight: 600,
    color: "rgba(0,0,0,0.4)",
    margin: 0,
  },

  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: {
    background: WHITE,
    borderRadius: 20,
    padding: "18px 22px",
    border: "2px solid rgba(0,0,0,0.05)",
    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
    transition: "all 0.2s ease",
  },
  cardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    border: `2px solid ${YELLOW}`,
  },
  cardExpanded: {
    boxShadow: "0 10px 32px rgba(245,196,0,0.2)",
    border: `2px solid ${YELLOW}`,
  },
  cardTop: { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  rankNum: {
    fontSize: 18,
    fontWeight: 900,
    color: "rgba(0,0,0,0.2)",
    flexShrink: 0,
    width: 32,
    fontFamily: "'Barlow Condensed',Arial,sans-serif",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 900,
    color: BLACK,
    margin: 0,
    letterSpacing: -0.3,
    fontFamily: "'Barlow Condensed','Arial Black',sans-serif",
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 5,
    flexWrap: "wrap",
  },
  studentName: { fontSize: 13, fontWeight: 700, color: "rgba(0,0,0,0.55)" },
  batchChip: {
    fontSize: 11,
    fontWeight: 800,
    color: BLACK,
    background: "rgba(245,196,0,0.25)",
    padding: "3px 9px",
    borderRadius: 6,
    letterSpacing: 0.8,
  },
  sectionChip: {
    fontSize: 11,
    fontWeight: 800,
    color: BLACK,
    background: "rgba(0,0,0,0.07)",
    padding: "3px 9px",
    borderRadius: 6,
    letterSpacing: 1,
  },
  semChip: {
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(0,0,0,0.35)",
    padding: "3px 0",
  },
  scoreBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    flexShrink: 0,
  },
  scoreBoxInner: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    background: "rgba(200,41,58,0.08)",
    borderRadius: 10,
    padding: "7px 12px",
  },
  scoreIcon: { color: RED, display: "flex" },
  scoreVal: {
    fontSize: 20,
    fontWeight: 900,
    color: BLACK,
    fontFamily: "'Barlow Condensed',Arial,sans-serif",
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "rgba(0,0,0,0.4)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statusChip: {
    fontSize: 11,
    fontWeight: 900,
    padding: "6px 14px",
    borderRadius: 8,
    letterSpacing: 1,
    flexShrink: 0,
  },
  actions: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  expandBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "8px 14px",
    borderRadius: 8,
    border: "2px solid rgba(0,0,0,0.1)",
    background: WHITE,
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 800,
    color: BLACK,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  approveBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "none",
    background: "rgba(22,163,74,0.12)",
    color: GREEN,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s",
  },
  rejectBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "none",
    background: "rgba(200,41,58,0.1)",
    color: RED,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s",
  },

  expandedBody: { marginTop: 8 },
  expandDivider: {
    height: 2,
    background: "rgba(0,0,0,0.06)",
    borderRadius: 2,
    margin: "12px 0",
  },
  expandGrid: { display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16 },
  expandCol: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
    minWidth: 160,
  },
  expandLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(0,0,0,0.4)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  expandValue: { fontSize: 14, fontWeight: 700, color: BLACK, lineHeight: 1.5 },
  expandActions: { display: "flex", gap: 10, flexWrap: "wrap" },
  bigApproveBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "11px 20px",
    borderRadius: 10,
    border: "none",
    background: GREEN,
    color: WHITE,
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  bigRejectBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "11px 20px",
    borderRadius: 10,
    border: "none",
    background: RED,
    color: WHITE,
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  bigReviewBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "11px 20px",
    borderRadius: 10,
    border: "2px solid rgba(0,0,0,0.12)",
    background: WHITE,
    color: BLACK,
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    transition: "all 0.15s",
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
