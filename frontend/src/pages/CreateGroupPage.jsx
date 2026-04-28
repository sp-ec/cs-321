import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateGroupPage() {
  const adjectives = ["calm", "quick", "blue", "smart", "bright"];
  const nouns = ["fox", "star", "cloud", "group", "team"];

  const randomUsername = useMemo(() => {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(100 + Math.random() * 900);
    return `${adjective}${noun}${number}`;
  }, []);

  const [groupName, setGroupName] = useState("");
  const [username, setUsername] = useState("");
  const [createdGroup, setCreatedGroup] = useState(null);
  const [groupLink, setGroupLink] = useState("");

  //   const handleCreateGroup = (e) => {
  //     e.preventDefault();

  //     const finalUsername = username.trim() || randomUsername;
  //     const groupId = Math.random().toString(36).slice(2, 8);

  //     setCreatedName(finalUsername);
  //     setGroupLink(`http://localhost:5173/${groupId}/join`);
  //   };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/groups/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupName: groupName,
          userName: username,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setCreatedGroup(data);
        setGroupLink(`http://localhost:5173/${data.group.groupId}/join`);
      } else {
        console.error("Failed to create group:", response.statusText);
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  };

  const navigate = useNavigate();

  return (
    <div style={styles.page} className="flex flex-col gap-y-16">
      <h1 className="text-2xl">ezCalendar</h1>
      <div style={styles.card}>
        <h1 style={styles.title}>Create a Group</h1>

        <form onSubmit={handleCreateGroup}>
          <label style={styles.text}>Group Name</label>
          <input
            type="text"
            placeholder={'Example: "CS 321 Study Group"'}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={styles.input}
          />
          <label style={styles.text}>Your Name</label>
          <input
            type="text"
            placeholder={"Your Name"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <button
            type="submit"
            style={styles.button}
            className="save-group-button"
            disabled={!groupName.trim() || !username.trim()}
          >
            Create Group
          </button>
        </form>

        {createdGroup && (
          <>
            <div style={styles.resultBox}>
              <p style={styles.resultText}>
                <strong>Group Name:</strong> {createdGroup.group.groupName}
              </p>
              <p style={styles.resultText}>
                <strong>Username:</strong>{" "}
                {createdGroup.group.users[0].userName}
              </p>
              <p style={styles.resultText}>
                <strong>Share link:</strong>
              </p>
              <a
                href={groupLink}
                style={styles.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {groupLink}
              </a>
            </div>
            <button
              type="submit"
              style={styles.button}
              className="mt-6"
              onClick={() =>
                navigate(
                  `/${createdGroup.group.groupId}/calendar?userName=${createdGroup.group.users[0].userName}`,
                )
              }
            >
              Go to Group Calendar
            </button>
          </>
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
    backgroundColor: "#09090B",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#18181B",
    padding: "32px",
    border: "1px solid oklch(37% 0.013 285.805)",
    borderRadius: "8px",
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: "28px",
    color: "#ffffff",
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
    border: "1px solid oklch(37% 0.013 285.805)",
    borderRadius: "6px",
    marginBottom: "12px",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "12px",
    fontSize: "14px",
    backgroundColor: "#ffffff",
    color: "#000000",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  resultBox: {
    marginTop: "20px",
    padding: "16px",
    backgroundColor: "oklch(27.4% 0.006 286.033)",
    border: "1px solid oklch(37% 0.013 285.805)",
    borderRadius: "6px",
  },
  resultText: {
    margin: "0 0 8px 0",
    fontSize: "14px",
    color: "#ffffff",
  },
  link: {
    margin: 0,
    fontSize: "14px",
    color: "#646cff",
    wordBreak: "break-all",
  },
};

export default CreateGroupPage;
