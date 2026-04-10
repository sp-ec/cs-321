import React, { useState } from "react";
import "./GroupMembersPage.css";

function GroupMembersPage() {
    // Frontend-only placeholder group data
    const [groupData, setGroupData] = useState({
        id: "group-123",
        groupName: "Gryffindor Study Circle",
        description: "A group for planning hangouts, adventures, and everything in between.",
        privacy: "private",
        creatorUsername: "HarryPotter",
        currentUsername: "HarryPotter", // placeholder current user
        members: [
            {
                id: 1,
                name: "Harry Potter",
                role: "Owner",
                profilePicture: "",
            },
            {
                id: 2,
                name: "Hermione Granger",
                role: "Admin",
                profilePicture: "",
            },
            {
                id: 3,
                name: "Ron Weasley",
                role: "Member",
                profilePicture: "",
            },
        ],
    });

    const [showInvitePanel, setShowInvitePanel] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [editedDescription, setEditedDescription] = useState(groupData.description);
    const [editedPrivacy, setEditedPrivacy] = useState(groupData.privacy);

    const isOwner = groupData.currentUsername === groupData.creatorUsername;
    const joinLink = `${window.location.origin}/join?group=${groupData.id}`;

    const getInitials = (name) => {
        if (!name || !name.trim()) return "?";

        return name
            .split(" ")
            .filter(Boolean)
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    };

    const getRoleBadgeClass = (role) => {
        if (role === "Owner") return "role-badge role-owner";
        if (role === "Admin") return "role-badge role-admin";
        return "role-badge role-member";
    };

    const copyJoinLink = async () => {
        try {
            await navigator.clipboard.writeText(joinLink);
            alert("Join link copied to clipboard.");
        } catch (error) {
            alert("Could not copy the link.");
        }
    };

    const handleSendInvite = () => {
        if (!inviteEmail.trim()) {
            alert("Please enter an email address.");
            return;
        }

        const subject = encodeURIComponent(`Join ${groupData.groupName}`);
        const body = encodeURIComponent(
            `Hi,

You have been invited to join the group "${groupData.groupName}".

Use this link to join:
${joinLink}

If you do not enter a role when joining, your role will default to Member.

Thanks!`
        );

        window.location.href = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;
    };

    const handleSaveGroupInfo = () => {
        setGroupData((prev) => ({
            ...prev,
            description: editedDescription,
            privacy: editedPrivacy,
        }));

        alert("Frontend placeholder: group details updated.");
    };

    return (
			<div className="group-members-container">
				<div className="group-members-wrapper">
					<div className="group-members-header">
						{/* Centered group name */}
						<h1 className="group-title">{groupData.groupName}</h1>

						<p>View group details and members.</p>
					</div>

					<div className="group-info-card">
						<div className="group-info-row group-info-column">
							<span className="group-info-label">Description</span>

							{isOwner ? (
								<textarea
									className="group-info-textarea"
									value={editedDescription}
									onChange={(e) => setEditedDescription(e.target.value)}
								/>
							) : (
								<p className="group-description-text">
									{groupData.description}
								</p>
							)}
						</div>

						{isOwner && (
							<button
								className="save-group-button"
								onClick={handleSaveGroupInfo}
							>
								Save Group Details
							</button>
						)}
					</div>

					{showInvitePanel && (
						<div className="invite-panel">
							<div className="invite-panel-header">
								<h2>Invite New Member</h2>
								<button
									className="close-invite-button"
									onClick={() => setShowInvitePanel(false)}
								>
									×
								</button>
							</div>

							<label className="invite-label">Join Group Link</label>
							<div className="invite-link-row">
								<input
									className="invite-link-input"
									type="text"
									value={joinLink}
									readOnly
								/>
								<button className="invite-action-button" onClick={copyJoinLink}>
									Copy Link
								</button>
							</div>

							<label className="invite-label">Send by Email</label>
							<div className="invite-link-row">
								<input
									className="invite-email-input"
									type="email"
									placeholder="Enter member email"
									value={inviteEmail}
									onChange={(e) => setInviteEmail(e.target.value)}
								/>
								<button
									className="invite-action-button"
									onClick={handleSendInvite}
								>
									Send Invite
								</button>
							</div>
						</div>
					)}

					<div className="members-grid">
						{groupData.members.map((member) => (
							<div key={member.id} className="member-card">
								<div className="member-card-top">
									<span className={getRoleBadgeClass(member.role)}>
										{member.role}
									</span>
								</div>

								<div className="profile-container">
									{member.profilePicture ? (
										<img src={member.profilePicture} alt={member.name} />
									) : (
										<span className="profile-initials">
											{getInitials(member.name)}
										</span>
									)}
								</div>

								<div className="member-name">{member.name}</div>
							</div>
						))}

						<div className="add-card" onClick={() => setShowInvitePanel(true)}>
							<div className="add-icon">+</div>
							<h2>Add Member</h2>
							<p>Invite someone with a join link or email</p>
						</div>
					</div>
				</div>
			</div>
		);
}

export default GroupMembersPage;