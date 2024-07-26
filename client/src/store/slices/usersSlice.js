import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { trackerAPI } from '../TrackerAPI';

// Thunk for user login
export const login = createAsyncThunk(
  'users/login',
  async (payload) => {
    const response = await trackerAPI.post('/api/login',
      {
        username: payload.username,
        password: payload.password,
        keep_logged_in: payload.keep_logged_in
      }
    );
    return response.json();
  }
);

// Thunk for user logout
export const logout = createAsyncThunk(
  'users/logout',
  async () => {
    const response = await trackerAPI.post('/api/logout');
    if (response.ok) {
      return;
    } else {
      throw new Error('Logout failed');
    }
  }
);

// Thunk to check JWT status
export const checkJWT = createAsyncThunk(
  'users/checkJWT',
  async () => {
    const response = await trackerAPI.post('/api/login/jwt');  // Token is automatically sent with cookies
    return response.json();
  })

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
