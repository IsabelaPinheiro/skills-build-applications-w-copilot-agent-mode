import mongoose, { Model, Schema, Types } from 'mongoose';

export interface Team {
  name: string;
  description?: string;
  members: Types.ObjectId[];
  createdAt: Date;
}

const teamSchema: Schema<Team> = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export const TeamModel: Model<Team> = mongoose.model('Team', teamSchema);
