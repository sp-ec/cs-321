import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./GroupMembersPage.css";
import { fetchGroup, updateGroup } from "../../lib/api";
import {
  clearGroupSession,
  findSessionMember,
  getGroupSession,
} from "../../lib/groupSession";
import { getAvatarStyle, getInitials } from "../../lib/avatar";

function GroupMembersPage() {
  const { groupId } = useParams();
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [groupData, setGroupData] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [isSavingGroup, setIsSavingGroup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGroup = async () => {
      const session = getGroupSession(groupId);

      if (!session) {
        navigate(`/${groupId}/join`, {
          replace: true,
          state: { message: "Join or select your name to access this group." },
        });
        return;
      }

      try {
        const data = await fetchGroup(groupId);
        const member = findSessionMember(data, session);

        if (!member) {
          clearGroupSession(groupId);
          navigate(`/${groupId}/join`, {
            replace: true,
            state: { message: "Select your name again to continue." },
          });
          return;
        }

        setGroupData(data);
        setCurrentMember(member);
      } catch {
        navigate("/");
      }
    };

    loadGroup();
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
      setNoticeMessage("Join link copied.");
      setErrorMessage("");
    } catch {
      setErrorMessage("Unable to copy the join link.");
    }
  };

  const handleSendInvite = () => {
    if (!inviteEmail.trim() || !joinLink) {
      setErrorMessage("Enter an email address before sending an invite.");
      return;
    }

    const subject = encodeURIComponent("Join this group");
    const body = encodeURIComponent(`Hi, Use this link to join: ${joinLink}`);

    window.location.href = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;
  };

  const handleSaveGroup = async () => {
    if (!currentMember) {
      setErrorMessage("Sign back into the group before editing.");
      return;
    }

    setIsSavingGroup(true);
    setErrorMessage("");
    setNoticeMessage("");

    try {
      const result = await updateGroup({
        groupId,
        actingUserId: currentMember.userId,
        groupName: groupData?.groupName,
        groupDescription: groupData?.groupDescription,
      });

      setGroupData(result.group);
      setCurrentMember(
        result.group.users.find((user) => user.userId === currentMember.userId) ||
          currentMember,
      );
      setIsEditingGroup(false);
      setNoticeMessage("Group details saved.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to save group details.");
    } finally {
      setIsSavingGroup(false);
    }
  };

  const members = groupData?.users || [];

  return (
    <div className="group-members-container">
      <div className="group-members-wrapper">
        <div className="group-members-header">
          <h1 className="group-title">Members</h1>
          <p>Manage group details and see everyone currently in this group.</p>
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
                disabled={groupData == null || isSavingGroup}
                onClick={() => {
                  if (isEditingGroup) {
                    handleSaveGroup();
                  } else {
                    setErrorMessage("");
                    setNoticeMessage("");
                    setIsEditingGroup(true);
                  }
                }}
              >
                {isEditingGroup
                  ? isSavingGroup
                    ? "Saving..."
                    : "Save"
                  : "Edit"}
              </button>
            </div>
          </div>
        </div>

        {errorMessage ? <p className="members-status-error">{errorMessage}</p> : null}
        {noticeMessage ? (
          <p className="members-status-notice">{noticeMessage}</p>
        ) : null}

        <div className="members-section">
          <div className="section-heading-row">
            <h2>Group Members</h2>
          </div>

          <div className="members-grid">
            {members.map((member) => {
              const isCurrentMember = member.userId === currentMember?.userId;
              return (
                <div className="member-card" key={member.userId}>
                  <div
                    className="profile-container"
                    style={getAvatarStyle(member.memberColor)}
                  >
                    <div className="profile-initials">
                      {getInitials(member.userName)}
                    </div>
                  </div>

                  <div className="member-name">{member.userName}</div>
                  <p className="member-status-label">
                    {isCurrentMember ? "Current member" : "Group member"}
                  </p>
                  <p className="member-meta">
                    {member.availabilities?.length || 0} availability block
                    {(member.availabilities?.length || 0) === 1 ? "" : "s"}
                  </p>
                </div>
              );
            })}

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
        </div>
      </div>
    </div>
  );
}

export default GroupMembersPage;
