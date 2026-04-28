import express from "express";
import {
  createGroupResponse,
  fetchGroupResponse,
  updateGroupResponse,
} from "./services/group/group.js";

const router = express.Router();
router.post("/groups/create", createGroupResponse);
router.put("/groups/update", updateGroupResponse);
router.get("/groups/fetch", fetchGroupResponse);

export default router;
