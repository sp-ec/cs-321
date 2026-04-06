import React, { useState } from "react";
import "./GroupMembers.css";

function GroupMembers() {
    const [members, setMembers] = useState([]);

    const handleAddMember = () => {
        const newMember = {
            id: Date.now(),
            name: `New Member ${members.length + 1}`,
            role: "Member",
            profilePicture: "",
        };

        setMembers((prev) => [...prev, newMember]);
    };

    const getInitials = (name) =>
        name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

    const getRoleClass = (role) => {
        if (role === "Owner") return "role-badge role-owner";
        if (role === "Admin") return "role-badge role-admin";
        return "role-badge role-member";
    };

    return (
        <div className="group-members-container">
            <div className="group-members-wrapper">
                <div className="group-members-header">
                    <h1>Group Members</h1>
                    <p>View everyone in your group and add new members.</p>
                </div>

                <div className="members-grid">
                    {members.map((member) => (
                        <div key={member.id} className="member-card">
                            <div className={getRoleClass(member.role)}>
                                {member.role}
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

                    {/* ADD MEMBER CARD */}
                    <div className="add-card" onClick={handleAddMember}>
                        <div className="add-icon">+</div>
                        <h2>Add Member</h2>
                        <p>Click to add a new member</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GroupMembers;