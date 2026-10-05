import mongoose, { Schema, Types } from 'mongoose';

export interface Activity {
  user: Types.ObjectId;
  activityType: 'running' | 'cycling' | 'swimming' | 'strength' | 'other';
  durationMinutes: number;
  distanceKm: number;
  calories: number;
  createdAt: Date;
}

const activitySchema = new Schema<Activity>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    activityType: {
      type: String,
      enum: ['running', 'cycling', 'swimming', 'strength', 'other'],
      required: true,
    },
    durationMinutes: { type: Number, required: true, min: 1 },
    distanceKm: { type: Number, default: 0, min: 0 },
    calories: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

export const ActivityModel = mongoose.model<Activity>('Activity', activitySchema);
