import crypto from "crypto";
import mongoose from "mongoose";
import Group from "./groupSchema.js";

const DEFAULT_GROUP_NAME = "Please add a group name";
const DEFAULT_GROUP_DESCRIPTION = "Please add a group description";

function sanitizeName(value) {
  return String(value || "").trim();
}

function normalizeUserName(value) {
  return sanitizeName(value).toLowerCase();
}

function buildMemberColor(memberCount) {
  const hue = Math.round((memberCount * 137.508) % 360);
  return `hsl(${hue},70%,55%)`;
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
      memberColor: user.memberColor,
      availabilities: user.availabilities.map((availability) => ({
        start: availability.start,
        end: availability.end,
      })),
    })),
  };
}

async function createGroup(userName, groupName) {
  const finalUserName = sanitizeName(userName);
  const userId = new mongoose.Types.ObjectId();

  const newGroup = new Group({
    groupId: crypto.randomBytes(16).toString("hex"),
    groupName: groupName,
    groupDescription: DEFAULT_GROUP_DESCRIPTION,
    users: [
      {
        userId,
        userName: finalUserName,
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

async function joinGroup(groupId, userName) {
  const group = await Group.findOne({ groupId });
  if (!group) {
    return { type: "not_found" };
  }

  const memberCount = group.users.length;
  const finalUserName = sanitizeName(userName);
  const duplicateUser = group.users.find(
    (user) => normalizeUserName(user.userName) === normalizeUserName(finalUserName),
  );

  if (duplicateUser) {
    return { type: "duplicate_name" };
  }

  const userId = new mongoose.Types.ObjectId();
  const updatedGroup = await Group.findOneAndUpdate(
    { groupId },
    {
      $push: {
        users: {
          userId,
          userName: finalUserName,
          memberColor: buildMemberColor(memberCount),
          availabilities: [],
        },
      },
    },
    { new: true },
  );

  if (!updatedGroup) {
    return { type: "not_found" };
  }

  return {
    type: "joined",
    group: formatGroup(updatedGroup),
    currentUserId: userId.toString(),
  };
}

async function identifyGroupMember(groupId, userName) {
  const group = await Group.findOne({ groupId });

  if (!group) {
    return { type: "not_found" };
  }

  const finalUserName = sanitizeName(userName);
  const matchedUser = group.users.find(
    (user) => normalizeUserName(user.userName) === normalizeUserName(finalUserName),
  );

  if (!matchedUser) {
    return { type: "no_match", matched: false };
  }

  return {
    type: "matched",
    matched: true,
    currentUserId: matchedUser.userId.toString(),
    group: formatGroup(group),
  };
}

async function setUserAvailabilities(groupId, userName, availabilities) {
  const group = await Group.findOne({ groupId });
  if (!group) {
    return { message: "Group not found" };
  }

  const user = group.users.find((u) => u.userName === userName);
  if (!user) {
    return { message: "User not found" };
  }

  const updatedGroup = await Group.findOneAndUpdate(
    { groupId, "users.userName": userName },
    { $set: { "users.$.availabilities": availabilities } },
    { new: true },
  );

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

export const setUserAvailabilitiesResponse = async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const userName = req.body.userName;
    const availabilities = req.body.availabilities;

    if (!groupId) {
      return res.status(400).json({ message: "groupId is required" });
    }

    if (!userName) {
      return res.status(400).json({ message: "userName is required" });
    }

    if (!availabilities) {
      return res.status(400).json({ message: "userName is required" });
    }

    const result = await setUserAvailabilities(
      groupId,
      userName,
      availabilities,
    );
    return res.status(201).json(result);
  } catch (error) {
    console.error("Failed to join group:", error);
    return res.status(500).json({ message: "Failed to join group" });
  }
};

export const joinGroupResponse = async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const userName = req.body.userName;

    if (!groupId) {
      return res.status(400).json({ message: "groupId is required" });
    }

    if (!userName) {
      return res.status(400).json({ message: "userName is required" });
    }

    const result = await joinGroup(groupId, userName);

    if (result.type === "not_found") {
      return res.status(404).json({ message: "Group not found" });
    }

    if (result.type === "duplicate_name") {
      return res.status(409).json({
        message: "That name is already in use in this group.",
      });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Failed to join group:", error);
    return res.status(500).json({ message: "Failed to join group" });
  }
};

export const identifyGroupMemberResponse = async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const userName = req.body.userName;

    if (!groupId) {
      return res.status(400).json({ message: "groupId is required" });
    }

    if (!userName) {
      return res.status(400).json({ message: "userName is required" });
    }

    const result = await identifyGroupMember(groupId, userName);

    if (result.type === "not_found") {
      return res.status(404).json({ message: "Group not found" });
    }

    if (result.type === "no_match") {
      return res.status(200).json({ matched: false });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Failed to identify group member:", error);
    return res.status(500).json({ message: "Failed to identify group member" });
  }
};

export const createGroupResponse = async (req, res) => {
  try {
    const userName = sanitizeName(req.body?.userName);
    const groupName = req.body?.groupName;

    if (!userName) {
      return res.status(400).json({ message: "userName is required" });
    }

    if (!groupName) {
      return res.status(400).json({ message: "groupName is required" });
    }

    const result = await createGroup(userName, groupName);
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
