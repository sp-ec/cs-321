import mongoose from "mongoose";

const { Schema } = mongoose;

const DEFAULT_GROUP_NAME = "Please add a group name";
const DEFAULT_GROUP_DESCRIPTION = "Please add a group description";

const availabilitySchema = new Schema(
  {
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    userName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["Admin", "Member"],
      default: "Member",
      required: true,
    },
    profilePicture: { type: String, default: "" },
    memberColor: { type: String, required: true },
    availabilities: [availabilitySchema],
  },
  { _id: false },
);

const groupSchema = new Schema({
  groupId: { type: String, required: true, unique: true, index: true },
  groupName: {
    type: String,
    required: true,
    trim: true,
    default: DEFAULT_GROUP_NAME,
  },
  groupDescription: {
    type: String,
    trim: true,
    default: DEFAULT_GROUP_DESCRIPTION,
  },
  users: [userSchema],
});

export default mongoose.model("Group", groupSchema);
