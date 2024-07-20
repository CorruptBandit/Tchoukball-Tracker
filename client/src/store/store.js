import { configureStore } from '@reduxjs/toolkit';
import dashboardsReducer from './slices/dashboardsSlice'

export default configureStore({
  reducer: {
    dashboards: dashboardsReducer,
  }
});
