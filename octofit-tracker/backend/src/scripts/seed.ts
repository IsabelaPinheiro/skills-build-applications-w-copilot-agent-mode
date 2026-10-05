import mongoose from 'mongoose';
import { ActivityModel } from '../models/activity.js';
import { LeaderboardModel } from '../models/leaderboard.js';
import { TeamModel } from '../models/team.js';
import { UserModel } from '../models/user.js';
import { WorkoutModel } from '../models/workout.js';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';

/**
 * Seed the octofit_db database with test data.
 * Run this seed command with `npm run seed`.
 */
async function seedDatabase() {
  try {
    await mongoose.connect(connectionString);

    console.log('Connected to octofit_db');

    const team = TeamModel;
    const user = UserModel;
    const activity = ActivityModel;
    const leaderboard = LeaderboardModel;
    const workout = WorkoutModel;

    const teamSeeds = [
      { name: 'Trail Blazers', description: 'A team focused on outdoor miles.' },
      { name: 'Peak Performers', description: 'Building strength and consistency together.' },
    ];
    const teams = await Promise.all(
      teamSeeds.map(async (seed) => {
        const existingTeam = await team.findOne({ name: seed.name }).exec();
        if (existingTeam) {
          existingTeam.set({ ...seed, members: [] });
          return existingTeam.save();
        }
        return team.create({ ...seed, members: [] });
      }),
    );

    const userSeeds = [
      { username: 'alex-morgan', name: 'Alex Morgan', email: 'alex.morgan@example.com', team: teams[0]._id, points: 480 },
      { username: 'jordan-lee', name: 'Jordan Lee', email: 'jordan.lee@example.com', team: teams[0]._id, points: 420 },
      { username: 'casey-rivera', name: 'Casey Rivera', email: 'casey.rivera@example.com', team: teams[1]._id, points: 510 },
      { username: 'taylor-kim', name: 'Taylor Kim', email: 'taylor.kim@example.com', team: teams[1]._id, points: 365 },
    ];
    const users = await Promise.all(
      userSeeds.map(async ({ points: _points, ...seed }) => {
        const existingUser = await user.findOne({ username: seed.username }).exec();
        if (existingUser) {
          existingUser.set(seed);
          return existingUser.save();
        }
        return user.create(seed);
      }),
    );
    const usersByUsername = new Map(users.map((seededUser) => [seededUser.username, seededUser]));

    function getSeededUser(username: string) {
      const seededUser = usersByUsername.get(username);
      if (!seededUser) {
        throw new Error(`Seed user not found: ${username}`);
      }
      return seededUser;
    }

    teams[0].members = [getSeededUser('alex-morgan')._id, getSeededUser('jordan-lee')._id];
    teams[1].members = [getSeededUser('casey-rivera')._id, getSeededUser('taylor-kim')._id];
    await Promise.all(teams.map((seededTeam) => seededTeam.save()));

    const leaderboardSeeds = [...userSeeds].sort((first, second) => second.points - first.points);
    await Promise.all(
      leaderboardSeeds.map(async ({ username, points }, index) => {
        const existingEntry = await leaderboard.findOne({ user: getSeededUser(username)._id }).exec();
        const entry = { user: getSeededUser(username)._id, points, rank: index + 1 };
        if (existingEntry) {
          existingEntry.set({ points, rank: index + 1 });
          return existingEntry.save();
        }
        return leaderboard.create(entry);
      }),
    );

    const seededUserIds = users.map((seededUser) => seededUser._id);
    await activity.deleteMany({ user: { $in: seededUserIds } }).exec();
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
    await activity.insertMany(
      activitySeeds.map(({ username, daysAgo, ...seed }) => ({
        ...seed,
        user: getSeededUser(username)._id,
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
      workoutSeeds.map(async ({ title, ...seed }) => {
        const existingWorkout = await workout.findOne({ title }).exec();
        if (existingWorkout) {
          existingWorkout.set(seed);
          return existingWorkout.save();
        }
        return workout.create({ title, ...seed });
      }),
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
