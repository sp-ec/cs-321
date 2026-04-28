import React, { useMemo, useState, useEffect } from "react";
import { FiEdit2 } from "react-icons/fi";
import { useParams, useNavigate } from "react-router-dom";
import "./GroupMembersPage.css";

function GroupMembersPage() {
  const { groupId } = useParams();
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [groupData, setGroupData] = useState(null);
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

  const joinLink = useMemo(() => {
    if (!groupId) {
      return "";
    }

    return `${window.location.origin}/${groupId}/join`;
  }, [groupId]);

  const copyJoinLink = async () => {
    if (!joinLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(joinLink);
    } catch {
      // UI shell only: no error surface yet.
    }
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim() || !joinLink) {
      return;
    }

    const subject = encodeURIComponent("Join this group");
    const body = encodeURIComponent(`Hi, Use this link to join: ${joinLink}`);

    window.location.href = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;
  };

  const handleSaveGroup = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/groups/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId,
          groupName: groupData?.groupName,
          groupDescription: groupData?.groupDescription,
        }),
      });
      if (response.ok) {
        setIsEditingGroup(false);
      }
    } catch (error) {
      console.error("Error saving group:", error);
    }
  };

  return (
    <div className="group-members-container">
      <div className="group-members-wrapper">
        <div className="group-members-header">
          <h1 className="group-title">Members</h1>
          <p>
            Group details and member cards will appear here once integration is
            connected.
          </p>
        </div>

        <div className="group-info-card">
          <div className="group-header-row">
            <div className="group-header-content">
              {isEditingGroup ? (
                <>
                  <textarea
                    className="mb-2 title-info-textarea"
                    value={groupData?.groupName || ""}
                    placeholder="Group name"
                    onChange={(e) =>
                      setGroupData({ ...groupData, groupName: e.target.value })
                    }
                  />
                  <textarea
                    className="group-info-textarea group-description-input"
                    value={groupData?.groupDescription || ""}
                    placeholder="Group description"
                    onChange={(e) =>
                      setGroupData({
                        ...groupData,
                        groupDescription: e.target.value,
                      })
                    }
                  />
                </>
              ) : (
                <>
                  <h2 className="group-name-placeholder">
                    {groupData?.groupName || "Group name loading..."}
                  </h2>
                  <p className="group-description-text group-subtitle">
                    {groupData?.groupDescription ||
                      "Group description unavailable."}
                  </p>
                </>
              )}
            </div>

            <div className="group-header-actions mt-4">
              <button
                className="save-group-button"
                type="button"
                disabled={groupData == null}
                onClick={() => {
                  if (isEditingGroup) {
                    handleSaveGroup();
                  } else {
                    setIsEditingGroup(true);
                  }
                }}
              >
                {isEditingGroup ? "Save" : "Edit"}
              </button>
            </div>
          </div>
        </div>

        <div className="members-section">
          <div className="section-heading-row">
            <h2>Group Members</h2>
          </div>

          <div className="members-grid">
            <div className="member-card member-card-empty">
              <div className="member-card-top">
                <span className="role-badge role-badge-empty">
                  Role unavailable
                </span>
                <button
                  className="member-edit-button"
                  type="button"
                  aria-label="Edit profile"
                  disabled
                  onClick={() => setIsEditingProfile((value) => !value)}
                >
                  <FiEdit2 size={16} />
                </button>
              </div>

              <div className="profile-container profile-container-empty">
                <div className="profile-empty-circle">No Image</div>
              </div>

              {isEditingProfile ? (
                <div className="member-editor">
                  <input
                    className="group-info-input"
                    value=""
                    placeholder="Username"
                    disabled
                    readOnly
                  />
                  <button
                    className="save-group-button member-save-button"
                    type="button"
                    disabled
                  >
                    Save Profile
                  </button>
                </div>
              ) : (
                <div className="member-name member-name-empty">
                  Member cards will appear here after data integration.
                </div>
              )}
            </div>

            <button
              className="member-card invite-member-card"
              type="button"
              onClick={() => setShowInvitePanel((value) => !value)}
            >
              <div className="invite-member-icon">+</div>
              <div className="invite-member-title">Invite Member</div>
              <p className="invite-member-text">
                Share a join link or send an invite email.
              </p>
            </button>
          </div>

          {showInvitePanel && (
            <div className="invite-panel members-invite-panel">
              <label className="invite-label">Join group link</label>
              <div className="invite-link-row">
                <input
                  className="invite-link-input"
                  type="text"
                  value={joinLink}
                  readOnly
                />
                <button
                  className="invite-action-button"
                  type="button"
                  onClick={copyJoinLink}
                >
                  Copy Link
                </button>
              </div>

              <label className="invite-label">Send by email</label>
              <div className="invite-link-row">
                <input
                  className="invite-email-input"
                  type="email"
                  placeholder="Enter member email"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                />
                <button
                  className="invite-action-button"
                  type="button"
                  onClick={handleSendInvite}
                >
                  Send Invite
                </button>
              </div>
            </div>
          )}

          <p className="members-empty-message">
            No real member data is connected in this version of the page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GroupMembersPage;
