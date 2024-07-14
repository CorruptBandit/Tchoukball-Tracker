import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  chats: {},
  datasources: {},
};

export const liveDataSlice = createSlice({
  name: "liveData",
  initialState,
  reducers: {
    updateLiveData: (state, action) => {
      const { type, payload } = action.payload;
      if (state[type]) {
        if (!state[type][payload.sender]) {
          state[type][payload.sender] = [];
        }
        state[type][payload.sender].push(payload);

        if (state[type][payload.sender].length > 200) {
          state[type][payload.sender] = state[type][payload.sender].slice(-200);
        }
      }
    },
    clearLiveData: (state, action) => {
      const { type } = action.payload;
      state[type] = {};
    },
  },
});

export default liveDataSlice.reducer;
