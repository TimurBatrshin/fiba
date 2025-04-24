import AuthService from './auth';
import TournamentService from './tournaments';
import api from './client';
import statisticsApi from './statistics';

export {
  api,
  AuthService,
  TournamentService,
  statisticsApi
};

export default {
  api,
  auth: AuthService,
  tournaments: TournamentService,
  statistics: statisticsApi
}; 