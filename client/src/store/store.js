import { configureStore } from '@reduxjs/toolkit';
import spreadsheetsReducer from './slices/spreadsheetsSlice'
import matchesReducer from './slices/matchesSlice'

export default configureStore({
  reducer: {
    spreadsheets: spreadsheetsReducer,
    matches: matchesReducer,
  }
});
