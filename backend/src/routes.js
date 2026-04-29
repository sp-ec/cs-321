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
router.patch("/groups/update", updateGroupResponse);
router.put("/groups/update", updateGroupResponse);
router.patch("/groups/availability", setUserAvailabilitiesResponse);
router.get("/groups/fetch", fetchGroupResponse);
router.post("/user/availability", setUserAvailabilitiesResponse);

export default router;any
