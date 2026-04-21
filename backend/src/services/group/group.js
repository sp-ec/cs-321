import crypto from 'crypto';
import Group from './groupSchema.js';
import mongoose from 'mongoose';

async function createGroup(userName, groupName) {
    const userId = new mongoose.Types.ObjectId(); 

    const newGroup = new Group({
      groupId: crypto.randomBytes(16).toString('hex'),
      groupName: groupName,
      groupDescription: null,
      users: [{
        userId: userId,
        availabilities: [],
        userName: userName
      }]
    });

    const result = await newGroup.save();
    console.log('Group created successfully:', result._id);
    return result;
}

export const createGroupResponse = async (req, res) => {
  const { userName, groupName } = req.body;
  const group = await createGroup(userName, groupName);
  res.json(group);
};
