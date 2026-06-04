import { useState, useEffect } from "react";
import axios from "axios";

const YELLOW = "#F5C400";
const BLACK = "#111111";
const WHITE = "#FFFFFF";
const RED = "#C8293A";
const GREEN = "#16a34a";

const DESIGNATIONS = [
  "Assistant Professor",
  "Associate Professor",
  "Professor",
  "Lecturer",
];

/* ─── Icons ─── */
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
const IconTrash = () => (
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
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconUsers = () => (
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
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconStudent = () => (
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
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
const IconFaculty = () => (
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
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);
const IconBatch = () => (
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
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);
const IconCheck = () => (
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
    <polyline points="20 6 9 17 4 12" />
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

const api = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("rankify_token")}` },
});
const BASE = "http://localhost:5000/api/admin";

const roleColors = {
  admin: { bg: "rgba(200,41,58,0.12)", color: RED, label: "ADMIN" },
  faculty: { bg: "rgba(245,196,0,0.2)", color: "#92600a", label: "FACULTY" },
  student: { bg: "rgba(34,197,94,0.12)", color: GREEN, label: "STUDENT" },
};

/* ─── Reusable Input ─── */
const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
}) => (
  <div style={styles.fieldWrap}>
    <label style={styles.fieldLabel}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...styles.fieldInput, ...(error ? styles.fieldInputErr : {}) }}
    />
    {error && <span style={styles.fieldErr}>{error}</span>}
  </div>
);

/* ─── Confirm Delete Modal ─── */
function DeleteModal({ user, onConfirm, onCancel }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalIcon}>
          <IconTrash />
        </div>
        <h3 style={styles.modalTitle}>Delete User?</h3>
        <p style={styles.modalSub}>
          Are you sure you want to delete <strong>{user.FULL_NAME}</strong>?
          This will also remove their student/faculty record. This cannot be
          undone.
        </p>
        <div style={styles.modalBtns}>
          <button style={styles.modalCancel} onClick={onCancel}>
            Cancel
          </button>
          <button style={styles.modalConfirm} onClick={onConfirm}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function UserManagement() {
  const [activeTab, setActiveTab] = useState("list");
  const [users, setUsers] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  /* Add Student form */
  const [sForm, setSForm] = useState({
    full_name: "",
    email: "",
    reg_number: "",
    batch_id: "",
    section_id: "",
    cgpa: "",
  });
  const [sErr, setSErr] = useState({});
  const [sLoading, setSLoading] = useState(false);

  /* Add Faculty form */
  const [fForm, setFForm] = useState({
    full_name: "",
    email: "",
    designation: "Lecturer",
    dept_id: "1",
  });
  const [fErr, setFErr] = useState({});
  const [fLoading, setFLoading] = useState(false);

  /* Add Batch form */
  const [bForm, setBForm] = useState({
    batch_name: "",
    start_year: "",
    end_year: "",
  });
  const [bErr, setBErr] = useState({});
  const [bLoading, setBLoading] = useState(false);

  /* Add Section form */
  const [secForm, setSecForm] = useState({ section_name: "", batch_id: "" });
  const [secErr, setSecErr] = useState({});
  const [secLoading, setSecLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, bRes, sRes] = await Promise.all([
        axios.get(`${BASE}/users`, api()),
        axios.get(`${BASE}/batches`, api()),
        axios.get(`${BASE}/sections`, api()),
      ]);
      setUsers(uRes.data.data || []);
      setBatches(bRes.data.data || []);
      setSections(sRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  /* ── Add Student ── */
  const validateStudent = () => {
    const e = {};
    if (!sForm.full_name) e.full_name = "Required";
    if (!sForm.email) e.email = "Required";
    if (!sForm.reg_number) e.reg_number = "Required";
    if (!sForm.batch_id) e.batch_id = "Required";
    if (!sForm.section_id) e.section_id = "Required";
    return e;
  };

  const handleAddStudent = async () => {
    const e = validateStudent();
    if (Object.keys(e).length) {
      setSErr(e);
      return;
    }
    setSLoading(true);
    try {
      await axios.post(
        `${BASE}/add-student`,
        {
          ...sForm,
          batch_id: parseInt(sForm.batch_id),
          section_id: parseInt(sForm.section_id),
          cgpa: parseFloat(sForm.cgpa) || 0,
        },
        api(),
      );
      setSForm({
        full_name: "",
        email: "",
        reg_number: "",
        batch_id: "",
        section_id: "",
        cgpa: "",
      });
      setSErr({});
      showSuccess("✅ Student added successfully!");
      fetchAll();
      setActiveTab("list");
    } catch (err) {
      setSErr({
        submit: err.response?.data?.message || "Failed to add student",
      });
    } finally {
      setSLoading(false);
    }
  };

  /* ── Add Faculty ── */
  const validateFaculty = () => {
    const e = {};
    if (!fForm.full_name) e.full_name = "Required";
    if (!fForm.email) e.email = "Required";
    if (!fForm.designation) e.designation = "Required";
    return e;
  };

  const handleAddFaculty = async () => {
    const e = validateFaculty();
    if (Object.keys(e).length) {
      setFErr(e);
      return;
    }
    setFLoading(true);
    try {
      await axios.post(
        `${BASE}/add-faculty`,
        { ...fForm, dept_id: parseInt(fForm.dept_id) },
        api(),
      );
      setFForm({
        full_name: "",
        email: "",
        designation: "Lecturer",
        dept_id: "1",
      });
      setFErr({});
      showSuccess("✅ Faculty added successfully!");
      fetchAll();
      setActiveTab("list");
    } catch (err) {
      setFErr({
        submit: err.response?.data?.message || "Failed to add faculty",
      });
    } finally {
      setFLoading(false);
    }
  };

  /* ── Add Batch ── */
  const handleAddBatch = async () => {
    const e = {};
    if (!bForm.batch_name) e.batch_name = "Required";
    if (!bForm.start_year) e.start_year = "Required";
    if (!bForm.end_year) e.end_year = "Required";
    if (Object.keys(e).length) {
      setBErr(e);
      return;
    }
    setBLoading(true);
    try {
      await axios.post(`${BASE}/add-batch`, { ...bForm, dept_id: 1 }, api());
      setBForm({ batch_name: "", start_year: "", end_year: "" });
      setBErr({});
      showSuccess(`✅ Batch ${bForm.batch_name} added!`);
      fetchAll();
    } catch (err) {
      setBErr({ submit: err.response?.data?.message || "Failed" });
    } finally {
      setBLoading(false);
    }
  };

  /* ── Add Section ── */
  const handleAddSection = async () => {
    const e = {};
    if (!secForm.section_name) e.section_name = "Required";
    if (!secForm.batch_id) e.batch_id = "Required";
    if (Object.keys(e).length) {
      setSecErr(e);
      return;
    }
    setSecLoading(true);
    try {
      await axios.post(
        `${BASE}/add-section`,
        {
          section_name: secForm.section_name,
          batch_id: parseInt(secForm.batch_id),
        },
        api(),
      );
      setSecForm({ section_name: "", batch_id: "" });
      setSecErr({});
      showSuccess(`✅ Section ${secForm.section_name} added!`);
      fetchAll();
    } catch (err) {
      setSecErr({ submit: err.response?.data?.message || "Failed" });
    } finally {
      setSecLoading(false);
    }
  };

  /* ── Delete User ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await axios.delete(`${BASE}/users/${deleteTarget.USER_ID}`, api());
      showSuccess(`✅ ${deleteTarget.FULL_NAME} deleted.`);
      setDeleteTarget(null);
      fetchAll();
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  /* ── Filtered users ── */
  const filtered = users.filter((u) => {
    const matchRole = filterRole === "all" || u.ROLE_NAME === filterRole;
    const matchSearch =
      !search ||
      u.FULL_NAME?.toLowerCase().includes(search.toLowerCase()) ||
      u.EMAIL?.toLowerCase().includes(search.toLowerCase()) ||
      u.REG_NUMBER?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const tabs = [
    { id: "list", label: "All Users", icon: <IconUsers /> },
    { id: "student", label: "Add Student", icon: <IconStudent /> },
    { id: "faculty", label: "Add Faculty", icon: <IconFaculty /> },
    { id: "batch", label: "Add Batch", icon: <IconBatch /> },
    { id: "section", label: "Add Section", icon: <IconBatch /> },
  ];

  return (
    <div style={styles.page}>
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <p style={styles.pageLabel}>ADMIN PANEL</p>
          <h1 style={styles.pageTitle}>
            User <span style={{ color: YELLOW }}>Management</span>
          </h1>
          <p style={styles.pageSub}>
            Add, view and delete students, faculty, batches and sections.
          </p>
        </div>
        <div style={styles.statsRow}>
          {[
            {
              label: "Students",
              val: users.filter((u) => u.ROLE_NAME === "student").length,
              color: GREEN,
            },
            {
              label: "Faculty",
              val: users.filter((u) => u.ROLE_NAME === "faculty").length,
              color: YELLOW,
            },
            {
              label: "Admins",
              val: users.filter((u) => u.ROLE_NAME === "admin").length,
              color: RED,
            },
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

      {/* Tabs */}
      <div style={styles.tabBar}>
        {tabs.map((t) => (
          <button
            key={t.id}
            style={{
              ...styles.tabBtn,
              ...(activeTab === t.id ? styles.tabBtnActive : {}),
            }}
            onClick={() => setActiveTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── ALL USERS LIST ── */}
      {activeTab === "list" && (
        <div style={styles.card}>
          {/* Filters */}
          <div style={styles.filterRow}>
            <div style={styles.searchBox}>
              <IconSearch />
              <input
                style={styles.searchInput}
                placeholder="Search by name, email or reg#..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button style={styles.clearBtn} onClick={() => setSearch("")}>
                  <IconX />
                </button>
              )}
            </div>
            <div style={styles.roleFilters}>
              {["all", "student", "faculty", "admin"].map((r) => (
                <button
                  key={r}
                  style={{
                    ...styles.filterChip,
                    ...(filterRole === r ? styles.filterChipActive : {}),
                  }}
                  onClick={() => setFilterRole(r)}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Table Header */}
          <div style={styles.tableHeader}>
            <div style={{ flex: 1 }}>NAME</div>
            <div style={{ width: 220 }}>EMAIL</div>
            <div style={{ width: 130 }}>REG / BATCH</div>
            <div style={{ width: 80, textAlign: "center" }}>ROLE</div>
            <div style={{ width: 70, textAlign: "center" }}>CGPA</div>
            <div style={{ width: 60, textAlign: "center" }}>ACTION</div>
          </div>

          {/* Rows */}
          {loading ? (
            <p style={{ color: "#aaa", padding: "20px 0", fontSize: 14 }}>
              Loading users...
            </p>
          ) : filtered.length === 0 ? (
            <p style={{ color: "#aaa", padding: "20px 0", fontSize: 14 }}>
              No users found.
            </p>
          ) : (
            <div style={styles.tableBody}>
              {filtered.map((u, i) => {
                const rc = roleColors[u.ROLE_NAME] || roleColors.student;
                const isH = hoveredRow === i;
                return (
                  <div
                    key={i}
                    style={{
                      ...styles.tableRow,
                      ...(isH ? styles.tableRowHover : {}),
                    }}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Avatar + Name */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          ...styles.avatar,
                          background: rc.bg,
                          color: rc.color,
                        }}
                      >
                        {u.FULL_NAME?.[0] || "?"}
                      </div>
                      <span style={styles.userName}>{u.FULL_NAME}</span>
                    </div>

                    {/* Email */}
                    <div
                      style={{
                        width: 220,
                        fontSize: 13,
                        color: "rgba(0,0,0,0.45)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {u.EMAIL}
                    </div>

                    {/* Reg / Batch */}
                    <div style={{ width: 130 }}>
                      {u.REG_NUMBER ? (
                        <>
                          <span style={styles.regTag}>{u.REG_NUMBER}</span>
                          <br />
                          <span
                            style={{ fontSize: 11, color: "rgba(0,0,0,0.35)" }}
                          >
                            {u.BATCH_NAME}
                          </span>
                        </>
                      ) : (
                        <span
                          style={{ fontSize: 12, color: "rgba(0,0,0,0.3)" }}
                        >
                          —
                        </span>
                      )}
                    </div>

                    {/* Role */}
                    <div style={{ width: 80, textAlign: "center" }}>
                      <span
                        style={{
                          ...styles.roleChip,
                          background: rc.bg,
                          color: rc.color,
                        }}
                      >
                        {rc.label}
                      </span>
                    </div>

                    {/* CGPA */}
                    <div
                      style={{
                        width: 70,
                        textAlign: "center",
                        fontSize: 16,
                        fontWeight: 900,
                        color: BLACK,
                      }}
                    >
                      {u.CGPA != null ? u.CGPA.toFixed(2) : "—"}
                    </div>

                    {/* Delete */}
                    <div style={{ width: 60, textAlign: "center" }}>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => setDeleteTarget(u)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ADD STUDENT ── */}
      {activeTab === "student" && (
        <div style={styles.formCard}>
          <div style={styles.formCardHeader}>
            <div
              style={{ ...styles.formIconBox, background: GREEN, color: WHITE }}
            >
              <IconStudent />
            </div>
            <div>
              <h2 style={styles.formTitle}>Add New Student</h2>
              <p style={styles.formSub}>
                Student will log in using their Gmail account
              </p>
            </div>
          </div>
          <div style={styles.formGrid}>
            <Field
              label="Full Name"
              value={sForm.full_name}
              onChange={(v) => setSForm((f) => ({ ...f, full_name: v }))}
              placeholder="e.g: Ali Hassan"
              error={sErr.full_name}
            />
            <Field
              label="Gmail Address"
              value={sForm.email}
              onChange={(v) => setSForm((f) => ({ ...f, email: v }))}
              placeholder="student@gmail.com"
              error={sErr.email}
            />
            <Field
              label="Registration Number"
              value={sForm.reg_number}
              onChange={(v) => setSForm((f) => ({ ...f, reg_number: v }))}
              placeholder="e.g: BSCS-2024-001"
              error={sErr.reg_number}
            />
            <Field
              label="Initial CGPA"
              value={sForm.cgpa}
              onChange={(v) => setSForm((f) => ({ ...f, cgpa: v }))}
              placeholder="0.00"
              type="number"
            />
          </div>
          <div style={styles.formGrid}>
            {/* Batch */}
            <div style={styles.fieldWrap}>
              <label style={styles.fieldLabel}>Batch</label>
              <select
                style={styles.fieldInput}
                value={sForm.batch_id}
                onChange={(e) =>
                  setSForm((f) => ({ ...f, batch_id: e.target.value }))
                }
              >
                <option value="">Select batch...</option>
                {batches.map((b) => (
                  <option key={b.BATCH_ID} value={b.BATCH_ID}>
                    {b.BATCH_NAME}
                  </option>
                ))}
              </select>
              {sErr.batch_id && (
                <span style={styles.fieldErr}>{sErr.batch_id}</span>
              )}
            </div>
            {/* Section */}
            <div style={styles.fieldWrap}>
              <label style={styles.fieldLabel}>Section</label>
              <select
                style={styles.fieldInput}
                value={sForm.section_id}
                onChange={(e) =>
                  setSForm((f) => ({ ...f, section_id: e.target.value }))
                }
              >
                <option value="">Select section...</option>
                {sections
                  .filter(
                    (s) =>
                      !sForm.batch_id ||
                      s.BATCH_NAME ===
                        batches.find((b) => b.BATCH_ID == sForm.batch_id)
                          ?.BATCH_NAME,
                  )
                  .map((s) => (
                    <option key={s.SECTION_ID} value={s.SECTION_ID}>
                      {s.BATCH_NAME} — {s.SECTION_NAME}
                    </option>
                  ))}
              </select>
              {sErr.section_id && (
                <span style={styles.fieldErr}>{sErr.section_id}</span>
              )}
            </div>
          </div>
          {sErr.submit && <p style={styles.submitErr}>{sErr.submit}</p>}
          <button
            style={{
              ...styles.submitBtn,
              background: GREEN,
              opacity: sLoading ? 0.7 : 1,
            }}
            onClick={handleAddStudent}
            disabled={sLoading}
          >
            {sLoading ? (
              "Adding..."
            ) : (
              <>
                <IconPlus /> Add Student
              </>
            )}
          </button>
        </div>
      )}

      {/* ── ADD FACULTY ── */}
      {activeTab === "faculty" && (
        <div style={styles.formCard}>
          <div style={styles.formCardHeader}>
            <div
              style={{
                ...styles.formIconBox,
                background: YELLOW,
                color: BLACK,
              }}
            >
              <IconFaculty />
            </div>
            <div>
              <h2 style={styles.formTitle}>Add New Faculty</h2>
              <p style={styles.formSub}>
                Faculty will log in using their Gmail account
              </p>
            </div>
          </div>
          <div style={styles.formGrid}>
            <Field
              label="Full Name"
              value={fForm.full_name}
              onChange={(v) => setFForm((f) => ({ ...f, full_name: v }))}
              placeholder="e.g: Dr. Ahmed Ali"
              error={fErr.full_name}
            />
            <Field
              label="Gmail Address"
              value={fForm.email}
              onChange={(v) => setFForm((f) => ({ ...f, email: v }))}
              placeholder="faculty@gmail.com"
              error={fErr.email}
            />
          </div>
          <div style={styles.formGrid}>
            <div style={styles.fieldWrap}>
              <label style={styles.fieldLabel}>Designation</label>
              <select
                style={styles.fieldInput}
                value={fForm.designation}
                onChange={(e) =>
                  setFForm((f) => ({ ...f, designation: e.target.value }))
                }
              >
                {DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {fErr.designation && (
                <span style={styles.fieldErr}>{fErr.designation}</span>
              )}
            </div>
            <div style={styles.fieldWrap}>
              <label style={styles.fieldLabel}>Department ID</label>
              <select
                style={styles.fieldInput}
                value={fForm.dept_id}
                onChange={(e) =>
                  setFForm((f) => ({ ...f, dept_id: e.target.value }))
                }
              >
                <option value="1">Computer Science</option>
                <option value="2">Software Engineering</option>
                <option value="3">Cyber Security</option>
              </select>
            </div>
          </div>
          {fErr.submit && <p style={styles.submitErr}>{fErr.submit}</p>}
          <button
            style={{
              ...styles.submitBtn,
              background: YELLOW,
              color: BLACK,
              opacity: fLoading ? 0.7 : 1,
            }}
            onClick={handleAddFaculty}
            disabled={fLoading}
          >
            {fLoading ? (
              "Adding..."
            ) : (
              <>
                <IconPlus /> Add Faculty
              </>
            )}
          </button>
        </div>
      )}

      {/* ── ADD BATCH ── */}
      {activeTab === "batch" && (
        <div style={styles.formCard}>
          <div style={styles.formCardHeader}>
            <div
              style={{
                ...styles.formIconBox,
                background: BLACK,
                color: YELLOW,
              }}
            >
              <IconBatch />
            </div>
            <div>
              <h2 style={styles.formTitle}>Add New Batch</h2>
              <p style={styles.formSub}>e.g: BSCS-5, BSSE-5 etc</p>
            </div>
          </div>

          {/* Existing batches */}
          <div style={styles.existingList}>
            <p style={styles.existingLabel}>EXISTING BATCHES</p>
            <div style={styles.chipList}>
              {batches.map((b) => (
                <span key={b.BATCH_ID} style={styles.existingChip}>
                  {b.BATCH_NAME}
                </span>
              ))}
            </div>
          </div>

          <div style={styles.formGrid}>
            <Field
              label="Batch Name"
              value={bForm.batch_name}
              onChange={(v) => setBForm((f) => ({ ...f, batch_name: v }))}
              placeholder="e.g: BSCS-5"
              error={bErr.batch_name}
            />
            <Field
              label="Start Year"
              value={bForm.start_year}
              onChange={(v) => setBForm((f) => ({ ...f, start_year: v }))}
              placeholder="e.g: 2025"
              error={bErr.start_year}
              type="number"
            />
            <Field
              label="End Year"
              value={bForm.end_year}
              onChange={(v) => setBForm((f) => ({ ...f, end_year: v }))}
              placeholder="e.g: 2029"
              error={bErr.end_year}
              type="number"
            />
          </div>
          {bErr.submit && <p style={styles.submitErr}>{bErr.submit}</p>}
          <button
            style={{ ...styles.submitBtn, opacity: bLoading ? 0.7 : 1 }}
            onClick={handleAddBatch}
            disabled={bLoading}
          >
            {bLoading ? (
              "Adding..."
            ) : (
              <>
                <IconPlus /> Add Batch
              </>
            )}
          </button>
        </div>
      )}

      {/* ── ADD SECTION ── */}
      {activeTab === "section" && (
        <div style={styles.formCard}>
          <div style={styles.formCardHeader}>
            <div
              style={{ ...styles.formIconBox, background: RED, color: WHITE }}
            >
              <IconBatch />
            </div>
            <div>
              <h2 style={styles.formTitle}>Add New Section</h2>
              <p style={styles.formSub}>e.g: 5A, 5B under a batch</p>
            </div>
          </div>

          {/* Existing sections */}
          <div style={styles.existingList}>
            <p style={styles.existingLabel}>EXISTING SECTIONS</p>
            <div style={styles.chipList}>
              {sections.map((s) => (
                <span key={s.SECTION_ID} style={styles.existingChip}>
                  {s.BATCH_NAME} — {s.SECTION_NAME}
                </span>
              ))}
            </div>
          </div>

          <div style={styles.formGrid}>
            <Field
              label="Section Name"
              value={secForm.section_name}
              onChange={(v) => setSecForm((f) => ({ ...f, section_name: v }))}
              placeholder="e.g: 5A"
              error={secErr.section_name}
            />
            <div style={styles.fieldWrap}>
              <label style={styles.fieldLabel}>Batch</label>
              <select
                style={styles.fieldInput}
                value={secForm.batch_id}
                onChange={(e) =>
                  setSecForm((f) => ({ ...f, batch_id: e.target.value }))
                }
              >
                <option value="">Select batch...</option>
                {batches.map((b) => (
                  <option key={b.BATCH_ID} value={b.BATCH_ID}>
                    {b.BATCH_NAME}
                  </option>
                ))}
              </select>
              {secErr.batch_id && (
                <span style={styles.fieldErr}>{secErr.batch_id}</span>
              )}
            </div>
          </div>
          {secErr.submit && <p style={styles.submitErr}>{secErr.submit}</p>}
          <button
            style={{
              ...styles.submitBtn,
              background: RED,
              opacity: secLoading ? 0.7 : 1,
            }}
            onClick={handleAddSection}
            disabled={secLoading}
          >
            {secLoading ? (
              "Adding..."
            ) : (
              <>
                <IconPlus /> Add Section
              </>
            )}
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
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
    lineHeight: 1.1,
    fontFamily: "'Barlow Condensed','Arial Black',sans-serif",
  },
  pageSub: {
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(0,0,0,0.4)",
    margin: "8px 0 0",
  },
  statsRow: { display: "flex", gap: 12, flexShrink: 0 },
  miniStat: {
    background: WHITE,
    borderRadius: 16,
    padding: "14px 20px",
    textAlign: "center",
    boxShadow: "0 3px 12px rgba(0,0,0,0.07)",
    minWidth: 80,
  },
  miniStatVal: {
    display: "block",
    fontSize: 30,
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
    marginTop: 4,
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

  tabBar: { display: "flex", gap: 8, flexWrap: "wrap" },
  tabBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "10px 18px",
    borderRadius: 10,
    border: "2px solid rgba(0,0,0,0.1)",
    background: WHITE,
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 800,
    color: "rgba(0,0,0,0.45)",
    cursor: "pointer",
    transition: "all 0.18s",
    letterSpacing: 0.3,
  },
  tabBtnActive: {
    background: BLACK,
    color: WHITE,
    border: "2px solid " + BLACK,
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
  filterRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    flexWrap: "wrap",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
    background: "#fafafa",
    border: "2px solid rgba(0,0,0,0.1)",
    borderRadius: 12,
    padding: "10px 14px",
    minWidth: 200,
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
  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "rgba(0,0,0,0.3)",
    display: "flex",
    padding: 0,
  },
  roleFilters: { display: "flex", gap: 8, flexWrap: "wrap" },
  filterChip: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "2px solid rgba(0,0,0,0.1)",
    background: "#f5f5f5",
    fontFamily: "inherit",
    fontSize: 11,
    fontWeight: 800,
    color: "rgba(0,0,0,0.45)",
    cursor: "pointer",
    letterSpacing: 1,
    transition: "all 0.15s",
  },
  filterChipActive: {
    background: BLACK,
    color: WHITE,
    border: "2px solid " + BLACK,
  },

  tableHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 14px 10px",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 2,
    color: "rgba(0,0,0,0.35)",
    textTransform: "uppercase",
    borderBottom: "2px solid rgba(0,0,0,0.06)",
  },
  tableBody: { display: "flex", flexDirection: "column", gap: 6 },
  tableRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 14px",
    borderRadius: 14,
    background: "#fafafa",
    border: "1.5px solid rgba(0,0,0,0.05)",
    transition: "all 0.18s",
    cursor: "default",
  },
  tableRowHover: {
    border: `1.5px solid ${YELLOW}`,
    background: "rgba(245,196,0,0.04)",
    transform: "translateX(3px)",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 15,
    fontWeight: 900,
    flexShrink: 0,
  },
  userName: {
    fontSize: 14,
    fontWeight: 800,
    color: BLACK,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  regTag: {
    fontSize: 11,
    fontWeight: 800,
    color: BLACK,
    background: "rgba(245,196,0,0.3)",
    padding: "2px 8px",
    borderRadius: 5,
    letterSpacing: 0.8,
  },
  roleChip: {
    fontSize: 10,
    fontWeight: 900,
    padding: "4px 10px",
    borderRadius: 6,
    letterSpacing: 1,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: "none",
    background: "rgba(200,41,58,0.1)",
    color: RED,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.18s",
    margin: "0 auto",
  },

  formCard: {
    background: WHITE,
    borderRadius: 24,
    padding: "28px 30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
    border: "1.5px solid rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    maxWidth: 700,
  },
  formCardHeader: { display: "flex", alignItems: "center", gap: 14 },
  formIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: BLACK,
    margin: 0,
    fontFamily: "'Barlow Condensed','Arial Black',sans-serif",
  },
  formSub: {
    fontSize: 13,
    fontWeight: 600,
    color: "rgba(0,0,0,0.35)",
    margin: "3px 0 0",
  },
  formGrid: { display: "flex", gap: 16, flexWrap: "wrap" },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    flex: "1 1 200px",
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: 800,
    color: "rgba(0,0,0,0.45)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  fieldInput: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "2px solid rgba(0,0,0,0.1)",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 700,
    color: BLACK,
    outline: "none",
    background: "#fafafa",
    width: "100%",
    boxSizing: "border-box",
  },
  fieldInputErr: { border: `2px solid ${RED}` },
  fieldErr: { fontSize: 12, fontWeight: 700, color: RED },
  submitErr: {
    fontSize: 13,
    fontWeight: 700,
    color: RED,
    background: "rgba(200,41,58,0.08)",
    padding: "10px 14px",
    borderRadius: 10,
    border: `1.5px solid rgba(200,41,58,0.2)`,
    margin: 0,
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "13px 24px",
    borderRadius: 12,
    border: "none",
    background: BLACK,
    color: WHITE,
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 900,
    cursor: "pointer",
    letterSpacing: 0.5,
    transition: "all 0.18s",
    boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
    alignSelf: "flex-start",
  },

  existingList: {
    background: "#fafafa",
    borderRadius: 14,
    padding: "14px 16px",
    border: "1.5px solid rgba(0,0,0,0.07)",
  },
  existingLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: "rgba(0,0,0,0.35)",
    letterSpacing: 2,
    textTransform: "uppercase",
    margin: "0 0 10px",
  },
  chipList: { display: "flex", gap: 8, flexWrap: "wrap" },
  existingChip: {
    fontSize: 12,
    fontWeight: 800,
    color: BLACK,
    background: "rgba(245,196,0,0.25)",
    padding: "5px 12px",
    borderRadius: 8,
    letterSpacing: 0.5,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: WHITE,
    borderRadius: 24,
    padding: "36px 40px",
    maxWidth: 420,
    width: "90%",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  modalIcon: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "rgba(200,41,58,0.1)",
    color: RED,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 900,
    color: BLACK,
    margin: 0,
    fontFamily: "'Barlow Condensed','Arial Black',sans-serif",
  },
  modalSub: {
    fontSize: 14,
    fontWeight: 600,
    color: "rgba(0,0,0,0.5)",
    margin: 0,
    lineHeight: 1.6,
  },
  modalBtns: { display: "flex", gap: 12, marginTop: 4 },
  modalCancel: {
    padding: "11px 24px",
    borderRadius: 10,
    border: "2px solid rgba(0,0,0,0.15)",
    background: WHITE,
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 800,
    color: BLACK,
    cursor: "pointer",
  },
  modalConfirm: {
    padding: "11px 24px",
    borderRadius: 10,
    border: "none",
    background: RED,
    color: WHITE,
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(200,41,58,0.35)",
  },
};
