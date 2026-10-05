import mongoose, { Model, Schema, Types } from 'mongoose';

export interface LeaderboardEntry {
  user: Types.ObjectId;
  points: number;
  rank: number;
  updatedAt: Date;
}

const leaderboardSchema: Schema<LeaderboardEntry> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    points: { type: Number, required: true, min: 0, default: 0 },
    rank: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

leaderboardSchema.index({ points: -1 });

export const LeaderboardModel: Model<LeaderboardEntry> = mongoose.model('Leaderboard', leaderboardSchema);
