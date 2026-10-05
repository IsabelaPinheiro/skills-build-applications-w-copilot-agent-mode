import { Router } from 'express';
import { ActivityModel } from '../models/activity.js';
import { LeaderboardModel } from '../models/leaderboard.js';
import { TeamModel } from '../models/team.js';
import { UserModel } from '../models/user.js';
import { WorkoutModel } from '../models/workout.js';
import { apiBaseUrl } from '../config/api.js';

const apiRouter = Router();

apiRouter.get('/', (_request, response) => {
  response.json({
    baseUrl: apiBaseUrl,
    endpoints: ['users', 'teams', 'activities', 'leaderboard', 'workouts'],
  });
});

apiRouter.get('/users/', async (_request, response) => {
  response.json(await UserModel.find().populate('team').lean().exec());
});

apiRouter.get('/teams/', async (_request, response) => {
  response.json(await TeamModel.find().populate('members').lean().exec());
});

apiRouter.get('/activities/', async (_request, response) => {
  response.json(await ActivityModel.find().populate('user').lean().exec());
});

apiRouter.get('/leaderboard/', async (_request, response) => {
  response.json(
    await LeaderboardModel.find()
      .sort({ points: -1, updatedAt: 1 })
      .populate('user')
      .lean()
      .exec(),
  );
});

apiRouter.get('/workouts/', async (_request, response) => {
  response.json(await WorkoutModel.find().lean().exec());
});

export default apiRouter;
