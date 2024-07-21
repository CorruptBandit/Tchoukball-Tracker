import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Thunk for user login
export const login = createAsyncThunk(
  'users/login',
  async (payload) => {
    const response = await fetch('/api/auth/login', {
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

// Thunk for fetching the current user
export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (auth_token) => {
    const response = await fetch('/api/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${auth_token}`
      }
    });

    if (!response.ok) {
      throw new Error('Fetch user request failed');
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
      })
      .addCase(fetchUser.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.data;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default usersSlice.reducer;
