import crypto from "crypto";
import mongoose from "mongoose";
import Group from "./groupSchema.js";

const DEFAULT_GROUP_NAME = "Please add a group name";
const DEFAULT_GROUP_DESCRIPTION = "Please add a group description";

function sanitizeName(value) {
  return String(value || "").trim();
}

function buildMemberColor(memberCount) {
  const hue = Math.round((memberCount * 137.508) % 360);
  return `hsl(${hue} 70% 55%)`;
}

function formatGroup(group) {
  if (!group) {
    return null;
  }

  return {
    groupId: group.groupId,
    groupName: group.groupName,
    groupDescription: group.groupDescription,
    users: group.users.map((user) => ({
      userId: user.userId.toString(),
      userName: user.userName,
      role: user.role,
      profilePicture: user.profilePicture || "",
      memberColor: user.memberColor,
      availabilities: user.availabilities.map((availability) => ({
        start: availability.start,
        end: availability.end,
      })),
    })),
  };
}

async function createGroup(userName) {
  const finalUserName = sanitizeName(userName);
  const userId = new mongoose.Types.ObjectId();

  const newGroup = new Group({
    groupId: crypto.randomBytes(16).toString("hex"),
    groupName: DEFAULT_GROUP_NAME,
    groupDescription: DEFAULT_GROUP_DESCRIPTION,
    users: [
      {
        userId,
        userName: finalUserName,
        role: "Admin",
        profilePicture: "",
        memberColor: buildMemberColor(0),
        availabilities: [],
      },
    ],
  });

  const result = await newGroup.save();
  return {
    group: formatGroup(result),
    currentUserId: userId.toString(),
  };
}

async function updateGroup(groupId, groupName, groupDescription) {
  const updatedGroup = await Group.findOneAndUpdate(
    { groupId },
    { groupName, groupDescription },
    { new: true },
  );

  if (!updatedGroup) {
    return { message: "Group not found" };
  }

  return formatGroup(updatedGroup);
}

export const updateGroupResponse = async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const groupName = req.body.groupName;
    const groupDescription = req.body.groupDescription;

    if (!groupId) {
      return res.status(400).json({ message: "groupId is required" });
    }

    const result = await updateGroup(groupId, groupName, groupDescription);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Failed to update group:", error);
    return res.status(500).json({ message: "Failed to update group" });
  }
};

export const createGroupResponse = async (req, res) => {
  try {
    const userName = sanitizeName(req.body?.userName);

    if (!userName) {
      return res.status(400).json({ message: "userName is required" });
    }

    const result = await createGroup(userName);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Failed to create group:", error);
    return res.status(500).json({ message: "Failed to create group" });
  }
};

export const fetchGroupResponse = async (req, res) => {
  try {
    const groupId = sanitizeName(req.query?.groupId);

    if (!groupId) {
      return res
        .status(400)
        .json({ message: "groupId query parameter is required" });
    }

    const group = await Group.findOne({ groupId }).lean();

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    return res.json(formatGroup(group));
  } catch (error) {
    console.error("Failed to fetch group:", error);
    return res.status(500).json({ message: "Failed to fetch group" });
  }
};
