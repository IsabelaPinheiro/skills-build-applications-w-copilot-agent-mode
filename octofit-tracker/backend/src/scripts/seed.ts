import mongoose from 'mongoose';
import { ActivityModel } from '../models/activity.js';
import { LeaderboardModel } from '../models/leaderboard.js';
import { TeamModel } from '../models/team.js';
import { UserModel } from '../models/user.js';
import { WorkoutModel } from '../models/workout.js';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';

/**
 * Seed the octofit_db database with test data
 */
async function seedDatabase() {
  try {
    await mongoose.connect(connectionString);

    console.log('Connected to octofit_db');

    const teams = await Promise.all([
      TeamModel.findOneAndUpdate(
        { name: 'Trail Blazers' },
        { $set: { description: 'A team focused on outdoor miles.', members: [] } },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      ).exec(),
      TeamModel.findOneAndUpdate(
        { name: 'Peak Performers' },
        { $set: { description: 'Building strength and consistency together.', members: [] } },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
      ).exec(),
    ]);

    const userSeeds = [
      { username: 'alex-morgan', name: 'Alex Morgan', email: 'alex.morgan@example.com', team: teams[0]._id, points: 480 },
      { username: 'jordan-lee', name: 'Jordan Lee', email: 'jordan.lee@example.com', team: teams[0]._id, points: 420 },
      { username: 'casey-rivera', name: 'Casey Rivera', email: 'casey.rivera@example.com', team: teams[1]._id, points: 510 },
      { username: 'taylor-kim', name: 'Taylor Kim', email: 'taylor.kim@example.com', team: teams[1]._id, points: 365 },
    ];
    const users = await Promise.all(
      userSeeds.map(({ username, name, email, team }) =>
        UserModel.findOneAndUpdate(
          { username },
          { $set: { name, email, team } },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
        ).exec(),
      ),
    );
    const usersByUsername = new Map(users.map((user) => [user.username, user]));

    await Promise.all([
      TeamModel.updateOne(
        { _id: teams[0]._id },
        { $set: { members: [usersByUsername.get('alex-morgan')!._id, usersByUsername.get('jordan-lee')!._id] } },
      ).exec(),
      TeamModel.updateOne(
        { _id: teams[1]._id },
        { $set: { members: [usersByUsername.get('casey-rivera')!._id, usersByUsername.get('taylor-kim')!._id] } },
      ).exec(),
    ]);

    const leaderboardSeeds = [...userSeeds].sort((first, second) => second.points - first.points);
    await Promise.all(
      leaderboardSeeds.map(({ username, points }, index) =>
        LeaderboardModel.findOneAndUpdate(
          { user: usersByUsername.get(username)!._id },
          { $set: { points, rank: index + 1 } },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
        ).exec(),
      ),
    );

    const seededUserIds = users.map((user) => user._id);
    await ActivityModel.deleteMany({ user: { $in: seededUserIds } }).exec();
    const activitySeeds = [
      { username: 'alex-morgan', activityType: 'running', durationMinutes: 42, distanceKm: 7.2, calories: 510, daysAgo: 1 },
      { username: 'alex-morgan', activityType: 'strength', durationMinutes: 35, distanceKm: 0, calories: 240, daysAgo: 3 },
      { username: 'jordan-lee', activityType: 'cycling', durationMinutes: 55, distanceKm: 18.5, calories: 620, daysAgo: 1 },
      { username: 'jordan-lee', activityType: 'running', durationMinutes: 28, distanceKm: 4.3, calories: 310, daysAgo: 4 },
      { username: 'casey-rivera', activityType: 'swimming', durationMinutes: 40, distanceKm: 1.6, calories: 430, daysAgo: 1 },
      { username: 'casey-rivera', activityType: 'running', durationMinutes: 50, distanceKm: 8.4, calories: 590, daysAgo: 2 },
      { username: 'taylor-kim', activityType: 'strength', durationMinutes: 45, distanceKm: 0, calories: 300, daysAgo: 2 },
      { username: 'taylor-kim', activityType: 'cycling', durationMinutes: 36, distanceKm: 11.2, calories: 390, daysAgo: 5 },
    ] as const;
    const now = Date.now();
    await ActivityModel.insertMany(
      activitySeeds.map(({ username, daysAgo, ...activity }) => ({
        ...activity,
        user: usersByUsername.get(username)!._id,
        createdAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
      })),
    );

    const workoutSeeds = [
      { title: 'Easy Endurance Run', description: 'A relaxed conversational-pace run to build aerobic fitness.', activityType: 'running', durationMinutes: 30, difficulty: 'beginner' },
      { title: 'Progressive Tempo Ride', description: 'Cycle steadily, increasing effort during the final intervals.', activityType: 'cycling', durationMinutes: 45, difficulty: 'intermediate' },
      { title: 'Full-Body Strength Circuit', description: 'Complete controlled rounds of squats, presses, rows, and core work.', activityType: 'strength', durationMinutes: 35, difficulty: 'intermediate' },
      { title: 'Technique Swim', description: 'Practice efficient freestyle form with short recovery breaks.', activityType: 'swimming', durationMinutes: 25, difficulty: 'beginner' },
    ] as const;
    await Promise.all(
      workoutSeeds.map(({ title, ...workout }) =>
        WorkoutModel.findOneAndUpdate(
          { title },
          { $set: workout },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
        ).exec(),
      ),
    );

    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
