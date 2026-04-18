import express from "express";
import { createGroupResponse } from "./services/group.js";

const router = express.Router();
router.post("/groups/create", createGroupResponse);

export default router;
