import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
  } from "@reduxjs/toolkit";
  import { dashboardAPI } from "../DashboardAPI";
  
  const settingsAdapter = createEntityAdapter();
  const initialState = settingsAdapter.getInitialState({
    status: "idle",
    error: null,
  });
  
  export const fetchSettings = createAsyncThunk(
    "settings/fetchSettings",
    async () => {
      const response = await dashboardAPI.fetch(
        "/api/settings",
        null,
      );
      return response.json();
    }
  );

  export const fetchSettingById = createAsyncThunk(
    "settings/fetchSettingsById",
    async (payload) => {
      const response = await dashboardAPI.fetch(
        `/api/settings/${payload.id}`,
        null,
      );
      return response.json();
    }
  );
  
  
  export const deleteSetting = createAsyncThunk(
    "settings/deleteSetting",
    async (payload) => {
      const response = await dashboardAPI.delete(
        `/api/settings/${payload.id}`,
        null
      );
      return response.json();
    }
  );
  
  export const updateSetting = createAsyncThunk(
    "settings/updateSetting",
    async (payload) => {
      const response = await dashboardAPI.put(
        `/api/settings/${payload.id}`,
        {
          name: payload.name,
          type: payload.type,
          value: payload.value.toString()
        }
      );
      return response.json();
    }
  );
  
  export const addNewSetting = createAsyncThunk(
    "settings/addNewSetting",
    async (payload) => {
      const response = await dashboardAPI.post(
        "/api/settings",
        {
          name: payload.name,
          description: payload.description
        }
      );
      return response.json();
    }
  );
  
  export const settingsSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {},
    extraReducers(builder) {
      builder
        .addCase(fetchSettings.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchSettings.fulfilled, (state, action) => {
          state.status = "succeeded";
          settingsAdapter.upsertMany(state, action.payload);
        })
        .addCase(fetchSettings.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.error.message;
        })
        .addCase(updateSetting.fulfilled, (state, action) => {
          const updatedSetting = action.payload;
          settingsAdapter.updateOne(state, {
            id: updatedSetting.id,
            changes: updatedSetting,
          });
        })
        .addCase(deleteSetting.fulfilled, (state, action) => {
          settingsAdapter.removeOne(state, action.meta.arg.id);
        })
        .addCase(addNewSetting.fulfilled, (state, action) => {
          settingsAdapter.addOne(state, action.payload);
        });
    },
  });
  
  export const settingsActions = settingsSlice.actions;
  export default settingsSlice.reducer;
  
  export const {
    selectAll: selectAllSettings,
    selectById: selectSettingById,
    selectIds: selectSettingIds,
  } = settingsAdapter.getSelectors((state) => state.settings);
  
  export const selectSettingNames = createSelector(
    [selectAllSettings, (state) => state],
    (settings) => {
      return settings.map((setting) => setting.name);
    }
  );
  
  export const selectSettingByName = createSelector(
    [selectAllSettings, (state, name) => name],
    (settings, name) => settings.find((setting) => setting.name === name)
  );
  