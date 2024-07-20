import { configureStore } from '@reduxjs/toolkit';
import spreadsheetsReducer from './slices/spreadsheetsSlice'

export default configureStore({
  reducer: {
    spreadsheets: spreadsheetsReducer,
  }
});
