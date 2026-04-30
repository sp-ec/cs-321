import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../lib/api";
import { saveGroupSession } from "../lib/groupSession";

function CreateGroupPage() {
  const [groupName, setGroupName] = useState("");
  const [username, setUsername] = useState("");
  const [createdGroup, setCreatedGroup] = useState(null);
  const [groupLink, setGroupLink] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const data = await createGroup({
        groupName,
        userName: username,
      });

      saveGroupSession(data.group.groupId, {
        userId: data.currentUserId,
        userName: data.group.users[0]?.userName || username.trim(),
      });
      setCreatedGroup(data);
      setGroupLink(`${window.location.origin}/${data.group.groupId}/join`);
    } catch (error) {
      setErrorMessage(error.message || "Unable to create group.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            placeholder="Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <button
            type="submit"
            style={styles.button}
            className="save-group-button"
            disabled={!groupName.trim() || !username.trim() || isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Group"}
          </button>
        </form>

        {errorMessage ? <p style={styles.errorText}>{errorMessage}</p> : null}

        {createdGroup && (
          <>
            <div style={styles.resultBox}>
              <p style={styles.resultText}>
                <strong>Group Name:</strong> {createdGroup.group.groupName}
              </p>
              <p style={styles.resultText}>
                <strong>Username:</strong> {createdGroup.group.users[0].userName}
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
              type="button"
              style={styles.button}
              className="mt-6"
              onClick={() => navigate(`/${createdGroup.group.groupId}/calendar`)}
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
  errorText: {
    marginTop: "12px",
    fontSize: "14px",
    color: "#fda4af",
  },
  link: {
    margin: 0,
    fontSize: "14px",
    color: "#646cff",
    wordBreak: "break-all",
  },
};

export default CreateGroupPage;
