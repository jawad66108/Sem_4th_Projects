import { useEffect } from "react";
import { GoogleOAuthProvider, useGoogleLogin } from "@react-oauth/google";
import axios from "axios";

// ─── Google Button Inner Component ───────────────────────
function LoginButton() {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google using the access token
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );

        const googleEmail = userInfo.data.email;
        const googleName = userInfo.data.name;

        // Send to our backend
        const res = await axios.post("http://localhost:5000/api/auth/google", {
          token: tokenResponse.access_token,
          email: googleEmail,
          name: googleName,
        });

        if (res.data.status === "success") {
          // Save JWT and user info to localStorage
          localStorage.setItem("rankify_token", res.data.token);
          localStorage.setItem("rankify_user", JSON.stringify(res.data.user));

          // Redirect based on role
          const role = res.data.user.role.toLowerCase();
          if (role === "admin") window.location.href = "/admin/dashboard";
          if (role === "faculty") window.location.href = "/faculty/dashboard";
          if (role === "student") window.location.href = "/student/dashboard";
        }
      } catch (err) {
        const msg = err.response?.data?.message || "Login failed. Try again.";
        alert("❌ " + msg);
      }
    },
    onError: () => alert("❌ Google Sign-In failed. Try again."),
  });

  return (
    <button style={styles.googleBtn} onClick={() => login()}>
      <GoogleIcon />
      <span>Continue with Google</span>
    </button>
  );
}

