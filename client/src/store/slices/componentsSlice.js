import {
  createEntityAdapter,
  createAsyncThunk,
  createSlice,
} from "@reduxjs/toolkit";
import { dashboardAPI } from "../API";

// Creating separate adapters for each type
const adapters = {
  chats: createEntityAdapter(),
  graphs: createEntityAdapter(),
  images: createEntityAdapter(),
  maps: createEntityAdapter(),
  texts: createEntityAdapter(),
  videos: createEntityAdapter(),
  webpages: createEntityAdapter(),
  datasources: createEntityAdapter(),
};

const initialState = {
  chats: adapters.chats.getInitialState({ status: "idle" }),
  graphs: adapters.graphs.getInitialState({ status: "idle" }),
  images: adapters.images.getInitialState({ status: "idle" }),
  maps: adapters.maps.getInitialState({ status: "idle" }),
  texts: adapters.texts.getInitialState({ status: "idle" }),
  videos: adapters.videos.getInitialState({ status: "idle" }),
  webpages: adapters.webpages.getInitialState({ status: "idle" }),
  datasources: adapters.datasources.getInitialState({ status: "idle" }),
  error: null,
};

export const fetchComponents = createAsyncThunk(
  "components/fetchComponents",
  async (type, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/${type}`);
      const components = await response.json();
      return { type, components };
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.toString());
    }
  }
);

export const fetchComponentById = createAsyncThunk(
  "components/fetchComponentsById",
  async (payload) => {
    const response = await dashboardAPI.fetch(
      `/api/${payload.type}/${payload.id}`,
      null
    );
    const component = await response.json();
    return { type: payload.type, component: component };
  }
);

export const deleteComponent = createAsyncThunk(
  "components/deleteComponent",
  async (payload) => {
    const response = await dashboardAPI.delete(
      `/api/${payload.type}/${payload.id}`,
      null
    );
    const component = await response.json();
    return { type: payload.type, component: component };
  }
);

export const updateComponent = createAsyncThunk(
  "components/updateComponent",
  async (payload) => {
    const response = await dashboardAPI.put(
      `/api/${payload.type}/${payload.id}`,
      payload
    );
    const component = await response.json();
    return { type: payload.type, component: component };
  }
);

export const updateSize = createAsyncThunk(
  "components/updateSize",
  async (payload) => {
    const response = await dashboardAPI.put(
      `/api/attributes/${payload.type}/${payload.id}/size`,
      {
        width: payload.size.width,
        height: payload.size.height,
      }
    );
    const json = await response.json();
    return { type: payload.type, id: payload.id, component: json };
  }
);

export const updatePosition = createAsyncThunk(
  "components/updatePosition",
  async (payload) => {
    const response = await dashboardAPI.put(
      `/api/attributes/${payload.type}/${payload.id}/position`,
      {
        x: payload.position.x,
        y: payload.position.y,
      }
    );
    const json = await response.json();
    return { type: payload.type, id: payload.id, component: json };
  }
);

export const addIconToMap = createAsyncThunk(
  "components/addIconToMap",
  async (payload) => {
    const response = await dashboardAPI.post(
      `/api/maps/${payload.mapId}/icons`,
      payload
    );
    return response.json();
  }
);

export const removeIconFromMap = createAsyncThunk(
  "components/removeIconFromMap",
  async (payload) => {
    const response = await dashboardAPI.delete(
      `/api/maps/${payload.mapId}/icons`,
      payload
    );
    return response.json();
  }
);

export const addNewComponent = createAsyncThunk(
  "components/addNewComponent",
  async (payload) => {
    const response = await dashboardAPI.post(`/api/${payload.type}`, payload);
    const component = await response.json();
    return { type: payload.type, component: component };
  }
);

export const fetchComponentData = createAsyncThunk(
  "components/fetchComponentsData",
  async (payload) => {
    const response = await dashboardAPI.fetch(
      `/api/datasources/${payload.id}/data`,
      null
    );
    const data = await response.json();
    return { componentID: payload.componentID, type: payload.type, data: data };
  }
);

// Reducers updated to handle specific types
export const componentsSlice = createSlice({
  name: "components",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComponents.pending, (state, action) => {
        const type = action.meta.arg;
        state[type].status = "loading";
      })
      .addCase(fetchComponents.fulfilled, (state, action) => {
        const { type, components } = action.payload;
        if (!components?.code) {
          state[type].status = "succeeded";
          adapters[type].upsertMany(state[type], components);
        } else {
          state.error = components.message;
        }
      })
      .addCase(fetchComponents.rejected, (state, action) => {
        const { type } = action.meta.arg;
        state[type].status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchComponentById.fulfilled, (state, action) => {
        const { type, component } = action.payload;
        if (!component?.code) {
          state[type].status = "succeeded";
          adapters[type].upsertOne(state[type], component);
        } else {
          state.error = component.message;
        }
      })
      .addCase(updateComponent.fulfilled, (state, action) => {
        const { type, component } = action.payload;
        adapters[type].updateOne(state[type], {
          id: component.id,
          changes: component,
        });
      })
      .addCase(updatePosition.fulfilled, (state, action) => {
        const { id, type, component } = action.payload;
        adapters[type].updateOne(state[type], {
          id: id,
          changes: { position: component },
        });
      })
      .addCase(updateSize.fulfilled, (state, action) => {
        const { id, type, component } = action.payload;
        adapters[type].updateOne(state[type], {
          id: id,
          changes: { size: component },
        });
      })
      .addCase(deleteComponent.fulfilled, (state, action) => {
        const { type, id } = action.meta.arg;
        adapters[type].removeOne(state[type], id);
      })
      .addCase(addNewComponent.fulfilled, (state, action) => {
        const { type, component } = action.payload;
        adapters[type].addOne(state[type], component);
      })
      .addCase(addIconToMap.fulfilled, (state, action) => {
        const updatedMap = action.payload;
        adapters.maps.updateOne(state.maps, {
          id: updatedMap.id,
          changes: updatedMap,
        });
      })
      .addCase(removeIconFromMap.fulfilled, (state, action) => {
        const updatedMap = action.payload;
        adapters.maps.updateOne(state.maps, {
          id: updatedMap.id,
          changes: updatedMap,
        });
      })
      .addCase(fetchComponentData.fulfilled, (state, action) => {
        const { type, componentID, data } = action.payload;
        state[type].entities[componentID].data = data;
      });
  },
});

export default componentsSlice.reducer;
// Selector for Chats
export const {
  selectAll: selectAllChats,
  selectById: selectChatById,
  selectIds: selectChatIds,
} = adapters.chats.getSelectors((state) => state.components.chats);

// Selector for Graphs
export const {
  selectAll: selectAllGraphs,
  selectById: selectGraphById,
  selectIds: selectGraphIds,
} = adapters.graphs.getSelectors((state) => state.components.graphs);

// Selector for Images
export const {
  selectAll: selectAllImages,
  selectById: selectImageById,
  selectIds: selectImageIds,
} = adapters.images.getSelectors((state) => state.components.images);

// Selector for Maps
export const {
  selectAll: selectAllMaps,
  selectById: selectMapById,
  selectIds: selectMapIds,
} = adapters.maps.getSelectors((state) => state.components.maps);

// Selector for Texts
export const {
  selectAll: selectAllTexts,
  selectById: selectTextById,
  selectIds: selectTextIds,
} = adapters.texts.getSelectors((state) => state.components.texts);

// Selector for Videos
export const {
  selectAll: selectAllVideos,
  selectById: selectVideoById,
  selectIds: selectVideoIds,
} = adapters.videos.getSelectors((state) => state.components.videos);

// Selector for Webpages
export const {
  selectAll: selectAllWebpages,
  selectById: selectWebpageById,
  selectIds: selectWebpageIds,
} = adapters.webpages.getSelectors((state) => state.components.webpages);

// Selector for DataSources
export const {
  selectAll: selectAllDatasources,
  selectById: selectDatasourceById,
  selectIds: selectDatasourceIds,
} = adapters.datasources.getSelectors((state) => state.components.datasources);
