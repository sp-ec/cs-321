import React, { useEffect, useState } from "react";
import "./JoinGroupPage.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchGroup, joinGroup } from "../lib/api";
import { saveGroupSession } from "../lib/groupSession";

function JoinGroupPage() {
  const { groupId } = useParams();
  const [groupData, setGroupData] = useState(null);
  const [userName, setUserName] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadGroup = async () => {
      try {
        const data = await fetchGroup(groupId);
        setGroupData(data);
        setErrorMessage(location.state?.message || "");
      } catch {
        navigate("/");
      }
    };

    loadGroup();
  }, [groupId, location.state, navigate]);

  const handleJoinGroup = async () => {
    setErrorMessage("");

    if (selectedUserId) {
      const selectedMember = groupData?.users.find(
        (user) => user.userId === selectedUserId,
      );

      if (!selectedMember) {
        setErrorMessage("Select a valid returning member.");
        return;
      }

      saveGroupSession(groupId, selectedMember);
      navigate(`/${groupId}/calendar`);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await joinGroup({
        groupId,
        userName,
      });
      const joinedMember =
        result.group?.users.find((user) => user.userId === result.currentUserId) ||
        result.group?.users.find((user) => user.userName === userName.trim());

      saveGroupSession(groupId, {
        userId: result.currentUserId,
        userName: joinedMember?.userName || userName.trim(),
      });
      navigate(`/${groupId}/calendar`);
    } catch (error) {
      if (error.status === 409) {
        setErrorMessage("That name is already taken in this group.");
      } else {
        setErrorMessage(error.message || "Unable to join group.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div>
        <h1 className="font-bold mt-8">
          Join Group: {groupData?.groupName || "Group Name Loading..."}
        </h1>
      </div>
      <div>
        <input
          type="text"
          placeholder="Enter your name"
          className="border px-4 py-2 rounded"
          value={userName}
          onChange={(e) => {
            setUserName(e.target.value);
            if (selectedUserId) {
              setSelectedUserId("");
            }
          }}
        />
        <p className="mt-8">or if you've already joined, select your name:</p>
        <select
          className="border px-4 py-2 rounded mt-8 join-group-select"
          value={selectedUserId}
          onChange={(e) => {
            setSelectedUserId(e.target.value);
            if (e.target.value) {
              setUserName("");
            }
          }}
        >
          <option value="">Select your name</option>
          {groupData?.users.map((user) => (
            <option key={user.userId} value={user.userId}>
              {user.userName}
            </option>
          ))}
        </select>
      </div>
      {errorMessage ? <p className="join-group-error">{errorMessage}</p> : null}
      <br />
      <div>
        <button
          id="goToCalendar"
          className="save-group-button"
          type="button"
          onClick={handleJoinGroup}
          disabled={(!userName.trim() && !selectedUserId) || isSubmitting}
        >
          Go To Calendar{" "}
          {selectedUserId
            ? `as ${
                groupData?.users.find((user) => user.userId === selectedUserId)
                  ?.userName || ""
              }`
            : userName
              ? `as ${userName}`
              : ""}
        </button>
      </div>
    </div>
  );
}

export default JoinGroupPage;
