import React from "react";
import "./JoinGroupPage.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function JoinGroupPage() {
  const { groupId } = useParams();
  const [groupData, setGroupData] = useState(null);
  const [userName, setUserName] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkGroupExists = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/groups/fetch?groupId=${groupId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (!response.ok) {
          //if 404/error, send back to home page
          console.log("Group not found, redirecting to home page.");
          navigate("/");
        }

        try {
          const data = await response.json();
          setGroupData(data);
        } catch (error) {
          console.error("Error parsing group data:", error);
        }
      } catch (error) {
        navigate("/");
      }
    };
    console.log("GroupID: ", groupId);
    checkGroupExists();
  }, [groupId, navigate]);

  const handleJoinGroup = async () => {
    if (selectedUser) {
      navigate(`/${groupId}/calendar?userName=${selectedUser}`);
    } else {
      try {
        const response = await fetch(`http://localhost:3000/api/groups/join`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupId,
            userName: userName,
          }),
        });
        if (response.ok) {
          navigate(`/${groupId}/calendar?userName=${userName}`);
        }
      } catch (error) {
        console.error("Error joining group:", error);
      }
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
          onChange={(e) => setUserName(e.target.value)}
        />
        <p className="mt-8">or if you've already joined, select your name:</p>
        <select
          className="border px-4 py-2 rounded mt-8"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">Select your name</option>
          {groupData?.users.map((user) => (
            <option key={user.userId} value={user.userName}>
              {user.userName}
            </option>
          ))}
        </select>
      </div>
      <br />
      <div>
        <button
          id="goToCalendar"
          className="save-group-button"
          type="button"
          onClick={handleJoinGroup}
          disabled={!userName && !selectedUser}
        >
          Go To Calendar{" "}
          {selectedUser
            ? `as ${selectedUser}`
            : userName
              ? `as ${userName}`
              : ""}
        </button>
      </div>
    </div>
  );
}

export default JoinGroupPage;
