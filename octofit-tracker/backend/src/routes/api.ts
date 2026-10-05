import { Router } from 'express';
import { ActivityModel } from '../models/activity.js';
import { LeaderboardModel } from '../models/leaderboard.js';
import { TeamModel } from '../models/team.js';
import { UserModel } from '../models/user.js';
import { WorkoutModel } from '../models/workout.js';
import { apiBaseUrl } from '../config/api.js';

const router = Router();

router.get('/api', (_request, response) => {
  response.json({
    baseUrl: apiBaseUrl,
    endpoints: ['users', 'teams', 'activities', 'leaderboard', 'workouts'],
  });
});

router.get('/api/users/', async (_request, response) => {
  response.json(await UserModel.find().populate('team').lean().exec());
});

router.get('/api/teams/', async (_request, response) => {
  response.json(await TeamModel.find().populate('members').lean().exec());
});

router.get('/api/activities/', async (_request, response) => {
  response.json(await ActivityModel.find().populate('user').lean().exec());
});

router.get('/api/leaderboard/', async (_request, response) => {
  response.json(
    await LeaderboardModel.find()
      .sort({ points: -1, updatedAt: 1 })
      .populate('user')
      .lean()
      .exec(),
  );
});

router.get('/api/workouts/', async (_request, response) => {
  response.json(await WorkoutModel.find().lean().exec());
});

export default router;
