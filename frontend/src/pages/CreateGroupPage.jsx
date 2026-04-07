import React, { useMemo, useState } from "react";

function CreateGroupPage() {
  const colorThemes = [
    { name: "Lavender", value: "lavender", color: "#8b5cf6", soft: "#f3e8ff" },
    { name: "Sky", value: "sky", color: "#0ea5e9", soft: "#e0f2fe" },
    { name: "Mint", value: "mint", color: "#10b981", soft: "#d1fae5" },
    { name: "Peach", value: "peach", color: "#f97316", soft: "#ffedd5" },
    { name: "Rose", value: "rose", color: "#ec4899", soft: "#fce7f3" },
  ];

  const adjectives = [
    "Sunny",
    "Cozy",
    "Happy",
    "Bright",
    "Chill",
    "Lucky",
    "Peachy",
    "Dreamy",
    "Golden",
    "Sweet",
  ];

  const nouns = [
    "Planner",
    "Fox",
    "Star",
    "Panda",
    "Cloud",
    "Tulip",
    "Buddy",
    "Otter",
    "Comet",
    "Bee",
  ];

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("private");
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState([]);
  const [theme, setTheme] = useState("lavender");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const selectedTheme =
    colorThemes.find((item) => item.value === theme) || colorThemes[0];

  const generatedUsername = useMemo(() => {
    const adjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(100 + Math.random() * 900);
    return `${adjective}${noun}${number}`;
  }, []);

  const activeUsername = username.trim() || generatedUsername;

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const newErrors = {};

    if (!groupName.trim()) {
      newErrors.groupName = "Please enter a group name.";
    }

    if (!description.trim()) {
      newErrors.description = "Please add a short description.";
    }

    if (members.length === 0) {
      newErrors.members = "Add at least one member email.";
    }

    return newErrors;
  };

  const handleAddMember = () => {
    const email = memberInput.trim().toLowerCase();

    if (!email) {
      setErrors((prev) => ({
        ...prev,
        members: "Please enter an email address first.",
      }));
      return;
    }

    if (!isValidEmail(email)) {
      setErrors((prev) => ({
        ...prev,
        members: "Please enter a valid email address.",
      }));
      return;
    }

    if (members.includes(email)) {
      setErrors((prev) => ({
        ...prev,
        members: "That email has already been added.",
      }));
      return;
    }

    setMembers((prev) => [...prev, email]);
    setMemberInput("");
    setErrors((prev) => ({ ...prev, members: "" }));
    setSuccessMessage("");
  };

  const handleRemoveMember = (emailToRemove) => {
    setMembers((prev) => prev.filter((email) => email !== emailToRemove));
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSuccessMessage("");
      return;
    }

    const groupData = {
      groupName: groupName.trim(),
      description: description.trim(),
      privacy,
      theme,
      username: activeUsername,
      invitedMembers: members,
    };

    console.log("Created group:", groupData);

    setSuccessMessage(
      `Group "${groupName}" created successfully as ${activeUsername}!`
    );

    setGroupName("");
    setDescription("");
    setPrivacy("private");
    setMemberInput("");
    setMembers([]);
    setTheme("lavender");
    setErrors({});
  };

  const handleGenerateNewUsername = () => {
    const adjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(100 + Math.random() * 900);
    setUsername(`${adjective}${noun}${number}`);
  };

  const handleMemberKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddMember();
    }
  };

  return (
    <div
      style={{
        ...styles.page,
        background: `linear-gradient(135deg, ${selectedTheme.soft} 0%, #ffffff 45%, #f8fafc 100%)`,
      }}
    >
      <div style={styles.wrapper}>
        <div style={styles.leftPanel}>
          <div
            style={{
              ...styles.heroIcon,
              backgroundColor: selectedTheme.color,
            }}
          >
            📅
          </div>

          <div style={styles.badge}>Simple shared planning</div>

          <h1 style={styles.heading}>Create your group calendar</h1>

          <p style={styles.subheading}>
            No long sign-up process. Just pick a username, invite your people,
            and start planning together.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.featureEmoji}>✨</span>
              <span>No account required to get started</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureEmoji}>👥</span>
              <span>Invite friends, classmates, or teammates</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureEmoji}>🎨</span>
              <span>Choose a cute color theme for your group</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureEmoji}>🔒</span>
              <span>Keep it private or make it public</span>
            </div>
          </div>

          <div style={styles.previewCard}>
            <div style={styles.previewHeader}>
              <span
                style={{
                  ...styles.previewDot,
                  backgroundColor: selectedTheme.color,
                }}
              />
              <span style={styles.previewTitle}>Live preview</span>
            </div>

            <div style={styles.previewBody}>
              <p style={styles.previewRow}>
                <strong>Group:</strong> {groupName || "Weekend Planners"}
              </p>
              <p style={styles.previewRow}>
                <strong>User:</strong> {activeUsername}
              </p>
              <p style={styles.previewRow}>
                <strong>Privacy:</strong>{" "}
                {privacy === "private" ? "Private 🔐" : "Public 🌍"}
              </p>
              <p style={styles.previewRow}>
                <strong>Invites:</strong> {members.length}
              </p>
            </div>
          </div>
        </div>

        <form style={styles.card} onSubmit={handleCreateGroup}>
          <div style={styles.cardTop}>
            <h2 style={styles.formTitle}>New Group</h2>
            <p style={styles.formSubtitle}>
              Fill out a few details and your group is ready.
            </p>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Pick a username</label>
            <p style={styles.helperText}>
              No sign-up needed. Leave it blank to use an auto-generated one.
            </p>

            <div style={styles.usernameRow}>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={generatedUsername}
                style={styles.input}
              />
              <button
                type="button"
                onClick={handleGenerateNewUsername}
                style={{
                  ...styles.secondaryButton,
                  borderColor: selectedTheme.color,
                  color: selectedTheme.color,
                }}
              >
                🎲 Generate
              </button>
            </div>

            <div
              style={{
                ...styles.generatedBox,
                backgroundColor: selectedTheme.soft,
              }}
            >
              <span style={styles.generatedLabel}>Using username:</span>
              <span
                style={{
                  ...styles.generatedName,
                  color: selectedTheme.color,
                }}
              >
                {activeUsername}
              </span>
            </div>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Group name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Ex: CS Study Squad"
              style={styles.input}
            />
            {errors.groupName && (
              <p style={styles.errorText}>{errors.groupName}</p>
            )}
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell people what this calendar group is for..."
              rows={4}
              style={styles.textarea}
            />
            {errors.description && (
              <p style={styles.errorText}>{errors.description}</p>
            )}
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Privacy</label>
            <div style={styles.privacyRow}>
              <button
                type="button"
                onClick={() => setPrivacy("private")}
                style={{
                  ...styles.privacyButton,
                  borderColor:
                    privacy === "private" ? selectedTheme.color : "#d1d5db",
                  backgroundColor:
                    privacy === "private" ? selectedTheme.soft : "#ffffff",
                  color: privacy === "private" ? selectedTheme.color : "#374151",
                }}
              >
                🔒 Private
              </button>

              <button
                type="button"
                onClick={() => setPrivacy("public")}
                style={{
                  ...styles.privacyButton,
                  borderColor:
                    privacy === "public" ? selectedTheme.color : "#d1d5db",
                  backgroundColor:
                    privacy === "public" ? selectedTheme.soft : "#ffffff",
                  color: privacy === "public" ? selectedTheme.color : "#374151",
                }}
              >
                🌍 Public
              </button>
            </div>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Invite members by email</label>
            <div style={styles.memberRow}>
              <input
                type="email"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyDown={handleMemberKeyDown}
                placeholder="friend@example.com"
                style={styles.input}
              />
              <button
                type="button"
                onClick={handleAddMember}
                style={{
                  ...styles.addButton,
                  backgroundColor: selectedTheme.color,
                }}
              >
                Add
              </button>
            </div>

            {members.length > 0 && (
              <div style={styles.chipsContainer}>
                {members.map((email) => (
                  <div
                    key={email}
                    style={{
                      ...styles.chip,
                      backgroundColor: selectedTheme.soft,
                      borderColor: selectedTheme.color,
                    }}
                  >
                    <span style={styles.chipText}>✉️ {email}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(email)}
                      style={styles.removeChipButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.members && <p style={styles.errorText}>{errors.members}</p>}
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Choose a theme</label>
            <div style={styles.themeRow}>
              {colorThemes.map((themeOption) => (
                <button
                  key={themeOption.value}
                  type="button"
                  onClick={() => setTheme(themeOption.value)}
                  title={themeOption.name}
                  style={{
                    ...styles.themeButton,
                    backgroundColor: themeOption.color,
                    outline:
                      theme === themeOption.value
                        ? `3px solid ${themeOption.soft}`
                        : "none",
                    boxShadow:
                      theme === themeOption.value
                        ? `0 0 0 2px ${themeOption.color}`
                        : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {successMessage && (
            <div
              style={{
                ...styles.successBox,
                backgroundColor: selectedTheme.soft,
                borderColor: selectedTheme.color,
              }}
            >
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.primaryButton,
              backgroundColor: selectedTheme.color,
            }}
          >
            ✨ Create Group
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 20px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  wrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1.1fr",
    gap: "28px",
    alignItems: "stretch",
  },
  leftPanel: {
    padding: "20px 10px 20px 6px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  heroIcon: {
    width: "72px",
    height: "72px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    marginBottom: "18px",
    boxShadow: "0 18px 35px rgba(15, 23, 42, 0.12)",
  },
  badge: {
    display: "inline-block",
    alignSelf: "flex-start",
    padding: "8px 12px",
    borderRadius: "999px",
    backgroundColor: "#ffffff",
    color: "#475569",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid #e2e8f0",
    marginBottom: "16px",
  },
  heading: {
    margin: "0 0 12px 0",
    fontSize: "42px",
    lineHeight: "1.05",
    color: "#0f172a",
  },
  subheading: {
    margin: "0 0 24px 0",
    fontSize: "17px",
    lineHeight: "1.7",
    color: "#475569",
    maxWidth: "520px",
  },
  featureList: {
    display: "grid",
    gap: "12px",
    marginBottom: "28px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "rgba(255,255,255,0.72)",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "14px 16px",
    color: "#334155",
    fontSize: "15px",
    fontWeight: "500",
  },
  featureEmoji: {
    fontSize: "18px",
  },
  previewCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
    maxWidth: "440px",
  },
  previewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
  },
  previewDot: {
    width: "12px",
    height: "12px",
    borderRadius: "999px",
  },
  previewTitle: {
    fontWeight: "700",
    color: "#0f172a",
  },
  previewBody: {
    display: "grid",
    gap: "10px",
  },
  previewRow: {
    margin: 0,
    color: "#475569",
    lineHeight: "1.5",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "28px",
    padding: "28px",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
  },
  cardTop: {
    marginBottom: "22px",
  },
  formTitle: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    color: "#0f172a",
  },
  formSubtitle: {
    margin: 0,
    color: "#64748b",
    lineHeight: "1.6",
  },
  section: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "15px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  helperText: {
    margin: "0 0 10px 0",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "15px",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "15px",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    resize: "vertical",
    boxSizing: "border-box",
    minHeight: "110px",
  },
  usernameRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "10px",
    alignItems: "center",
  },
  generatedBox: {
    marginTop: "10px",
    borderRadius: "14px",
    padding: "12px 14px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    alignItems: "center",
  },
  generatedLabel: {
    color: "#475569",
    fontSize: "14px",
  },
  generatedName: {
    fontWeight: "700",
    fontSize: "14px",
  },
  secondaryButton: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid",
    backgroundColor: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  privacyRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  privacyButton: {
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "15px",
  },
  memberRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "10px",
    alignItems: "center",
  },
  addButton: {
    padding: "14px 20px",
    borderRadius: "16px",
    border: "none",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "15px",
  },
  chipsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "14px",
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    borderRadius: "999px",
    border: "1px solid",
  },
  chipText: {
    fontSize: "14px",
    color: "#334155",
  },
  removeChipButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: "18px",
    color: "#475569",
    lineHeight: 1,
    padding: 0,
  },
  themeRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  themeButton: {
    width: "40px",
    height: "40px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
  },
  successBox: {
    border: "1px solid",
    borderRadius: "16px",
    padding: "14px 16px",
    marginBottom: "18px",
    color: "#334155",
    fontWeight: "600",
  },
  errorText: {
    margin: "8px 0 0 0",
    color: "#dc2626",
    fontSize: "14px",
    fontWeight: "500",
  },
  primaryButton: {
    width: "100%",
    border: "none",
    borderRadius: "18px",
    padding: "16px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.12)",
  },
};

export default CreateGroupPage;