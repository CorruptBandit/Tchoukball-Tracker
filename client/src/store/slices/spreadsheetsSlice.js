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
  players: [],
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
      // Fetch data for each ID
      const responses = await Promise.all(
        ids.map((id) => trackerAPI.fetch(`/api/spreadsheets/${id}`, null))
      );

      // Extract JSON from each response
      const data = await Promise.all(responses.map((res) => res.json()));

      console.log("Fetched data for all IDs:", data);

      // Extract player names from all spreadsheets and deduplicate
      const playerNames = data.reduce((names, spreadsheet) => {
        if (spreadsheet.players) {
          console.log(`Spreadsheet ID ${spreadsheet.id} players:`, spreadsheet.players);
          spreadsheet.players.forEach(player => {
            if (player.name) {
              const trimmedName = player.name.trim();
              if (trimmedName && !names.includes(trimmedName)) {
                names.push(trimmedName);
              }
            }
          });
        } else {
          console.log(`Spreadsheet ID ${spreadsheet.id} has no players.`);
        }
        return names;
      }, []);

      console.log("Aggregated player names:", playerNames);

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
  reducers: {},
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
        console.log("Updating state.players with:", action.payload);
        state.players = action.payload;
      });
  },
});

export const spreadsheetsActions = spreadsheetsSlice.actions;
export default spreadsheetsSlice.reducer;

export const {
  selectAll: selectAllSpreadsheets,
  selectById: selectSpreadsheetById,
  selectIds: selectSpreadsheetIds,
} = spreadsheetAdapter.getSelectors((state) => state.spreadsheets);

export const selectSpreadsheetNames = createSelector(
  [selectAllSpreadsheets, (state) => state],
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

export const selectPlayersFromMatch = createSelector(
  [selectAllSpreadsheets, (state, matchName) => matchName],
  (spreadsheets, matchName) => {
    const playersSet = new Set();
    spreadsheets.forEach(spreadsheet => {
      if (spreadsheet.name.startsWith(matchName) && spreadsheet.players) {
        spreadsheet.players.forEach(player => playersSet.add(player.name));
      }
    });
    // Convert Set to array
    const playerNamesArray = Array.from(playersSet);
    console.log("Players selected by match:", playerNamesArray);
    return playerNamesArray;
  }
);
