import mongoose, { Schema, Types } from 'mongoose';

export interface User {
  username: string;
  name: string;
  email: string;
  team?: Types.ObjectId;
  createdAt: Date;
}

const userSchema = new Schema<User>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<User>('User', userSchema);
