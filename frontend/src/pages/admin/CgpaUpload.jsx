import { useState } from "react";
import axios from "axios";

const YELLOW = "#F5C400";
const BLACK = "#111111";
const WHITE = "#FFFFFF";
const RED = "#C8293A";
const GREEN = "#16a34a";

const SEMESTERS = ["Fall-2025", "Spring-2026", "Fall-2026"];

/* ─── Icons ─── */
const IconSearch = () => (
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
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="20"
    height="20"
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
const IconUpload = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill={YELLOW} stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const IconEdit = () => (
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
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

/* ─── Helper ─── */
const api = (token) => ({ headers: { Authorization: `Bearer ${token}` } });
const token = () => localStorage.getItem("rankify_token");

export default function CgpaUpload() {
  /* Search */
  const [regInput, setRegInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [foundStudent, setFoundStudent] = useState(null);
  const [searchErr, setSearchErr] = useState("");

  /* Update form */
  const [semester, setSemester] = useState("Fall-2025");
  const [sgpa, setSgpa] = useState("");
  const [newCgpa, setNewCgpa] = useState("");
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [updateErr, setUpdateErr] = useState("");

  /* Dean list download */
  const [dlSemester, setDlSemester] = useState("Fall-2025");
  const [downloading, setDownloading] = useState(false);

  /* ── Search student ── */
  const handleSearch = async () => {
    if (!regInput.trim()) {
      setSearchErr("Please enter a reg number");
      return;
    }
    setSearching(true);
    setSearchErr("");
    setFoundStudent(null);
    setSuccessMsg("");
    setUpdateErr("");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/student-by-reg/${regInput.trim()}`,
        api(token()),
      );
      setFoundStudent(res.data.data);
      setNewCgpa(res.data.data.CGPA?.toFixed(2) || "");
    } catch (err) {
      setSearchErr(err.response?.data?.message || "Student not found");
    } finally {
      setSearching(false);
    }
  };

  /* ── Update CGPA ── */
  const handleUpdate = async () => {
    if (!sgpa || !newCgpa) {
      setUpdateErr("Both SGPA and CGPA are required");
      return;
    }
    const sgpaNum = parseFloat(sgpa);
    const cgpaNum = parseFloat(newCgpa);
    if (isNaN(sgpaNum) || sgpaNum < 0 || sgpaNum > 4) {
      setUpdateErr("SGPA must be between 0 and 4");
      return;
    }
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 4) {
      setUpdateErr("CGPA must be between 0 and 4");
      return;
    }

    setUpdating(true);
    setUpdateErr("");
    setSuccessMsg("");
    try {
      const res = await axios.put(
        "http://localhost:5000/api/admin/update-cgpa",
        {
          student_id: foundStudent.STUDENT_ID,
          semester,
          sgpa: sgpaNum,
          cgpa: cgpaNum,
        },
        api(token()),
      );
      setSuccessMsg(res.data.message);
      setFoundStudent((f) => ({ ...f, CGPA: cgpaNum }));
    } catch (err) {
      setUpdateErr(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  /* ── Download dean list ── */
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/download-deanlist/${dlSemester}`,
        api(token()),
      );
      const rows = res.data.data;
      if (!rows.length) {
        alert("No dean list entries for this semester.");
        return;
      }

      // Build CSV
      const headers = [
        "Rank",
        "Full Name",
        "Reg Number",
        "Batch",
        "Section",
        "CGPA",
      ];
      const csvRows = rows.map((r, i) =>
        [
          i + 1,
          r.FULL_NAME,
          r.REG_NUMBER,
          r.BATCH_NAME,
          r.SECTION_NAME,
          r.CGPA?.toFixed(2),
        ].join(","),
      );
      const csv = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DeanList_${dlSemester}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed: " + err.message);
    } finally {
      setDownloading(false);
    }
  };

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

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <p style={styles.pageLabel}>ADMIN PANEL</p>
          <h1 style={styles.pageTitle}>
            CGPA <span style={{ color: YELLOW }}>Upload / Update</span>
          </h1>
          <p style={styles.pageSub}>
            Search a student by registration number, update their CGPA and SGPA.
            Dean list updates automatically.
          </p>
        </div>
        <div style={styles.headerBadge}>
          <IconStar />
          <span>DB Trigger Active</span>
        </div>
      </div>

      <div style={styles.grid}>
        {/* ── LEFT: Search + Update ── */}
        <div style={styles.leftCol}>
          {/* Search Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.cardIconBox, background: YELLOW }}>
                <IconSearch />
              </div>
              <div>
                <h2 style={styles.cardTitle}>Search Student</h2>
                <p style={styles.cardSub}>Find by registration number</p>
              </div>
            </div>

            <div style={styles.searchRow}>
              <input
                style={styles.searchInput}
                placeholder="e.g: BSCS-2022-001"
                value={regInput}
                onChange={(e) => {
                  setRegInput(e.target.value);
                  setSearchErr("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <button
                style={styles.searchBtn}
                onClick={handleSearch}
                disabled={searching}
              >
                {searching ? (
                  "..."
                ) : (
                  <>
                    <IconSearch /> Search
                  </>
                )}
              </button>
            </div>

            {searchErr && <p style={styles.errorMsg}>⚠ {searchErr}</p>}

            {/* Found student */}
            {foundStudent && (
              <div style={styles.studentCard}>
                <div style={styles.studentAvatar}>
                  {foundStudent.FULL_NAME?.[0] || "S"}
                </div>
                <div style={styles.studentInfo}>
                  <span style={styles.studentName}>
                    {foundStudent.FULL_NAME}
                  </span>
                  <div style={styles.studentMeta}>
                    <span style={styles.metaChip}>
                      {foundStudent.REG_NUMBER}
                    </span>
                    <span style={styles.metaChip}>
                      {foundStudent.BATCH_NAME}
                    </span>
                    <span style={styles.metaChip}>
                      {foundStudent.SECTION_NAME}
                    </span>
                  </div>
                </div>
                <div style={styles.currentCgpa}>
                  <span style={styles.cgpaNum}>
                    {foundStudent.CGPA?.toFixed(2)}
                  </span>
                  <span style={styles.cgpaLabel}>Current CGPA</span>
                </div>
              </div>
            )}
          </div>

          {/* Update Card — only shows when student found */}
          {foundStudent && (
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <div
                  style={{
                    ...styles.cardIconBox,
                    background: BLACK,
                    color: YELLOW,
                  }}
                >
                  <IconEdit />
                </div>
                <div>
                  <h2 style={styles.cardTitle}>Update CGPA</h2>
                  <p style={styles.cardSub}>
                    Changes trigger audit log automatically
                  </p>
                </div>
              </div>

              {/* Semester */}
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Semester</label>
                <div style={styles.semesterChips}>
                  {SEMESTERS.map((s) => (
                    <button
                      key={s}
                      style={{
                        ...styles.semChip,
                        ...(semester === s ? styles.semChipActive : {}),
                      }}
                      onClick={() => setSemester(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* SGPA + CGPA inputs */}
              <div style={styles.inputRow}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Semester GPA (SGPA)</label>
                  <input
                    style={styles.numInput}
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    placeholder="e.g: 3.75"
                    value={sgpa}
                    onChange={(e) => {
                      setSgpa(e.target.value);
                      setUpdateErr("");
                    }}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>New CGPA</label>
                  <input
                    style={styles.numInput}
                    type="number"
                    step="0.01"
                    min="0"
                    max="4"
                    placeholder="e.g: 3.82"
                    value={newCgpa}
                    onChange={(e) => {
                      setNewCgpa(e.target.value);
                      setUpdateErr("");
                    }}
                  />
                </div>
              </div>

              {/* Grade preview */}
              {newCgpa && !isNaN(parseFloat(newCgpa)) && (
                <div style={styles.gradePreview}>
                  <span style={styles.gradeLabel}>Grade Preview:</span>
                  <span style={styles.gradeVal}>
                    {getGrade(parseFloat(newCgpa))}
                  </span>
                  {parseFloat(newCgpa) >= 3.5 && (
                    <span style={styles.deanBadge}>🏅 Dean List Eligible</span>
                  )}
                </div>
              )}

              {updateErr && <p style={styles.errorMsg}>⚠ {updateErr}</p>}

              {/* Success message */}
              {successMsg && (
                <div style={styles.successBox}>
                  <IconCheck />
                  <div>
                    <p style={styles.successTitle}>Updated Successfully!</p>
                    <p style={styles.successSub}>{successMsg}</p>
                  </div>
                </div>
              )}

              <button
                style={{ ...styles.updateBtn, opacity: updating ? 0.7 : 1 }}
                onClick={handleUpdate}
                disabled={updating}
              >
                {updating ? (
                  "Updating..."
                ) : (
                  <>
                    <IconCheck /> Update CGPA & Regenerate Dean List
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ── RIGHT: Info + Download ── */}
        <div style={styles.rightCol}>
          {/* How it works */}
          <div style={{ ...styles.card, background: BLACK, color: WHITE }}>
            <h2
              style={{ ...styles.cardTitle, color: YELLOW, marginBottom: 16 }}
            >
              ⚡ How It Works
            </h2>
            <div style={styles.stepList}>
              {[
                { num: "1", text: "Search student by registration number" },
                {
                  num: "2",
                  text: "Enter their SGPA for the semester and new CGPA",
                },
                { num: "3", text: "Click Update — CGPA saved to Oracle DB" },
                {
                  num: "4",
                  text: "Audit trigger fires automatically and logs the change",
                },
                {
                  num: "5",
                  text: "Dean list stored procedure runs — updates automatically",
                },
                {
                  num: "6",
                  text: "Students with CGPA ≥ 3.5 appear on Dean List instantly",
                },
              ].map((s) => (
                <div key={s.num} style={styles.step}>
                  <div style={styles.stepNum}>{s.num}</div>
                  <span style={styles.stepText}>{s.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Download Dean List */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.cardIconBox, background: YELLOW }}>
                <IconDownload />
              </div>
              <div>
                <h2 style={styles.cardTitle}>Download Dean List</h2>
                <p style={styles.cardSub}>Export as CSV file</p>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Select Semester</label>
              <div style={styles.semesterChips}>
                {SEMESTERS.map((s) => (
                  <button
                    key={s}
                    style={{
                      ...styles.semChip,
                      ...(dlSemester === s ? styles.semChipActive : {}),
                    }}
                    onClick={() => setDlSemester(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              style={{ ...styles.downloadBtn, opacity: downloading ? 0.7 : 1 }}
              onClick={handleDownload}
              disabled={downloading}
            >
              <IconDownload />
              {downloading
                ? "Preparing..."
                : `Download ${dlSemester} Dean List`}
            </button>

            <p style={styles.downloadNote}>
              Downloads as{" "}
              <code style={styles.code}>DeanList_{dlSemester}.csv</code> with
              rank, name, reg#, batch, section and CGPA columns.
            </p>
          </div>

          {/* Thresholds card */}
          <div style={{ ...styles.card, background: YELLOW }}>
            <h2 style={{ ...styles.cardTitle, marginBottom: 14 }}>
              📊 Grade Thresholds
            </h2>
            {[
              { grade: "A+", min: "3.70", max: "4.00", color: "#16a34a" },
              { grade: "A", min: "3.30", max: "3.69", color: "#2563eb" },
              { grade: "B+", min: "3.00", max: "3.29", color: "#7c3aed" },
              { grade: "B", min: "2.70", max: "2.99", color: "#ea580c" },
              { grade: "C", min: "0.00", max: "2.69", color: RED },
            ].map((g) => (
              <div key={g.grade} style={styles.gradeRow}>
                <span style={{ ...styles.gradePill, background: g.color }}>
                  {g.grade}
                </span>
                <div style={styles.gradeBar}>
                  <div
                    style={{
                      ...styles.gradeBarFill,
                      width: `${(parseFloat(g.max) / 4) * 100}%`,
                      background: g.color + "44",
                    }}
                  />
                </div>
                <span style={styles.gradeRange}>
                  {g.min} – {g.max}
                </span>
              </div>
            ))}
            <div style={styles.deanThreshold}>
              🏅 Dean List threshold: <strong>CGPA ≥ 3.50</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─── */
const styles = {
  page: { display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100 },
  pageHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 20,
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
    lineHeight: 1.1,
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },
  pageSub: {
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(0,0,0,0.4)",
    margin: "8px 0 0",
    maxWidth: 480,
  },
  headerBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: YELLOW,
    padding: "10px 18px",
    borderRadius: 50,
    fontSize: 13,
    fontWeight: 800,
    color: BLACK,
    flexShrink: 0,
    boxShadow: "0 4px 14px rgba(245,196,0,0.4)",
  },

  grid: {
    display: "flex",
    gap: 20,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  leftCol: {
    flex: "1 1 380px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    minWidth: 320,
  },
  rightCol: {
    flex: "1 1 300px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    minWidth: 260,
  },

  card: {
    background: WHITE,
    borderRadius: 24,
    padding: "24px 26px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
    border: "1.5px solid rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  cardHeader: { display: "flex", alignItems: "center", gap: 12 },
  cardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: BLACK,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 900,
    color: BLACK,
    margin: 0,
    letterSpacing: -0.3,
    fontFamily: "'Barlow Condensed', 'Arial Black', sans-serif",
  },
  cardSub: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(0,0,0,0.35)",
    margin: "2px 0 0",
  },

  searchRow: { display: "flex", gap: 10 },
  searchInput: {
    flex: 1,
    padding: "12px 16px",
    borderRadius: 12,
    border: "2px solid rgba(0,0,0,0.12)",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 700,
    color: BLACK,
    outline: "none",
    background: "#fafafa",
  },
  searchBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "12px 20px",
    borderRadius: 12,
    border: "none",
    background: BLACK,
    color: WHITE,
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.18s",
  },

  studentCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "rgba(245,196,0,0.1)",
    borderRadius: 16,
    padding: "14px 16px",
    border: `2px solid ${YELLOW}`,
  },
  studentAvatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: YELLOW,
    color: BLACK,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    fontWeight: 900,
    flexShrink: 0,
  },
  studentInfo: { flex: 1, display: "flex", flexDirection: "column", gap: 6 },
  studentName: { fontSize: 16, fontWeight: 900, color: BLACK },
  studentMeta: { display: "flex", gap: 6, flexWrap: "wrap" },
  metaChip: {
    fontSize: 11,
    fontWeight: 800,
    color: BLACK,
    background: "rgba(0,0,0,0.1)",
    padding: "3px 8px",
    borderRadius: 6,
    letterSpacing: 0.8,
  },
  currentCgpa: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flexShrink: 0,
  },
  cgpaNum: {
    fontSize: 28,
    fontWeight: 900,
    color: BLACK,
    lineHeight: 1,
    fontFamily: "'Barlow Condensed', Arial, sans-serif",
  },
  cgpaLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "rgba(0,0,0,0.4)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  formGroup: { display: "flex", flexDirection: "column", gap: 8 },
  formLabel: {
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(0,0,0,0.5)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  semesterChips: { display: "flex", gap: 8, flexWrap: "wrap" },
  semChip: {
    padding: "8px 16px",
    borderRadius: 50,
    border: "2px solid rgba(0,0,0,0.12)",
    background: "#f5f5f5",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 800,
    color: "rgba(0,0,0,0.5)",
    cursor: "pointer",
    transition: "all 0.18s",
  },
  semChipActive: {
    background: BLACK,
    color: WHITE,
    border: "2px solid " + BLACK,
  },
  inputRow: { display: "flex", gap: 16 },
  numInput: {
    padding: "12px 16px",
    borderRadius: 12,
    border: "2px solid rgba(0,0,0,0.12)",
    fontFamily: "inherit",
    fontSize: 18,
    fontWeight: 900,
    color: BLACK,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    background: "#fafafa",
  },

  gradePreview: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(245,196,0,0.1)",
    borderRadius: 12,
    padding: "10px 16px",
    border: `1.5px solid ${YELLOW}`,
  },
  gradeLabel: { fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.5)" },
  gradeVal: {
    fontSize: 24,
    fontWeight: 900,
    color: BLACK,
    fontFamily: "'Barlow Condensed', Arial, sans-serif",
  },
  deanBadge: {
    fontSize: 12,
    fontWeight: 800,
    background: YELLOW,
    color: BLACK,
    padding: "4px 12px",
    borderRadius: 50,
  },

  errorMsg: {
    fontSize: 13,
    fontWeight: 700,
    color: RED,
    margin: 0,
    background: "rgba(200,41,58,0.08)",
    padding: "10px 14px",
    borderRadius: 10,
    border: `1.5px solid rgba(200,41,58,0.2)`,
  },
  successBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    background: "rgba(22,163,74,0.08)",
    borderRadius: 14,
    padding: "14px 16px",
    border: "1.5px solid rgba(22,163,74,0.25)",
    color: GREEN,
  },
  successTitle: { fontSize: 15, fontWeight: 900, color: GREEN, margin: 0 },
  successSub: {
    fontSize: 13,
    fontWeight: 600,
    color: "rgba(0,0,0,0.5)",
    margin: "3px 0 0",
  },

  updateBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 24px",
    borderRadius: 14,
    border: "none",
    background: YELLOW,
    color: BLACK,
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 900,
    cursor: "pointer",
    letterSpacing: 0.5,
    transition: "all 0.18s",
    boxShadow: "0 4px 16px rgba(245,196,0,0.4)",
  },
  downloadBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "13px 20px",
    borderRadius: 12,
    border: "none",
    background: BLACK,
    color: WHITE,
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    transition: "all 0.18s",
    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
  },
  downloadNote: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(0,0,0,0.4)",
    margin: 0,
    lineHeight: 1.6,
  },
  code: {
    background: "rgba(0,0,0,0.08)",
    padding: "2px 6px",
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 11,
  },

  stepList: { display: "flex", flexDirection: "column", gap: 10 },
  step: { display: "flex", alignItems: "flex-start", gap: 12 },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: YELLOW,
    color: BLACK,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 900,
    flexShrink: 0,
  },
  stepText: {
    fontSize: 13,
    fontWeight: 600,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.5,
    paddingTop: 3,
  },

  gradeRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  gradePill: {
    width: 32,
    textAlign: "center",
    fontSize: 12,
    fontWeight: 900,
    color: WHITE,
    padding: "3px 0",
    borderRadius: 6,
    flexShrink: 0,
  },
  gradeBar: {
    flex: 1,
    height: 8,
    background: "rgba(0,0,0,0.1)",
    borderRadius: 10,
    overflow: "hidden",
  },
  gradeBarFill: { height: "100%", borderRadius: 10 },
  gradeRange: {
    fontSize: 12,
    fontWeight: 700,
    color: "rgba(0,0,0,0.55)",
    flexShrink: 0,
    minWidth: 85,
    textAlign: "right",
  },
  deanThreshold: {
    fontSize: 13,
    fontWeight: 800,
    color: BLACK,
    background: "rgba(0,0,0,0.1)",
    padding: "10px 14px",
    borderRadius: 10,
    marginTop: 6,
    textAlign: "center",
  },
};