// ─── Main Login Component ─────────────────────────────────
export default function Login() {
  // If already logged in, redirect immediately
  useEffect(() => {
    const user = localStorage.getItem("rankify_user");
    if (user) {
      const role = JSON.parse(user).role.toLowerCase();
      if (role === "admin") window.location.href = "/admin/dashboard";
      if (role === "faculty") window.location.href = "/faculty/dashboard";
      if (role === "student") window.location.href = "/student/dashboard";
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div style={styles.page}>
        {/* Watermark */}
        <div style={styles.watermark}>RANKIFY</div>

        {/* LEFT PANEL */}
        <div style={styles.left}>
          <div style={styles.topLabel}>
            <span style={styles.line} /> ACADEMIC PORTAL
          </div>

          <div style={styles.brandBlock}>
            <h1 style={styles.brandName}>RANKIFY</h1>
            <span style={styles.proBadge}>PRO</span>
          </div>

          <p style={styles.tagline}>Academic Intelligence System</p>
          <div style={styles.divider} />

          <div style={styles.loginSection}>
            <p style={styles.chooseLabel}>SIGN IN TO CONTINUE</p>

            <LoginButton />

            <p style={styles.note}>
              Only registered university accounts are allowed. Contact your
              admin if you cannot log in.
            </p>
          </div>

          <p style={styles.footer}>© RANKIFY PRO · SECURE SIGN-IN</p>
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.right}>
          <div style={styles.podiumWrapper}>
            <div style={styles.podium}>
              {/* 2nd place */}
              <div style={styles.placeCol}>
                <div style={styles.medalSilver}>
                  <span style={styles.medalNum}>2</span>
                </div>
                <div style={{ ...styles.block, height: 210 }}>
                  <span style={styles.blockNum}>2</span>
                </div>
              </div>
              {/* 1st place */}
              <div style={styles.placeCol}>
                <div style={styles.medalGold}>
                  <span style={styles.medalNum}>1</span>
                </div>
                <div style={{ ...styles.block, height: 280 }}>
                  <span style={styles.blockNum}>1</span>
                </div>
              </div>
              {/* 3rd place */}
              <div style={styles.placeCol}>
                <div style={styles.medalBronze}>
                  <span style={styles.medalNum}>3</span>
                </div>
                <div style={{ ...styles.block, height: 160 }}>
                  <span style={styles.blockNum}>3</span>
                </div>
              </div>
            </div>
            <div style={styles.podiumShadow} />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

// ─── Google Icon SVG ──────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.1 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.7 7.1 29.1 5 24 5 13 5 4 14 4 25s9 20 20 20 20-9 20-20c0-1.5-.2-3-.4-4.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.7 7.1 29.1 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 45c5 0 9.5-1.9 12.9-5l-6-4.9C29.3 36.5 26.8 37.5 24 37.5c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5C9.5 41 16.2 45 24 45z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6 4.9C41 34.8 44 30.3 44 25c0-1.5-.2-3-.4-4.5z"
    />
  </svg>
);

// ─── Styles ───────────────────────────────────────────────
const YELLOW = "#F5C400";
const BLACK = "#111111";
const WHITE = "#FFFFFF";

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    position: "relative",
    fontFamily: "'Barlow Condensed', 'Arial Narrow', Arial, sans-serif",
  },
  watermark: {
    position: "absolute",
    bottom: -40,
    left: -20,
    fontSize: 260,
    fontWeight: 900,
    letterSpacing: -8,
    color: "rgba(0,0,0,0.04)",
    pointerEvents: "none",
    userSelect: "none",
    zIndex: 0,
    lineHeight: 1,
  },
  left: {
    width: "68%",
    background: YELLOW,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "48px 72px",
    position: "relative",
    clipPath: "polygon(0 0, 92% 0, 100% 100%, 0 100%)",
    zIndex: 1,
    boxSizing: "border-box",
  },
  topLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 4,
    color: "rgba(0,0,0,0.55)",
    marginBottom: 28,
    textTransform: "uppercase",
  },
  line: {
    display: "inline-block",
    width: 32,
    height: 2,
    background: "rgba(0,0,0,0.4)",
  },
  brandBlock: {
    display: "flex",
    alignItems: "flex-end",
    gap: 12,
    lineHeight: 1,
  },
  brandName: {
    fontSize: 110,
    fontWeight: 900,
    color: WHITE,
    margin: 0,
    letterSpacing: -2,
    lineHeight: 1,
    textShadow: "4px 4px 0px rgba(0,0,0,0.15)",
    whiteSpace: "nowrap",
  },
  proBadge: {
    fontSize: 22,
    fontWeight: 900,
    background: BLACK,
    color: YELLOW,
    padding: "4px 10px",
    borderRadius: 4,
    marginBottom: 14,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 18,
    fontWeight: 700,
    color: "rgba(0,0,0,0.65)",
    margin: "12px 0 0",
  },
  divider: {
    width: 60,
    height: 3,
    background: "rgba(0,0,0,0.25)",
    borderRadius: 2,
    margin: "28px 0",
  },
  loginSection: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  chooseLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 4,
    color: "rgba(0,0,0,0.5)",
    margin: 0,
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "15px 28px",
    fontSize: 16,
    fontWeight: 700,
    background: WHITE,
    color: BLACK,
    border: "2px solid rgba(0,0,0,0.1)",
    borderRadius: 50,
    cursor: "pointer",
    width: "fit-content",
    fontFamily: "inherit",
    letterSpacing: 0.3,
    boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
    transition: "all 0.2s ease",
  },
  note: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111",
    lineHeight: 1.7,
    background: "rgba(0,0,0,0.1)",
    padding: "12px 18px",
    borderRadius: 10,
    borderLeft: "5px solid #111",
    maxWidth: 380,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 72,
    fontSize: 10,
    letterSpacing: 3,
    color: "rgba(0,0,0,0.4)",
    fontWeight: 700,
  },
  right: {
    flex: 1,
    background: WHITE,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
  podiumWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  podium: { display: "flex", alignItems: "flex-end", gap: 8 },
  placeCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
  },
  block: {
    width: 100,
    background: "#1a1a2e",
    borderRadius: "8px 8px 0 0",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingBottom: 12,
  },
  blockNum: { fontSize: 28, fontWeight: 900, color: YELLOW },
  medalGold: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    marginBottom: 6,
    background: `radial-gradient(circle at 35% 35%, #FFE066, ${YELLOW}, #B8860B)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(245,196,0,0.5)",
    border: "3px solid #fff",
  },
  medalSilver: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    marginBottom: 6,
    background: "radial-gradient(circle at 35% 35%, #f0f0f0, #b0b0b0, #808080)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    border: "3px solid #fff",
  },
  medalBronze: {
    width: 50,
    height: 50,
    borderRadius: "50%",
    marginBottom: 6,
    background: "radial-gradient(circle at 35% 35%, #f0c080, #cd7f32, #8B4513)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    border: "3px solid #fff",
  },
  medalNum: {
    fontSize: 20,
    fontWeight: 900,
    color: WHITE,
    textShadow: "0 1px 3px rgba(0,0,0,0.4)",
  },
  podiumShadow: {
    width: 320,
    height: 16,
    background:
      "radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 70%)",
  },
};
