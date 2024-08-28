import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
  } from "@reduxjs/toolkit";
  import { trackerAPI } from "../TrackerAPI";
  
  const matchAdapter = createEntityAdapter();
  const initialState = matchAdapter.getInitialState({
    status: "idle",
    error: null,
  });
  
  export const fetchMatches = createAsyncThunk(
    "matches/fetchMatches",
    async () => {
      const response = await trackerAPI.fetch(
        "/api/matches",
        null,
      );
      return response.json();
    }
  );

  export const fetchMatchById = createAsyncThunk(
    "matches/fetchMatchesById",
    async (id) => {
      const response = await trackerAPI.fetch(
        `/api/matches/${id}`,
        null,
      );
      return response.json();
    }
  );
  
  
  export const deleteMatch = createAsyncThunk(
    "matches/deleteMatch",
    async (payload) => {
      const response = await trackerAPI.delete(
        `/api/matches/${payload.id}`,
        null
      );
      return response.json();
    }
  );
  
  export const updateMatch = createAsyncThunk(
    "matches/updateMatch",
    async (payload) => {
      const response = await trackerAPI.put(
        `/api/matches/${payload.id}`,
        {
          name: payload.name,
          path: payload.path
        }
      );
      return response.json();
    }
  );
  
  export const addNewMatch = createAsyncThunk(
    "matches/addNewMatch",
    async (payload) => {
      const response = await trackerAPI.post(
        "/api/matches",
        {
          name: payload.name,
          players: payload.players
        }
      );
      return response.json();
    }
  );
  
  export const matchesSlice = createSlice({
    name: "matches",
    initialState,
    reducers: {},
    extraReducers(builder) {
      builder
        .addCase(fetchMatches.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchMatches.fulfilled, (state, action) => {
          state.status = "succeeded";
          matchAdapter.upsertMany(state, action.payload);
        })
        .addCase(fetchMatches.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.error.message;
        })
        .addCase(fetchMatchById.fulfilled, (state, action) => {
          matchAdapter.upsertOne(state, action.payload);
        })
        .addCase(updateMatch.fulfilled, (state, action) => {
          const updatedMatch = action.payload;
          matchAdapter.updateOne(state, {
            id: updatedMatch.id,
            changes: updatedMatch,
          });
        })
        .addCase(deleteMatch.fulfilled, (state, action) => {
          matchAdapter.removeOne(state, action.meta.arg.id);
        })
        .addCase(addNewMatch.fulfilled, (state, action) => {
          matchAdapter.addOne(state, action.payload);
        });
    },
  });
  
  export const matchesActions = matchesSlice.actions;
  export default matchesSlice.reducer;
  
  export const {
    selectAll: selectAllMatches,
    selectById: selectMatchById,
    selectIds: selectMatchIds,
  } = matchAdapter.getSelectors((state) => state.matches);
  
  export const selectMatchNames = createSelector(
    [selectAllMatches, (state) => state],
    (matches) => {
      return matches.map((match) => match.name);
    }
  );
  
  export const selectMatchByName = createSelector(
    [selectAllMatches, (state, name) => name],
    (matches, name) => matches.find((match) => match.name === name)
  );
