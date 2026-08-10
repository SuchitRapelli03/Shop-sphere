import { createSlice } from "@reduxjs/toolkit";

const saved = JSON.parse(localStorage.getItem("user") || "null");

const slice = createSlice({
  name: "auth",
  initialState: { user: saved, token: localStorage.getItem("token") },
  reducers: {
    setAuth(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  }
});

export const { setAuth, logout } = slice.actions;
export default slice.reducer;
