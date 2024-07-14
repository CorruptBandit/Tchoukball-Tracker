import { configureStore } from '@reduxjs/toolkit';
import componentsReducer from './slices/componentsSlice';

export default configureStore({
  reducer: {
    components: componentsReducer,
  }
});
