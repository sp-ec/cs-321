import express from "express";
import {
  createGroupResponse,
  fetchGroupResponse,
  identifyGroupMemberResponse,
  updateGroupResponse,
  joinGroupResponse,
  setUserAvailabilitiesResponse,
} from "./services/group/group.js";

const router = express.Router();
router.post("/groups/create", createGroupResponse);
router.post("/groups/join", joinGroupResponse);
router.post("/groups/identify", identifyGroupMemberResponse);
router.put("/groups/update", updateGroupResponse);
router.get("/groups/fetch", fetchGroupResponse);
router.post("/user/availability", setUserAvailabilitiesResponse);

export default router;
