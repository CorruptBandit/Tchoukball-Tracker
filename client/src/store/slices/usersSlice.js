import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Thunk for user login
export const login = createAsyncThunk(
  'users/login',
  async (payload) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: payload.username,
        password: payload.password,
        keep_logged_in: payload.keep_logged_in
      })
    });

    if (!response.ok) {
      throw new Error('Login request failed');
    }

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
