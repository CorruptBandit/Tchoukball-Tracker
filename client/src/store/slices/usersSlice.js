import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { dashboardAPI } from "../DashboardAPI";

// Thunk for user login
export const login = createAsyncThunk(
  'users/login',
  async (payload) => {
    const response = await dashboardAPI.post('/api/login',
      {
        username: payload.username,
        password: payload.password,
        keep_logged_in: payload.keep_logged_in
      }
    );
    return response.json();
  }
);

const initialState = {
  user: null,
  status: 'idle',
  error: null
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.data;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default usersSlice.reducer;
