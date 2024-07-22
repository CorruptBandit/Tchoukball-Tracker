import { configureStore } from '@reduxjs/toolkit';
import spreadsheetsReducer from './slices/spreadsheetsSlice'
import matchesReducer from './slices/matchesSlice'
import usersReducer from './slices/usersSlice'

export default configureStore({
  reducer: {
    spreadsheets: spreadsheetsReducer,
    matches: matchesReducer,
    users: usersReducer
  }
});
