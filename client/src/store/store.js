import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './slices/settingsSlice'
import dashboardsReducer from './slices/dashboardsSlice'
import componentsReducer from './slices/componentsSlice';
import livedataReducer from './slices/liveDataSlice'

export default configureStore({
  reducer: {
    settings: settingsReducer,
    dashboards: dashboardsReducer,
    components: componentsReducer,
    livedata: livedataReducer
  }
});
