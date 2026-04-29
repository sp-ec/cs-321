import crypto from "crypto";
import mongoose from "mongoose";
import Group from "./groupSchema.js";

const DEFAULT_GROUP_NAME = "Please add a group name";
const DEFAULT_GROUP_DESCRIPTION = "Please add a group description";

function sanitizeName(value) {
  return String(value || "").trim();
}

function sanitizeText(value) {
  return typeof value === "string" ? value.trim() : value;
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
      profilePicture: "",
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

function findUserById(group, userId) {
  return group.users.find((user) => user.userId.toString() === String(userId));
}

function validateAvailabilities(availabilities) {
  if (!Array.isArray(availabilities)) {
    return { type: "invalid", message: "availabilities must be an array" };
  }

  const normalizedAvailabilities = [];

  for (const availability of availabilities) {
    const start = new Date(availability?.start);
    const end = new Date(availability?.end);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      start >= end
    ) {
      return {
        type: "invalid",
        message: "Each availability must contain a valid start before end",
      };
    }

    normalizedAvailabilities.push({ start, end });
  }

  return { type: "valid", availabilities: normalizedAvailabilities };
}

async function updateGroup(groupId, actingUserId, groupName, groupDescription) {
  const group = await Group.findOne({ groupId });

  if (!group) {
    return { type: "not_found", message: "Group not found" };
  }

  const actingUser = findUserById(group, actingUserId);
  if (!actingUser) {
    return { type: "forbidden", message: "Only group members can update group details" };
  }

  if (groupName !== undefined) {
    const nextGroupName = sanitizeText(groupName);
    if (!nextGroupName) {
      return { type: "invalid", message: "groupName cannot be empty" };
    }
    group.groupName = nextGroupName;
  }

  if (groupDescription !== undefined) {
    const nextGroupDescription = sanitizeText(groupDescription);
    if (nextGroupDescription === undefined) {
      return { type: "invalid", message: "groupDescription must be a string" };
    }
    group.groupDescription = nextGroupDescription;
  }

  const updatedGroup = await group.save();
  return { type: "updated", group: formatGroup(updatedGroup) };
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

async function setUserAvailabilities(
  groupId,
  actingUserId,
  userId,
  availabilities,
) {
  const group = await Group.findOne({ groupId });
  if (!group) {
    return { type: "not_found", message: "Group not found" };
  }

  const actingUser = findUserById(group, actingUserId);
  const targetUser = findUserById(group, userId);

  if (!actingUser || !targetUser) {
    return { type: "not_found", message: "User not found" };
  }

  if (actingUser.userId.toString() !== targetUser.userId.toString()) {
    return { type: "forbidden", message: "You can only update your own availabilities" };
  }

  const validationResult = validateAvailabilities(availabilities);
  if (validationResult.type === "invalid") {
    return validationResult;
  }

  targetUser.availabilities = validationResult.availabilities;
  const updatedGroup = await group.save();
  return { type: "updated", group: formatGroup(updatedGroup) };
}

export const updateGroupResponse = async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const actingUserId = req.body.actingUserId;
    const groupName = req.body.groupName;
    const groupDescription = req.body.groupDescription;

    if (!groupId) {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: "groupId is required" });
    }

    if (!actingUserId) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "actingUserId is required",
      });
    }

    if (groupName === undefined && groupDescription === undefined) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "At least one of groupName or groupDescription is required",
      });
    }

    const result = await updateGroup(
      groupId,
      actingUserId,
      groupName,
      groupDescription,
    );

    if (result.type === "not_found") {
      return res.status(404).json({ code: "GROUP_NOT_FOUND", message: result.message });
    }

    if (result.type === "forbidden") {
      return res.status(403).json({ code: "FORBIDDEN", message: result.message });
    }

    if (result.type === "invalid") {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Failed to update group:", error);
    return res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to update group" });
  }
};

export const setUserAvailabilitiesResponse = async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const actingUserId = req.body.actingUserId;
    const userId = req.body.userId;
    const availabilities = req.body.availabilities;

    if (!groupId) {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: "groupId is required" });
    }

    if (!actingUserId) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "actingUserId is required",
      });
    }

    if (!userId) {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: "userId is required" });
    }

    if (!Array.isArray(availabilities)) {
      return res.status(400).json({
        code: "VALIDATION_ERROR",
        message: "availabilities must be an array",
      });
    }

    const result = await setUserAvailabilities(
      groupId,
      actingUserId,
      userId,
      availabilities,
    );

    if (result.type === "not_found") {
      return res.status(404).json({ code: "NOT_FOUND", message: result.message });
    }

    if (result.type === "forbidden") {
      return res.status(403).json({ code: "FORBIDDEN", message: result.message });
    }

    if (result.type === "invalid") {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Failed to update availabilities:", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to update availabilities",
    });
  }
};

export const joinGroupResponse = async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const userName = sanitizeName(req.body.userName);

    if (!groupId) {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: "groupId is required" });
    }

    if (!userName) {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: "userName is required" });
    }

    const result = await joinGroup(groupId, userName);

    if (result.type === "not_found") {
      return res.status(404).json({ code: "GROUP_NOT_FOUND", message: "Group not found" });
    }

    if (result.type === "duplicate_name") {
      return res.status(409).json({
        code: "DUPLICATE_NAME",
        message: "That name is already in use in this group.",
      });
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Failed to join group:", error);
    return res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to join group" });
  }
};

export const identifyGroupMemberResponse = async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const userName = sanitizeName(req.body.userName);

    if (!groupId) {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: "groupId is required" });
    }

    if (!userName) {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: "userName is required" });
    }

    const result = await identifyGroupMember(groupId, userName);

    if (result.type === "not_found") {
      return res.status(404).json({ code: "GROUP_NOT_FOUND", message: "Group not found" });
    }

    if (result.type === "no_match") {
      return res.status(200).json({ matched: false });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Failed to identify group member:", error);
    return res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Failed to identify group member",
    });
  }
};

export const createGroupResponse = async (req, res) => {
  try {
    const userName = sanitizeName(req.body?.userName);
    const groupName = sanitizeText(req.body?.groupName);

    if (!userName) {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: "userName is required" });
    }

    if (!groupName) {
      return res.status(400).json({ code: "VALIDATION_ERROR", message: "groupName is required" });
    }

    const result = await createGroup(userName, groupName);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Failed to create group:", error);
    return res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to create group" });
  }
};

export const fetchGroupResponse = async (req, res) => {
  try {
    const groupId = sanitizeName(req.query?.groupId);

    if (!groupId) {
      return res
        .status(400)
        .json({ code: "VALIDATION_ERROR", message: "groupId query parameter is required" });
    }

    const group = await Group.findOne({ groupId }).lean();

    if (!group) {
      return res.status(404).json({ code: "GROUP_NOT_FOUND", message: "Group not found" });
    }

    return res.json(formatGroup(group));
  } catch (error) {
    console.error("Failed to fetch group:", error);
    return res.status(500).json({ code: "INTERNAL_ERROR", message: "Failed to fetch group" });
  }
};
