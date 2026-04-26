import React, { useMemo, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { useParams } from "react-router-dom";
import "./GroupMembersPage.css";

function GroupMembersPage() {
  const { groupId } = useParams();
  const [showInvitePanel, setShowInvitePanel] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
    const body = encodeURIComponent(
      `Hi,

Use this link to join:
${joinLink}`,
    );

    window.location.href = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="group-members-container">
      <div className="group-members-wrapper">
        <div className="group-members-header">
          <h1 className="group-title">Members</h1>
          <p>Group details and member cards will appear here once integration is connected.</p>
        </div>

        <div className="group-info-card">
          <div className="group-header-row">
            <div className="group-header-content">
              {isEditingGroup ? (
                <>
                  <input
                    className="group-title-input"
                    value=""
                    placeholder="Group name"
                    disabled
                    readOnly
                  />
                  <textarea
                    className="group-info-textarea group-description-input"
                    value=""
                    placeholder="Group description"
                    disabled
                    readOnly
                  />
                </>
              ) : (
                <>
                  <h2 className="group-name-placeholder">Group name unavailable</h2>
                  <p className="group-description-text group-subtitle">
                    Group description will load here when real group data is available.
                  </p>
                </>
              )}
            </div>

            <div className="group-header-actions">
              <button
                className="save-group-button"
                type="button"
                disabled
                onClick={() => setIsEditingGroup((value) => !value)}
              >
                Edit
              </button>
            </div>
          </div>
        </div>

        <div className="group-info-card">
          <div className="section-heading-row">
            <h2>Invite Members</h2>
            <button
              className="save-group-button"
              type="button"
              onClick={() => setShowInvitePanel((value) => !value)}
            >
              {showInvitePanel ? "Hide Invite Tools" : "Show Invite Tools"}
            </button>
          </div>

          {showInvitePanel && (
            <div className="invite-panel">
              <label className="invite-label">Join group link</label>
              <div className="invite-link-row">
                <input className="invite-link-input" type="text" value={joinLink} readOnly />
                <button className="invite-action-button" type="button" onClick={copyJoinLink}>
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
                <button className="invite-action-button" type="button" onClick={handleSendInvite}>
                  Send Invite
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="members-section">
          <div className="section-heading-row">
            <h2>Group Members</h2>
          </div>

          <div className="members-grid">
            <div className="member-card member-card-empty">
              <div className="member-card-top">
                <span className="role-badge role-badge-empty">Role unavailable</span>
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
                  <button className="save-group-button member-save-button" type="button" disabled>
                    Save Profile
                  </button>
                </div>
              ) : (
                <div className="member-name member-name-empty">
                  Member cards will appear here after data integration.
                </div>
              )}
            </div>
          </div>

          <p className="members-empty-message">
            No real member data is connected in this version of the page.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GroupMembersPage;
