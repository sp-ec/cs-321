import express from "express";
import {
	createGroupResponse,
	fetchGroupResponse,
} from "./services/group/group.js";

const router = express.Router();
router.post("/groups/create", createGroupResponse);
router.get("/groups/fetch", fetchGroupResponse);

export default router;
