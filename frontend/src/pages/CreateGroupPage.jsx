import React, { useMemo, useState } from "react";

function CreateGroupPage() {
  const adjectives = ["calm", "quick", "blue", "smart", "bright"];
  const nouns = ["fox", "star", "cloud", "group", "team"];

  const randomUsername = useMemo(() => {
    const adjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(100 + Math.random() * 900);
    return `${adjective}${noun}${number}`;
  }, []);

  const [username, setUsername] = useState("");
  const [createdName, setCreatedName] = useState("");
  const [groupLink, setGroupLink] = useState("");

  const handleCreateGroup = (e) => {
    e.preventDefault();

    const finalUsername = username.trim() || randomUsername;
    const groupId = Math.random().toString(36).slice(2, 8);

    setCreatedName(finalUsername);
    setGroupLink(`http://localhost:5173/join/${groupId}`);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create a Group</h1>
        <p style={styles.text}>
          Enter a username, or leave it blank and one will be assigned.
        </p>

        <form onSubmit={handleCreateGroup}>
          <input
            type="text"
            placeholder={randomUsername}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Create Group
          </button>
        </form>

        {createdName && (
          <div style={styles.resultBox}>
            <p style={styles.resultText}>
              <strong>Username:</strong> {createdName}
            </p>
            <p style={styles.resultText}>
              <strong>Share link:</strong>
            </p>
            <p style={styles.link}>{groupLink}</p>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    padding: "32px",
    border: "1px solid #dcdcdc",
    borderRadius: "8px",
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: "28px",
    color: "#111111",
  },
  text: {
    margin: "0 0 20px 0",
    fontSize: "14px",
    color: "#555555",
    lineHeight: "1.5",
  },
  input: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    border: "1px solid #cccccc",
    borderRadius: "6px",
    marginBottom: "12px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    backgroundColor: "#111111",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  resultBox: {
    marginTop: "20px",
    padding: "16px",
    backgroundColor: "#fafafa",
    border: "1px solid #dddddd",
    borderRadius: "6px",
  },
  resultText: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    color: "#222222",
  },
  link: {
    margin: 0,
    fontSize: "14px",
    color: "#333333",
    wordBreak: "break-all",
  },
};

export default CreateGroupPage;