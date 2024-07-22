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
});

export const fetchSpreadsheets = createAsyncThunk(
  "spreadsheets/fetchSpreadsheets",
  async () => {
    const response = await trackerAPI.fetch("/api/spreadsheets", null);
    return response.json();
  }
);

export const fetchSpreadsheetById = createAsyncThunk(
  "spreadsheets/fetchSpreadsheetsById",
  async (payload) => {
    const response = await trackerAPI.fetch(
      `/api/spreadsheets/${payload.id}`,
      null
    );
    return response.json();
  }
);

export const deleteSpreadsheet = createAsyncThunk(
  "spreadsheets/deleteSpreadsheet",
  async (payload) => {
    const response = await trackerAPI.delete(
      `/api/spreadsheets/${payload.id}`,
      null
    );
    return response.json();
  }
);

export const updateSpreadsheet = createAsyncThunk(
  "spreadsheets/updateSpreadsheet",
  async (payload) => {
    const response = await trackerAPI.put(`/api/spreadsheets/${payload.id}`, {
      name: payload.name,
      path: payload.path,
    });
    return response.json();
  }
);

export const addNewSpreadsheet = createAsyncThunk(
  "spreadsheets/addNewSpreadsheet",
  async (payload) => {
    const response = await trackerAPI.post("/api/spreadsheets", {
      name: payload.name,
      path: payload.path,
    });
    return response.json();
  }
);

export const addNewPlayerAction = createAsyncThunk(
  "spreadsheets/addNewPlayerAction",
  async (payload) => {
    const response = await trackerAPI.post(
      `/api/spreadsheets/${payload.id}/player/${payload.player}/action`,
      {
        type: payload.action,
        value: payload.value,
      }
    );

    const data = await response.json();
    return { spreadsheet: payload.id, player: payload.player, data: data };
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
      .addCase(addNewPlayerAction.fulfilled, (state, action) => {
        const { spreadsheet, player, data } = action.payload;
        const playerIndex = state.entities[spreadsheet].players.findIndex(p => p.name === player);
        state.entities[spreadsheet].players[playerIndex] = data;
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
