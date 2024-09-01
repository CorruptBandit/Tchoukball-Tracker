import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import { trackerAPI } from "../TrackerAPI";

const spreadsheetAdapter = createEntityAdapter();
const initialState = spreadsheetAdapter.getInitialState({
  status: "idle",
  error: null,
  players: [],  // Array to store player names directly
});

export const fetchSpreadsheets = createAsyncThunk(
  "spreadsheets/fetchSpreadsheets",
  async () => {
    try {
      const response = await trackerAPI.fetch("/api/spreadsheets", null);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch spreadsheets:", error);
      throw error;
    }
  }
);

export const fetchSpreadsheetById = createAsyncThunk(
  "spreadsheets/fetchSpreadsheetsById",
  async (id) => {
    try {
      const response = await trackerAPI.fetch(`/api/spreadsheets/${id}`, null);
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch spreadsheet by ID:", error);
      throw error;
    }
  }
);

export const deleteSpreadsheet = createAsyncThunk(
  "spreadsheets/deleteSpreadsheet",
  async (id) => {
    try {
      const response = await trackerAPI.delete(`/api/spreadsheets/${id}`, null);
      return await response.json();
    } catch (error) {
      console.error("Failed to delete spreadsheet:", error);
      throw error;
    }
  }
);

export const updateSpreadsheet = createAsyncThunk(
  "spreadsheets/updateSpreadsheet",
  async (payload) => {
    try {
      const response = await trackerAPI.put(`/api/spreadsheets/${payload.id}`, {
        name: payload.name,
        path: payload.path,
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to update spreadsheet:", error);
      throw error;
    }
  }
);

export const addNewSpreadsheet = createAsyncThunk(
  "spreadsheets/addNewSpreadsheet",
  async (payload) => {
    try {
      const response = await trackerAPI.post("/api/spreadsheets", {
        name: payload.name,
        path: payload.path,
      });
      return await response.json();
    } catch (error) {
      console.error("Failed to add new spreadsheet:", error);
      throw error;
    }
  }
);

export const addNewPlayer = createAsyncThunk(
  "spreadsheets/addNewPlayer",
  async (payload) => {
    try {
      const response = await trackerAPI.post(
        `/api/spreadsheets/${payload.id}/player`,
        {
          name: payload.name,
        }
      );
      const data = await response.json();
      return { spreadsheet: payload.id, data: data };
    } catch (error) {
      console.error("Failed to add new player:", error);
      throw error;
    }
  }
);

export const removePlayer = createAsyncThunk(
  "spreadsheets/removePlayer",
  async (payload) => {
    try {
      const response = await trackerAPI.delete(
        `/api/spreadsheets/${payload.id}/player`,
        {
          name: payload.name,
        }
      );
      const data = await response.json();
      return { spreadsheet: payload.id, data: data };
    } catch (error) {
      console.error("Failed to remove player:", error);
      throw error;
    }
  }
);

export const addNewPlayerAction = createAsyncThunk(
  "spreadsheets/addNewPlayerAction",
  async (payload) => {
    try {
      const response = await trackerAPI.post(
        `/api/spreadsheets/${payload.id}/player/${payload.player}/action`,
        {
          type: payload.action,
          value: payload.value,
        }
      );
      const data = await response.json();
      return { spreadsheet: payload.id, player: payload.player, data: data };
    } catch (error) {
      console.error("Failed to add new player action:", error);
      throw error;
    }
  }
);

export const fetchPlayersForMatch = createAsyncThunk(
  "spreadsheets/fetchPlayersForMatch",
  async (ids) => {
    if (!ids || ids.length === 0) return [];

    try {
      const responses = await Promise.all(
        ids.map((id) => trackerAPI.fetch(`/api/spreadsheets/${id}`, null))
      );
      const data = await Promise.all(responses.map((res) => res.json()));

      const playerNames = data.reduce((names, spreadsheet) => {
        if (spreadsheet.players) {
          spreadsheet.players.forEach(player => {
            const trimmedName = player.name.trim();
            if (trimmedName && !names.includes(trimmedName)) {
              names.push(trimmedName);
            }
          });
        }
        return names;
      }, []);

      return playerNames;
    } catch (error) {
      console.error("Failed to fetch players:", error);
      throw error;
    }
  }
);

export const spreadsheetsSlice = createSlice({
  name: "spreadsheets",
  initialState,
  reducers: {
    clearPlayers: (state) => {
    state.players = []; // Action to clear players
  },},
  extraReducers(builder) {
    builder
      .addCase(fetchSpreadsheets.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSpreadsheets.fulfilled, (state, action) => {
        state.status = "succeeded";
        spreadsheetAdapter.upsertMany(state, action.payload);
      })
      .addCase(fetchSpreadsheets.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchSpreadsheetById.fulfilled, (state, action) => {
        spreadsheetAdapter.upsertOne(state, action.payload);
      })
      .addCase(updateSpreadsheet.fulfilled, (state, action) => {
        const updatedSpreadsheet = action.payload;
        spreadsheetAdapter.updateOne(state, {
          id: updatedSpreadsheet.id,
          changes: updatedSpreadsheet,
        });
      })
      .addCase(deleteSpreadsheet.fulfilled, (state, action) => {
        spreadsheetAdapter.removeOne(state, action.meta.arg.id);
      })
      .addCase(addNewSpreadsheet.fulfilled, (state, action) => {
        spreadsheetAdapter.addOne(state, action.payload);
      })
      .addCase(addNewPlayer.fulfilled, (state, action) => {
        const { spreadsheet, data } = action.payload;
        spreadsheetAdapter.updateOne(state, {
          id: spreadsheet,
          changes: data,
        });
      })
      .addCase(removePlayer.fulfilled, (state, action) => {
        const { spreadsheet, data } = action.payload;
        spreadsheetAdapter.updateOne(state, {
          id: spreadsheet,
          changes: data,
        });
      })
      .addCase(addNewPlayerAction.fulfilled, (state, action) => {
        const { spreadsheet, player, data } = action.payload;
        const playerIndex = state.entities[spreadsheet].players.findIndex(p => p.name === player);
        state.entities[spreadsheet].players[playerIndex] = data;
      })
      .addCase(fetchPlayersForMatch.fulfilled, (state, action) => {
        state.players = action.payload; // Update player names directly
      });
  },
});

export const spreadsheetsActions = spreadsheetsSlice.actions;
export const { clearPlayers } = spreadsheetsSlice.actions;
// Selector to get players from state
export const selectPlayersFromMatch = (state) => state.spreadsheets.players;
export default spreadsheetsSlice.reducer;

export const {
  selectAll: selectAllSpreadsheets,
  selectById: selectSpreadsheetById,
  selectIds: selectSpreadsheetIds,
} = spreadsheetAdapter.getSelectors((state) => state.spreadsheets);

export const selectSpreadsheetNames = createSelector(
  [selectAllSpreadsheets],
  (spreadsheets) => {
    return spreadsheets.map((spreadsheet) => spreadsheet.name);
  }
);

export const selectSpreadsheetByName = createSelector(
  [selectAllSpreadsheets, (state, name) => name],
  (spreadsheets, name) =>
    spreadsheets.find((spreadsheet) => spreadsheet.name === name)
);

export const selectMatchSpreadsheetNames = createSelector(
  [selectAllSpreadsheets],
  (spreadsheets) => {
    const uniqueNames = new Set();
    spreadsheets.forEach(spreadsheet => {
      const matchName = spreadsheet.name.split(" - ")[0];
      uniqueNames.add(matchName);
    });
    return Array.from(uniqueNames);
  }
);
