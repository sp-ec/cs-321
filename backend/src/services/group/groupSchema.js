import mongoose from 'mongoose';
const { Schema } = mongoose;

const availabilitySchema = new Schema({
  start: { type: Date, required: true },
  end: { type: Date, required: true },
}, { _id: false });

const userSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    availabilities: [availabilitySchema],
});

const groupSchema = new Schema({
    groupId: { type: String, required: true },
    groupName: { type: String, required: true },
    groupDescription: { type: String, required: false },
    users: [userSchema],
});

export default mongoose.model('Group', groupSchema);