import {
    createAsyncThunk,
    createEntityAdapter,
    createSelector,
    createSlice,
  } from "@reduxjs/toolkit";
  import { dashboardAPI } from "../DashboardAPI";
  
  const dashboardsAdapter = createEntityAdapter();
  const initialState = dashboardsAdapter.getInitialState({
    status: "idle",
    error: null,
  });
  
  export const fetchDashboards = createAsyncThunk(
    "dashboards/fetchDashboards",
    async () => {
      const response = await dashboardAPI.fetch(
        "/api/dashboards",
        null,
      );
      return response.json();
    }
  );

  export const fetchDashboardById = createAsyncThunk(
    "dashboards/fetchDashboardsById",
    async (payload) => {
      const response = await dashboardAPI.fetch(
        `/api/dashboards/${payload.id}`,
        null,
      );
      return response.json();
    }
  );
  
  
  export const deleteDashboard = createAsyncThunk(
    "dashboards/deleteDashboard",
    async (payload) => {
      const response = await dashboardAPI.delete(
        `/api/dashboards/${payload.id}`,
        null
      );
      return response.json();
    }
  );
  
  export const updateDashboard = createAsyncThunk(
    "dashboards/updateDashboard",
    async (payload) => {
      const response = await dashboardAPI.put(
        `/api/dashboards/${payload.id}`,
        {
          name: payload.name,
          path: payload.path
        }
      );
      return response.json();
    }
  );
  
  export const addNewDashboard = createAsyncThunk(
    "dashboards/addNewDashboard",
    async (payload) => {
      const response = await dashboardAPI.post(
        "/api/dashboards",
        {
          name: payload.name,
          path: payload.path
        }
      );
      return response.json();
    }
  );
  
  export const addComponentToDashboard = createAsyncThunk(
    "dashboards/addComponentToDashboard",
    async (payload) => {
      const response = await dashboardAPI.post(
        `/api/dashboards/${payload.id}/components`,
        {
          "componentID": payload.componentID,
          "type": payload.type
        }
      );
      return response.json();
    }
  );
  
  export const removeComponentFromDashboard = createAsyncThunk(
    "dashboards/removeComponentFromDashboard",
    async (payload) => {
      const response = await dashboardAPI.delete(
        `/api/dashboards/${payload.id}/components`,
        {
          "componentID": payload.componentID,
          "type": payload.type
        }
      );
      return response.json();
    }
  );

  export const dashboardsSlice = createSlice({
    name: "dashboards",
    initialState,
    reducers: {},
    extraReducers(builder) {
      builder
        .addCase(fetchDashboards.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(fetchDashboards.fulfilled, (state, action) => {
          state.status = "succeeded";
          dashboardsAdapter.upsertMany(state, action.payload);
        })
        .addCase(fetchDashboards.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.error.message;
        })
        .addCase(updateDashboard.fulfilled, (state, action) => {
          const updatedDashboard = action.payload;
          dashboardsAdapter.updateOne(state, {
            id: updatedDashboard.id,
            changes: updatedDashboard,
          });
        })
        .addCase(deleteDashboard.fulfilled, (state, action) => {
          dashboardsAdapter.removeOne(state, action.meta.arg.id);
        })
        .addCase(addNewDashboard.fulfilled, (state, action) => {
          dashboardsAdapter.addOne(state, action.payload);
        })
        .addCase(addComponentToDashboard.fulfilled, (state, action) => {
          const updatedDashboard = action.payload;
          dashboardsAdapter.updateOne(state, {
            id: updatedDashboard.id,
            changes: updatedDashboard,
          });
        })
        .addCase(removeComponentFromDashboard.fulfilled, (state, action) => {
          const updatedDashboard = action.payload;
          dashboardsAdapter.updateOne(state, {
            id: updatedDashboard.id,
            changes: updatedDashboard,
          });
        });
    },
  });
  
  export const dashboardsActions = dashboardsSlice.actions;
  export default dashboardsSlice.reducer;
  
  export const {
    selectAll: selectAllDashboards,
    selectById: selectDashboardById,
    selectIds: selectDashboardIds,
  } = dashboardsAdapter.getSelectors((state) => state.dashboards);
  
  export const selectDashboardNames = createSelector(
    [selectAllDashboards, (state) => state],
    (dashboards) => {
      return dashboards.map((dashboard) => dashboard.name);
    }
  );
  
  export const selectDashboardByName = createSelector(
    [selectAllDashboards, (state, name) => name],
    (dashboards, name) => dashboards.find((dashboard) => dashboard.name === name)
  );
  