import mongoose, { Schema } from 'mongoose';

export interface Workout {
  title: string;
  description: string;
  activityType: 'running' | 'cycling' | 'swimming' | 'strength' | 'other';
  durationMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
}

const workoutSchema = new Schema<Workout>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    activityType: {
      type: String,
      enum: ['running', 'cycling', 'swimming', 'strength', 'other'],
      required: true,
    },
    durationMinutes: { type: Number, required: true, min: 1 },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
  },
  { timestamps: true },
);

export const WorkoutModel = mongoose.model<Workout>('Workout', workoutSchema);
