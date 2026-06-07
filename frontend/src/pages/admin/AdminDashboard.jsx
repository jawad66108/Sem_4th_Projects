import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CgpaUpload from "./CgpaUpload";
import UserManagement from "./UserManagement";
import AdminDeanList from "./AdminDeanList";
import ProjectManagement from "./ProjectManagement";

import axios from "axios";

const YELLOW = "#F5C400";
const BLACK = "#111111";
const WHITE = "#FFFFFF";
const RED = "#C8293A";

/* ─── Icons ─── */
const IconUsers = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconFaculty = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
    <path d="M7 8h.01M12 8h.01M17 8h.01" />
    <path d="M7 12h10" />
  </svg>
);
const IconShield = () => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const IconActivity = () => (
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
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconClock = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
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
const IconChart = () => (
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
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
const IconBook = () => (
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
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
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
    <path d="M12 10v4l2 2" />
  </svg>
);
const IconHome = () => (
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
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconPeople = () => (
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
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
const IconGithub = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.5-.3-5.2-1.3-5.2-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.3 11.3 0 0 1 6 0C17.3 5.5 18.3 5.8 18.3 5.8c.7 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.2 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6C20.2 21.4 23.5 17.1 23.5 12 23.5 5.7 18.3.5 12 .5z" />
  </svg>
);

const typeStyle = {
  UPDATE: { bg: "rgba(245,196,0,0.15)", color: BLACK },
  INSERT: { bg: "rgba(34,197,94,0.12)", color: "#16a34a" },
  DELETE: { bg: "rgba(200,41,58,0.12)", color: RED },
  STUDENTS: { bg: "rgba(0,0,0,0.07)", color: BLACK },
};

const navItems = [
  { id: "home", label: "Dashboard", icon: <IconHome /> },
  { id: "cgpa", label: "CGPA Upload", icon: <IconChart /> },
  { id: "users", label: "User Management", icon: <IconPeople /> },
  { id: "dean", label: "Dean List", icon: <IconMedal /> },
  { id: "projects", label: "Project Management", icon: <IconBook /> },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("home");
  const [hoveredNav, setHoveredNav] = useState(null);
  const [logoutHover, setLogoutHover] = useState(false);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [approvals, setApprovals] = useState({});
  const [expandedProject, setExpandedProject] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("rankify_user") || "{}");

  useEffect(() => {
    if (!user?.user_id) {
      navigate("/login");
      return;
    }
    if (user.role?.toLowerCase() !== "admin") {
      navigate("/login");
      return;
    }
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("rankify_token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, auditRes, projRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/stats", { headers }),
        axios.get("http://localhost:5000/api/admin/audit", { headers }),
        axios.get("http://localhost:5000/api/admin/pending-projects", {
          headers,
        }),
      ]);

      setStats(statsRes.data.data);
      setAuditLogs(auditRes.data.data || []);
      const projs = projRes.data.data || [];
      setPendingProjects(projs);
      setApprovals(
        projs.reduce((acc, p) => ({ ...acc, [p.PROJECT_ID]: null }), {}),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("rankify_token");
      await axios.put(
        `http://localhost:5000/api/admin/projects/${id}/status`,
        { status: "APPROVED" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setApprovals((a) => ({ ...a, [id]: "APPROVED" }));
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("rankify_token");
      await axios.put(
        `http://localhost:5000/api/admin/projects/${id}/status`,
        { status: "REJECTED" },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setApprovals((a) => ({ ...a, [id]: "REJECTED" }));
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const pendingCount = Object.values(approvals).filter(
    (v) => v === null,
  ).length;

  return (
    <div style={styles.shell}>
      {/* ── SIDEBAR ── */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarWatermark}>R</div>

        <div style={styles.brand}>
          <span style={styles.brandText}>RANKIFY</span>
          <span style={styles.brandPro}>PRO</span>
        </div>
        <p style={styles.brandSub}>ACADEMIC DASHBOARD</p>
        <div style={styles.sidebarDivider} />

        <nav style={styles.nav}>
          {navItems.map((n) => (
            <button
              key={n.id}
              style={{
                ...styles.navItem,
                ...(activeNav === n.id ? styles.navItemActive : {}),
                ...(hoveredNav === n.id && activeNav !== n.id
                  ? styles.navItemHover
                  : {}),
              }}
              onMouseEnter={() => setHoveredNav(n.id)}
              onMouseLeave={() => setHoveredNav(null)}
              onClick={() => setActiveNav(n.id)}
            >
              {n.icon}
              <span style={styles.navLabel}>{n.label}</span>
              {activeNav === n.id && <span style={styles.navDot} />}
            </button>
          ))}
        </nav>

        {/* Admin badge */}
        <div style={styles.adminBadge}>
          <div style={styles.adminAvatar}>A</div>
          <div style={styles.adminInfo}>
            <span style={styles.adminName}>{user.full_name || "Admin"}</span>
            <span style={styles.adminRole}>SUPER ADMIN</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <button
          style={{
            ...styles.logoutBtn,
            ...(logoutHover ? styles.logoutHoverStyle : {}),
          }}
          onMouseEnter={() => setLogoutHover(true)}
          onMouseLeave={() => setLogoutHover(false)}
          onClick={handleLogout}
        >
          <IconLogout /> Logout
        </button>
        <p style={styles.sidebarFooter}>© RANKIFY PRO</p>
      </aside>

      {/* ── MAIN ── */}
      <main style={styles.main}>
        {/* ── DASHBOARD HOME ── */}
        {activeNav === "home" && (
          <>
            {/* Header */}
            <header style={styles.pageHeader}>
              <div>
                <p style={styles.pagePortalLabel}>ACADEMIC PORTAL</p>
                <h1 style={styles.pageTitle}>
                  Admin <span style={{ color: YELLOW }}>Dashboard</span>
                </h1>
              </div>
              <div style={styles.headerIcons}>
                {[<IconChart />, <IconBook />, <IconMedal />].map((ico, i) => (
                  <div key={i} style={styles.headerIconBtn}>
                    {ico}
                  </div>
                ))}
              </div>
            </header>

            {/* Stat Cards */}
            <section style={styles.statsRow}>
              {[
                {
                  label: "TOTAL STUDENTS",
                  value: stats?.students ?? "—",
                  icon: <IconUsers />,
                  accent: YELLOW,
                },
                {
                  label: "TOTAL FACULTY",
                  value: stats?.faculty ?? "—",
                  icon: <IconFaculty />,
                  accent: RED,
                },
                {
                  label: "TOTAL ADMINS",
                  value: stats?.admins ?? "—",
                  icon: <IconShield />,
                  accent: BLACK,
                },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.statCard,
                    borderTop: `5px solid ${s.accent}`,
                  }}
                >
                  <div
                    style={{
                      ...styles.statIconBox,
                      background: s.accent,
                      color: s.accent === BLACK ? YELLOW : BLACK,
                    }}
                  >
                    {s.icon}
                  </div>
                  <div>
                    <p style={styles.statLabel}>{s.label}</p>
                    <p style={styles.statValue}>
                      {loading
                        ? "..."
                        : (s.value.toLocaleString?.() ?? s.value)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Pending card */}
              <div
                style={{
                  ...styles.statCard,
                  background: BLACK,
                  borderTop: `5px solid ${YELLOW}`,
                }}
              >
                <div
                  style={{
                    ...styles.statIconBox,
                    background: YELLOW,
                    color: BLACK,
                  }}
                >
                  <IconActivity />
                </div>
                <div>
                  <p
                    style={{
                      ...styles.statLabel,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    PENDING APPROVALS
                  </p>
                  <p style={{ ...styles.statValue, color: YELLOW }}>
                    {loading ? "..." : pendingCount}
                  </p>
                </div>
              </div>
            </section>

            {/* Bottom Grid */}
            <div style={styles.bottomGrid}>
              {/* Recent Audit Logs */}
              <section style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div style={styles.panelTitleRow}>
                    <div style={{ ...styles.panelIconBox, background: YELLOW }}>
                      <IconActivity />
                    </div>
                    <div>
                      <h2 style={styles.panelTitle}>Recent Audit Logs</h2>
                      <p style={styles.panelSub}>Last 5 database changes</p>
                    </div>
                  </div>
                  <span style={styles.countPill}>{auditLogs.length}</span>
                </div>

                <div style={styles.entryList}>
                  {loading ? (
                    <p style={{ color: "#aaa", fontSize: 14 }}>Loading...</p>
                  ) : auditLogs.length === 0 ? (
                    <p style={{ color: "#aaa", fontSize: 14 }}>
                      No audit logs yet.
                    </p>
                  ) : (
                    auditLogs.map((e, i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.entryRow,
                          ...(hoveredRow === `entry-${i}`
                            ? styles.entryRowHover
                            : {}),
                        }}
                        onMouseEnter={() => setHoveredRow(`entry-${i}`)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <span
                          style={{
                            ...styles.typeChip,
                            background:
                              typeStyle[e.OPERATION]?.bg || "rgba(0,0,0,0.07)",
                            color: typeStyle[e.OPERATION]?.color || BLACK,
                          }}
                        >
                          {e.OPERATION}
                        </span>

                        <div style={styles.entryInfo}>
                          <span style={styles.entryAction}>{e.TABLE_NAME}</span>
                          <span style={styles.entryDetail}>
                            {e.NEW_VALUE?.substring(0, 50) ||
                              e.OLD_VALUE?.substring(0, 50) ||
                              "—"}
                          </span>
                        </div>

                        <div style={styles.entryMeta}>
                          <span style={styles.entryBatch}>{e.CHANGED_BY}</span>
                          <span style={styles.entryTime}>
                            <IconClock /> {e.CHANGED_AT}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Pending Projects Panel */}
              <section style={styles.panel}>
                <div style={styles.panelHeader}>
                  <div style={styles.panelTitleRow}>
                    <div
                      style={{
                        ...styles.panelIconBox,
                        background: RED,
                        color: WHITE,
                      }}
                    >
                      <IconBook />
                    </div>
                    <div>
                      <h2 style={styles.panelTitle}>Pending Approvals</h2>
                      <p style={styles.panelSub}>Projects awaiting review</p>
                    </div>
                  </div>
                  {pendingCount > 0 && (
                    <span
                      style={{
                        ...styles.countPill,
                        background: RED,
                        color: WHITE,
                      }}
                    >
                      {pendingCount} pending
                    </span>
                  )}
                </div>

                <div style={styles.approvalList}>
                  {loading ? (
                    <p style={{ color: "#aaa", fontSize: 14 }}>Loading...</p>
                  ) : pendingProjects.length === 0 ? (
                    <p style={{ color: "#aaa", fontSize: 14 }}>
                      No pending projects.
                    </p>
                  ) : (
                    pendingProjects.map((p) => {
                      const status = approvals[p.PROJECT_ID];
                      const expanded = expandedProject === p.PROJECT_ID;

                      return (
                        <div
                          key={p.PROJECT_ID}
                          style={{
                            ...styles.approvalCard,
                            ...(status === "APPROVED"
                              ? styles.approvalApproved
                              : {}),
                            ...(status === "REJECTED"
                              ? styles.approvalRejected
                              : {}),
                          }}
                        >
                          <div style={styles.approvalTop}>
                            <div style={styles.approvalLeft}>
                              <span style={styles.approvalTitle}>
                                {p.TITLE}
                              </span>
                              <div style={styles.approvalMeta}>
                                <span style={styles.approvalBatch}>
                                  {p.BATCH_NAME}
                                </span>
                                <span style={styles.approvalSubject}>
                                  {p.SECTION_NAME}
                                </span>
                              </div>
                            </div>

                            {status === null ? (
                              <div style={styles.actionBtns}>
                                <button
                                  style={styles.btnToggle}
                                  onClick={() =>
                                    setExpandedProject(
                                      expanded ? null : p.PROJECT_ID,
                                    )
                                  }
                                >
                                  {expanded ? "Hide" : "Review"}
                                </button>
                                <button
                                  style={styles.btnApprove}
                                  onClick={() => handleApprove(p.PROJECT_ID)}
                                >
                                  <IconCheck /> Approve
                                </button>
                                <button
                                  style={styles.btnReject}
                                  onClick={() => handleReject(p.PROJECT_ID)}
                                >
                                  <IconX />
                                </button>
                              </div>
                            ) : (
                              <span
                                style={{
                                  ...styles.statusBadge,
                                  background:
                                    status === "APPROVED"
                                      ? "rgba(34,197,94,0.15)"
                                      : "rgba(200,41,58,0.12)",
                                  color:
                                    status === "APPROVED" ? "#16a34a" : RED,
                                }}
                              >
                                {status === "APPROVED"
                                  ? "✓ Approved"
                                  : "✗ Rejected"}
                              </span>
                            )}
                          </div>

                          {expanded && status === null && (
                            <div style={styles.expandedDetail}>
                              <div style={styles.expandDivider} />
                              <div style={styles.expandGrid}>
                                <div style={styles.expandCol}>
                                  <span style={styles.expandLabel}>
                                    STUDENT
                                  </span>
                                  <div style={styles.memberList}>
                                    <span style={styles.memberPill}>
                                      {p.FULL_NAME}
                                    </span>
                                  </div>
                                  {p.MEMBERS && (
                                    <div style={styles.memberList}>
                                      {p.MEMBERS.split(",").map((m, i) => (
                                        <span
                                          key={i}
                                          style={{
                                            ...styles.memberPill,
                                            background: "rgba(245,196,0,0.3)",
                                          }}
                                        >
                                          {m.trim()}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div style={styles.expandCol}>
                                  <span style={styles.expandLabel}>
                                    DESCRIPTION
                                  </span>
                                  <span style={styles.expandValue}>
                                    {p.DESCRIPTION?.substring(0, 80) || "—"}
                                  </span>
                                </div>
                                <div style={styles.expandCol}>
                                  <span style={styles.expandLabel}>
                                    AI SCORE
                                  </span>
                                  <span
                                    style={{
                                      ...styles.expandValue,
                                      fontSize: 22,
                                      fontWeight: 900,
                                      color: RED,
                                    }}
                                  >
                                    {p.AI_SCORE || "Not scored"}
                                  </span>
                                </div>
                                <div style={styles.expandCol}>
                                  <span style={styles.expandLabel}>
                                    SUBMITTED
                                  </span>
                                  <span style={styles.expandValue}>
                                    {p.SUBMITTED_AT || "—"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            </div>
          </>
        )}

        {activeNav === "cgpa" && <CgpaUpload />}

        {activeNav === "users" && <UserManagement />}

        {activeNav === "dean" && <AdminDeanList />}
        {activeNav === "projects" && <ProjectManagement />}
      </main>
    </div>
  );
}

/* ─── Styles ─── */
const styles = {
  shell: {
    display: "flex",
    minHeight: "100vh",
    width: "100vw",
    fontFamily: "'Barlow Condensed', 'Arial Black', Arial, sans-serif",
    background: WHITE,
    overflow: "hidden",
    height: "100vh",
  },

  sidebar: {
    width: 260,
    minWidth: 260,
    background: YELLOW,
    display: "flex",
    flexDirection: "column",
    padding: "36px 24px",
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
    fontSize: 34,
    fontWeight: 900,
    color: WHITE,
    letterSpacing: -1,
    textShadow: "2px 2px 0 rgba(0,0,0,0.12)",
    lineHeight: 1,
  },
  brandPro: {
    fontSize: 11,
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
    gap: 4,
    position: "relative",
    zIndex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "11px 14px",
    borderRadius: 12,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 14,
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
  navLabel: { flex: 1 },
  navDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: YELLOW,
    border: "2px solid " + BLACK,
    flexShrink: 0,
  },
  adminBadge: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(0,0,0,0.1)",
    borderRadius: 14,
    padding: "12px 14px",
    marginTop: 20,
    position: "relative",
    zIndex: 1,
  },
  adminAvatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: BLACK,
    color: YELLOW,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 900,
    flexShrink: 0,
  },
  adminInfo: { display: "flex", flexDirection: "column", gap: 2 },
  adminName: { fontSize: 13, fontWeight: 800, color: BLACK },
  adminRole: {
    fontSize: 10,
    fontWeight: 700,
    color: "rgba(0,0,0,0.5)",
    letterSpacing: 1.5,
  },
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
  logoutHoverStyle: {
    background: RED,
    color: WHITE,
    border: `2px solid ${RED}`,
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

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "36px 32px",
    overflowY: "auto",
    gap: 24,
    background: "#fafafa",
    boxSizing: "border-box",
    minWidth: 0,
    maxWidth: "calc(100vw - 260px)",
    overflow: "hidden auto",
  },

  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexShrink: 0,
  },
  pagePortalLabel: {
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
    lineHeight: 1.1,
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },
  headerIcons: { display: "flex", gap: 10, marginTop: 8 },
  headerIconBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    border: "2px solid rgba(0,0,0,0.1)",
    background: WHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "rgba(0,0,0,0.45)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },

  statsRow: { display: "flex", gap: 16, flexShrink: 0, flexWrap: "wrap" },
  statCard: {
    flex: "1 1 160px",
    background: WHITE,
    borderRadius: 20,
    padding: "20px 22px",
    display: "flex",
    alignItems: "center",
    gap: 16,
    boxShadow: "0 3px 14px rgba(0,0,0,0.07)",
    border: "1.5px solid rgba(0,0,0,0.06)",
    transition: "transform 0.18s",
  },
  statIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(0,0,0,0.4)",
    margin: 0,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: 36,
    fontWeight: 900,
    color: BLACK,
    margin: "2px 0 0",
    lineHeight: 1,
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },

  bottomGrid: {
    display: "flex",
    gap: 20,
    flex: 1,
    minHeight: 0,
    flexWrap: "wrap",
  },
  panel: {
    flex: "1 1 340px",
    background: WHITE,
    borderRadius: 24,
    padding: "24px 26px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
    border: "1.5px solid rgba(0,0,0,0.06)",
    minWidth: 0,
    overflowY: "auto",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  panelTitleRow: { display: "flex", alignItems: "center", gap: 12 },
  panelIconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: 900,
    color: BLACK,
    margin: 0,
    letterSpacing: -0.3,
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },
  panelSub: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(0,0,0,0.35)",
    margin: "2px 0 0",
  },
  countPill: {
    background: "rgba(245,196,0,0.25)",
    color: BLACK,
    fontSize: 12,
    fontWeight: 800,
    padding: "5px 14px",
    borderRadius: 50,
    letterSpacing: 0.5,
  },

  entryList: { display: "flex", flexDirection: "column", gap: 8 },
  entryRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 14,
    background: "#fafafa",
    border: "1.5px solid rgba(0,0,0,0.05)",
    transition: "all 0.18s ease",
    cursor: "default",
  },
  entryRowHover: {
    border: `1.5px solid ${YELLOW}`,
    background: "rgba(245,196,0,0.05)",
    transform: "translateX(3px)",
  },
  typeChip: {
    fontSize: 10,
    fontWeight: 900,
    padding: "4px 9px",
    borderRadius: 6,
    letterSpacing: 1,
    flexShrink: 0,
    textTransform: "uppercase",
  },
  entryInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    minWidth: 0,
  },
  entryAction: {
    fontSize: 13,
    fontWeight: 800,
    color: BLACK,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  entryDetail: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(0,0,0,0.4)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  entryMeta: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
    flexShrink: 0,
  },
  entryBatch: {
    fontSize: 10,
    fontWeight: 800,
    color: BLACK,
    background: "rgba(245,196,0,0.25)",
    padding: "2px 8px",
    borderRadius: 5,
    letterSpacing: 0.8,
  },
  entryTime: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(0,0,0,0.35)",
  },

  approvalList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
  },
  approvalCard: {
    background: YELLOW,
    borderRadius: 18,
    padding: "16px 18px",
    transition: "all 0.22s ease",
    boxShadow: "0 3px 12px rgba(245,196,0,0.2)",
    border: "2px solid transparent",
  },
  approvalApproved: {
    background: "rgba(34,197,94,0.08)",
    border: "2px solid rgba(34,197,94,0.25)",
    boxShadow: "none",
  },
  approvalRejected: {
    background: "rgba(200,41,58,0.05)",
    border: "2px solid rgba(200,41,58,0.18)",
    boxShadow: "none",
  },
  approvalTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  approvalLeft: { flex: 1, minWidth: 0 },
  approvalTitle: {
    fontSize: 16,
    fontWeight: 900,
    color: BLACK,
    display: "block",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    letterSpacing: -0.2,
  },
  approvalMeta: { display: "flex", gap: 8, marginTop: 5 },
  approvalBatch: {
    fontSize: 11,
    fontWeight: 800,
    color: BLACK,
    background: "rgba(0,0,0,0.12)",
    padding: "3px 9px",
    borderRadius: 6,
    letterSpacing: 0.8,
  },
  approvalSubject: {
    fontSize: 11,
    fontWeight: 700,
    color: "rgba(0,0,0,0.55)",
    padding: "3px 0",
  },
  actionBtns: { display: "flex", alignItems: "center", gap: 6, flexShrink: 0 },
  btnToggle: {
    padding: "7px 14px",
    borderRadius: 8,
    border: "2px solid rgba(0,0,0,0.18)",
    background: WHITE,
    color: BLACK,
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: 0.3,
    transition: "all 0.15s",
  },
  btnApprove: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "7px 14px",
    borderRadius: 8,
    border: "none",
    background: BLACK,
    color: WHITE,
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: 0.3,
    transition: "all 0.15s",
  },
  btnReject: {
    width: 34,
    height: 34,
    borderRadius: 8,
    border: "none",
    background: RED,
    color: WHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.15s",
    flexShrink: 0,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: 800,
    padding: "6px 14px",
    borderRadius: 8,
    flexShrink: 0,
  },

  expandedDetail: { marginTop: 4 },
  expandDivider: {
    height: 2,
    background: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    margin: "12px 0",
  },
  expandGrid: { display: "flex", gap: 20, flexWrap: "wrap" },
  expandCol: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: 1,
    minWidth: 140,
  },
  expandLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(0,0,0,0.45)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  expandValue: { fontSize: 13, fontWeight: 700, color: BLACK },
  memberList: { display: "flex", gap: 6, flexWrap: "wrap" },
  memberPill: {
    background: WHITE,
    color: BLACK,
    fontSize: 12,
    fontWeight: 800,
    padding: "5px 12px",
    borderRadius: 50,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },

  comingSoon: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  comingSoonTitle: { fontSize: 36, fontWeight: 900, color: BLACK, margin: 0 },
  comingSoonSub: { fontSize: 16, color: "rgba(0,0,0,0.4)", margin: 0 },
};
