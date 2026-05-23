import { useState, useEffect, useRef } from "react";
import axios from "axios";

const YELLOW = "#F5C400";
const RED = "#C8293A";
const BLACK = "#111111";
const WHITE = "#FFFFFF";

const BATCHES = ["BSCS-4", "BSSE-4", "BSCS-3"];
const BATCH_IDS = { "BSCS-4": 1, "BSSE-4": 2, "BSCS-3": 3 };

/* ─── Icons ─── */
const IconChart = () => (
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
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
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
const IconGithub = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
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
      transition: "transform 0.2s ease",
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconPlus = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const IconStar = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconUsers = () => (
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
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconAI = () => (
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
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
  </svg>
);

/* ─── Small Dropdown ─── */
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
    <div ref={ref} style={{ position: "relative" }}>
      <button style={styles.dropBtn} onClick={() => setOpen(!open)}>
        <span style={styles.dropBtnLabel}>{label}:</span>
        <span style={styles.dropBtnVal}>{value}</span>
        <IconChevron open={open} />
      </button>
      {open && (
        <div style={styles.dropMenu}>
          {options.map((o) => (
            <button
              key={o}
              style={{
                ...styles.dropOpt,
                ...(o === value ? styles.dropOptActive : {}),
              }}
              onClick={() => {
                onChange(o);
                setOpen(false);
              }}
            >
              {o === value && (
                <span style={{ color: YELLOW, marginRight: 6 }}>✓</span>
              )}
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Project Card ─── */
function ProjectCard({ project, rank }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const rankColors = { 1: "#FFD700", 2: "#C0C0C0", 3: "#CD7F32" };
  const rankColor = rankColors[rank] || RED;
  const isTop3 = rank <= 3;

  return (
    <div
      style={{
        ...styles.card,
        ...(hovered && !expanded ? styles.cardHover : {}),
        ...(expanded ? styles.cardExpanded : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.cardTop}>
        {/* Rank */}
        <div
          style={{
            ...styles.rankBadge,
            background: rankColor,
            color: rank <= 2 ? "#111" : "#fff",
            boxShadow: isTop3 ? `0 4px 14px ${rankColor}88` : "none",
          }}
        >
          {isTop3 && (
            <span style={{ marginRight: 3 }}>
              <IconStar />
            </span>
          )}
          #{rank}
        </div>

        {/* Title + meta */}
        <div style={{ flex: 1 }}>
          <h3 style={styles.cardTitle}>{project.title}</h3>
          <div style={styles.cardMeta}>
            <span style={styles.sectionChip}>{project.section}</span>
            <span
              style={{
                ...styles.statusChip,
                background:
                  project.status === "APPROVED"
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(245,196,0,0.2)",
                color: project.status === "APPROVED" ? "#16a34a" : "#92600a",
                border: `1.5px solid ${project.status === "APPROVED" ? "#16a34a44" : "#F5C40044"}`,
              }}
            >
              {project.status}
            </span>
          </div>
        </div>

        {/* Score */}
        <div style={styles.scoreBox}>
          <span style={styles.scoreVal}>{project.score || "—"}</span>
          <span style={styles.scoreLabel}>Score</span>
        </div>

        {/* Toggle */}
        <button
          style={{
            ...styles.descBtn,
            ...(expanded ? styles.descBtnActive : {}),
          }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Close" : "Description"}
          <span style={{ marginLeft: 6, display: "inline-flex" }}>
            <IconChevron open={expanded} />
          </span>
        </button>
      </div>

      {/* Expanded */}
      {expanded && (
        <div style={styles.expandedBody}>
          <div style={styles.expandDivider} />
          <div style={styles.expandGrid}>
            <div style={styles.expandSection}>
              <div style={styles.expandLabel}>
                <IconUsers />
                &nbsp; Members
              </div>
              <div style={styles.memberList}>
                {project.members.map((m, i) => (
                  <span key={i} style={styles.memberPill}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
            <div style={styles.expandSection}>
              <div style={styles.expandLabel}>📋&nbsp; Description</div>
              <p style={styles.expandDesc}>{project.description}</p>
            </div>
            {project.github && (
              <div style={styles.expandSection}>
                <div style={styles.expandLabel}>
                  <IconGithub />
                  &nbsp; GitHub Link
                </div>
                <a
                  href={project.github}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.githubLink}
                >
                  {project.github}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Add Project Form ─── */
function AddProjectView({ user, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    batch: "BSCS-4",
    members: "",
    description: "",
    github: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [aiScore, setAiScore] = useState(null);
  const [feedback, setFeedback] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Project name is required";
    if (!form.members.trim()) e.members = "At least one member required";
    if (!form.description.trim()) e.description = "Description is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("rankify_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Submit project
      await axios.post(
        "http://localhost:5000/api/projects",
        {
          title: form.title,
          description: `${form.description} | Members: ${form.members} | GitHub: ${form.github}`,
          student_id: user.user_id,
          batch_id: BATCH_IDS[form.batch] || 1,
          section_id: 1,
          semester: "Spring-2026",
        },
        { headers },
      );

      // Get AI score
      const aiRes = await axios.post(
        "http://localhost:5000/api/ai/score-project",
        {
          title: form.title,
          description: form.description,
        },
        { headers },
      );

      setAiScore(aiRes.data.score);
      setFeedback(aiRes.data.feedback);
      onSuccess({ score: aiRes.data.score, feedback: aiRes.data.feedback });
    } catch (err) {
      alert(
        "Submission failed: " + (err.response?.data?.message || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.addForm}>
      <div style={styles.formHeader}>
        <span style={styles.formHeaderIcon}>
          <IconPlus />
        </span>
        Enter Project Details
      </div>

      <div style={styles.formBody}>
        {/* Batch chips */}
        <div style={styles.formRow}>
          <label style={styles.formLabel}>Batch:</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {BATCHES.map((b) => (
              <button
                key={b}
                style={{
                  ...styles.batchChip,
                  ...(form.batch === b ? styles.batchChipActive : {}),
                }}
                onClick={() => set("batch", b)}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Project Name */}
        <div style={styles.formRow}>
          <label style={styles.formLabel}>Project Name:</label>
          <input
            style={{
              ...styles.input,
              ...(errors.title ? styles.inputErr : {}),
            }}
            placeholder="e.g: Smart Attendance System"
            value={form.title}
            onChange={(e) => {
              set("title", e.target.value);
              setErrors((er) => ({ ...er, title: "" }));
            }}
          />
          {errors.title && <span style={styles.err}>{errors.title}</span>}
        </div>

        {/* Members */}
        <div style={styles.formRow}>
          <label style={styles.formLabel}>Members:</label>
          <input
            style={{
              ...styles.input,
              ...(errors.members ? styles.inputErr : {}),
            }}
            placeholder="e.g: Ali Hassan, Fatima Malik, Usman Tariq"
            value={form.members}
            onChange={(e) => {
              set("members", e.target.value);
              setErrors((er) => ({ ...er, members: "" }));
            }}
          />
          {errors.members && <span style={styles.err}>{errors.members}</span>}
        </div>

        {/* Description */}
        <div style={styles.formRow}>
          <label style={styles.formLabel}>Description:</label>
          <textarea
            style={{
              ...styles.input,
              ...styles.textarea,
              ...(errors.description ? styles.inputErr : {}),
            }}
            placeholder="Brief description of your project..."
            value={form.description}
            onChange={(e) => {
              set("description", e.target.value);
              setErrors((er) => ({ ...er, description: "" }));
            }}
          />
          {errors.description && (
            <span style={styles.err}>{errors.description}</span>
          )}
        </div>

        {/* GitHub */}
        <div style={styles.formRow}>
          <label style={styles.formLabel}>GitHub Link:</label>
          <input
            style={styles.input}
            placeholder="https://github.com/your-repo"
            value={form.github}
            onChange={(e) => set("github", e.target.value)}
          />
        </div>

        <button
          style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <IconAI /> Submitting & Scoring with AI...
            </>
          ) : (
            <>
              <IconPlus /> Add Project
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─── Success View ─── */
function SuccessView({ onBack, score, feedback }) {
  return (
    <div style={styles.successBox}>
      <div style={styles.successIcon}>
        <IconCheck />
      </div>
      <h2 style={styles.successTitle}>Project Submitted!</h2>
      {score && (
        <div style={styles.aiScoreBox}>
          <p style={styles.aiScoreLabel}>🤖 AI Score</p>
          <p style={styles.aiScoreNum}>
            {score}
            <span style={{ fontSize: 20 }}>/100</span>
          </p>
          {feedback && <p style={styles.aiFeedback}>"{feedback}"</p>}
        </div>
      )}
      <p style={styles.successSub}>
        Your project has been added and is pending faculty review.
      </p>
      <button style={styles.submitBtn} onClick={onBack}>
        ← Back to Projects
      </button>
    </div>
  );
}

/* ─── Main Component ─── */
export default function ProjectsPage({ user }) {
  const [view, setView] = useState("review");
  const [selBatch, setSelBatch] = useState("BSCS-4");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    if (view === "review") fetchProjects();
  }, [selBatch, view]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("rankify_token");
      const batchId = BATCH_IDS[selBatch];
      const res = await axios.get(
        `http://localhost:5000/api/projects/top/${batchId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const mapped = (res.data.data || []).map((p, i) => ({
        id: p.PROJECT_ID,
        title: p.TITLE,
        members: [p.FULL_NAME],
        description: p.DESCRIPTION || "No description provided.",
        github: "",
        score: p.FINAL_SCORE || p.AI_SCORE || 0,
        section: p.SECTION_NAME,
        status: p.STATUS,
        rank: i + 1,
      }));
      setProjects(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (data) => {
    setSuccessData(data);
    setView("success");
  };

  return (
    <div style={styles.wrapper}>
      {/* Top action bar */}
      <div style={styles.topBar}>
        <div style={styles.tabGroup}>
          <button
            style={{
              ...styles.tabBtn,
              ...(view === "review" ? styles.tabBtnActive : {}),
            }}
            onClick={() => setView("review")}
          >
            Review Projects
          </button>
          <button
            style={{
              ...styles.tabBtn,
              ...(view === "add" || view === "success"
                ? styles.tabBtnActive
                : {}),
            }}
            onClick={() => setView("add")}
          >
            <IconPlus /> ADD Project
          </button>
        </div>

        {view === "review" && (
          <Dropdown
            label="Batch"
            options={BATCHES}
            value={selBatch}
            onChange={setSelBatch}
          />
        )}
      </div>

      {/* ── REVIEW VIEW ── */}
      {view === "review" && (
        <div style={styles.reviewSection}>
          <div style={styles.reviewHeader}>
            <div>
              <h2 style={styles.reviewTitle}>Top Projects</h2>
              <p style={styles.reviewSub}>
                Batch <strong>{selBatch}</strong> · Top 6 ranked by score
              </p>
            </div>
            <div style={styles.reviewStats}>
              <span style={styles.statPill}>
                🏆 {loading ? "..." : projects.length} Projects
              </span>
            </div>
          </div>

          {loading ? (
            <div style={styles.emptyState}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div style={styles.emptyState}>
              No projects found for this batch.
            </div>
          ) : (
            <div style={styles.cardList}>
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} rank={p.rank} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADD VIEW ── */}
      {view === "add" && (
        <AddProjectView user={user} onSuccess={handleSuccess} />
      )}

      {/* ── SUCCESS VIEW ── */}
      {view === "success" && (
        <SuccessView
          onBack={() => setView("review")}
          score={successData?.score}
          feedback={successData?.feedback}
        />
      )}
    </div>
  );
}

/* ─── Styles ─── */
const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
    maxWidth: 860,
    width: "100%",
  },

  /* TOP BAR */
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexShrink: 0,
  },
  tabGroup: { display: "flex", gap: 12 },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 24px",
    borderRadius: 12,
    border: "2px solid rgba(0,0,0,0.12)",
    background: WHITE,
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 800,
    color: "rgba(0,0,0,0.5)",
    cursor: "pointer",
    letterSpacing: 0.5,
    transition: "all 0.18s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  },
  tabBtnActive: {
    background: BLACK,
    color: WHITE,
    border: "2px solid " + BLACK,
    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
  },

  /* DROPDOWN */
  dropBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    borderRadius: 12,
    border: "2px solid rgba(0,0,0,0.12)",
    background: WHITE,
    cursor: "pointer",
    fontFamily: "inherit",
    minWidth: 170,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    transition: "all 0.18s",
  },
  dropBtnLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(0,0,0,0.4)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  dropBtnVal: {
    flex: 1,
    fontSize: 15,
    fontWeight: 900,
    color: BLACK,
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
  dropOpt: {
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
  dropOptActive: { background: "rgba(245,196,0,0.15)" },

  /* REVIEW */
  reviewSection: { display: "flex", flexDirection: "column", gap: 18, flex: 1 },
  reviewHeader: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  reviewTitle: {
    fontSize: 36,
    fontWeight: 900,
    color: BLACK,
    margin: 0,
    letterSpacing: -1,
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },
  reviewSub: {
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(0,0,0,0.4)",
    margin: "4px 0 0",
    letterSpacing: 0.5,
  },
  reviewStats: { display: "flex", gap: 10 },
  statPill: {
    background: YELLOW,
    color: BLACK,
    fontSize: 13,
    fontWeight: 800,
    padding: "6px 16px",
    borderRadius: 50,
    letterSpacing: 0.5,
  },

  /* CARDS */
  cardList: { display: "flex", flexDirection: "column", gap: 14 },
  card: {
    background: YELLOW,
    borderRadius: 20,
    padding: "20px 24px",
    transition: "all 0.22s ease",
    border: "2px solid transparent",
    boxShadow: "0 3px 12px rgba(245,196,0,0.2)",
  },
  cardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 8px 28px rgba(245,196,0,0.35)",
    border: "2px solid rgba(0,0,0,0.08)",
  },
  cardExpanded: {
    boxShadow: "0 10px 36px rgba(245,196,0,0.4)",
    border: `2px solid ${YELLOW}`,
  },
  cardTop: { display: "flex", alignItems: "center", gap: 16 },
  rankBadge: {
    display: "flex",
    alignItems: "center",
    fontSize: 15,
    fontWeight: 900,
    padding: "6px 14px",
    borderRadius: 50,
    flexShrink: 0,
    fontFamily: "inherit",
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 900,
    color: BLACK,
    margin: 0,
    letterSpacing: -0.3,
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },
  cardMeta: { display: "flex", gap: 8, marginTop: 5, alignItems: "center" },
  sectionChip: {
    fontSize: 11,
    fontWeight: 800,
    color: BLACK,
    background: "rgba(0,0,0,0.1)",
    padding: "3px 10px",
    borderRadius: 6,
    letterSpacing: 1,
  },
  statusChip: {
    fontSize: 11,
    fontWeight: 800,
    padding: "3px 10px",
    borderRadius: 6,
    letterSpacing: 0.8,
  },
  scoreBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    padding: "8px 16px",
    minWidth: 60,
  },
  scoreVal: {
    fontSize: 26,
    fontWeight: 900,
    color: BLACK,
    lineHeight: 1,
    fontFamily: "'Barlow Condensed', Arial, sans-serif",
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "rgba(0,0,0,0.45)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  descBtn: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    borderRadius: 50,
    border: "none",
    background: RED,
    color: WHITE,
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    letterSpacing: 0.5,
    transition: "all 0.18s ease",
    flexShrink: 0,
    boxShadow: "0 3px 10px rgba(200,41,58,0.3)",
  },
  descBtnActive: { background: BLACK },

  /* EXPANDED */
  expandedBody: { marginTop: 16 },
  expandDivider: {
    height: 2,
    background: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    marginBottom: 18,
  },
  expandGrid: { display: "flex", gap: 24, flexWrap: "wrap" },
  expandSection: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flex: 1,
    minWidth: 200,
  },
  expandLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: 11,
    fontWeight: 800,
    color: "rgba(0,0,0,0.45)",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  memberList: { display: "flex", gap: 8, flexWrap: "wrap" },
  memberPill: {
    background: WHITE,
    color: BLACK,
    fontSize: 13,
    fontWeight: 800,
    padding: "6px 14px",
    borderRadius: 50,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  expandDesc: {
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(0,0,0,0.7)",
    margin: 0,
    lineHeight: 1.6,
  },
  githubLink: {
    fontSize: 13,
    fontWeight: 700,
    color: BLACK,
    textDecoration: "none",
    background: WHITE,
    padding: "7px 14px",
    borderRadius: 8,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    wordBreak: "break-all",
  },

  /* ADD FORM */
  addForm: {
    background: YELLOW,
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 6px 28px rgba(245,196,0,0.35)",
    maxWidth: 700,
  },
  formHeader: {
    background: RED,
    color: WHITE,
    fontSize: 22,
    fontWeight: 900,
    padding: "20px 32px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    letterSpacing: 0.5,
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },
  formHeaderIcon: {
    background: "rgba(255,255,255,0.2)",
    width: 36,
    height: 36,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  formBody: {
    padding: "28px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  formRow: { display: "flex", flexDirection: "column", gap: 6 },
  formLabel: {
    fontSize: 16,
    fontWeight: 800,
    color: BLACK,
    letterSpacing: 0.5,
  },
  input: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "2px solid rgba(0,0,0,0.12)",
    background: WHITE,
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 600,
    color: BLACK,
    outline: "none",
    transition: "border 0.18s",
    resize: "none",
  },
  textarea: { minHeight: 80 },
  inputErr: { border: `2px solid ${RED}` },
  err: { fontSize: 12, fontWeight: 700, color: RED, letterSpacing: 0.3 },
  batchChip: {
    padding: "8px 18px",
    borderRadius: 50,
    border: "2px solid rgba(0,0,0,0.15)",
    background: "rgba(255,255,255,0.5)",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 800,
    color: BLACK,
    cursor: "pointer",
    transition: "all 0.18s",
  },
  batchChipActive: {
    background: BLACK,
    color: YELLOW,
    border: "2px solid " + BLACK,
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 32px",
    borderRadius: 12,
    border: "none",
    background: BLACK,
    color: WHITE,
    fontFamily: "inherit",
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
    letterSpacing: 0.5,
    transition: "all 0.18s",
    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
    alignSelf: "flex-start",
  },

  /* SUCCESS */
  successBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    flex: 1,
    textAlign: "center",
    padding: "60px 0",
  },
  successIcon: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: YELLOW,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: BLACK,
    boxShadow: "0 8px 28px rgba(245,196,0,0.45)",
  },
  successTitle: {
    fontSize: 44,
    fontWeight: 900,
    color: BLACK,
    margin: 0,
    letterSpacing: -1,
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },
  successSub: {
    fontSize: 16,
    fontWeight: 600,
    color: "rgba(0,0,0,0.45)",
    margin: 0,
    maxWidth: 360,
  },
  aiScoreBox: {
    background: YELLOW,
    borderRadius: 20,
    padding: "24px 40px",
    textAlign: "center",
    boxShadow: "0 6px 24px rgba(245,196,0,0.4)",
  },
  aiScoreLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "rgba(0,0,0,0.5)",
    margin: "0 0 4px",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  aiScoreNum: {
    fontSize: 56,
    fontWeight: 900,
    color: BLACK,
    margin: 0,
    lineHeight: 1,
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },
  aiFeedback: {
    fontSize: 14,
    fontStyle: "italic",
    color: "rgba(0,0,0,0.6)",
    margin: "8px 0 0",
    maxWidth: 300,
  },

  emptyState: {
    textAlign: "center",
    padding: "48px 0",
    fontSize: 16,
    fontWeight: 700,
    color: "rgba(0,0,0,0.3)",
  },
};
