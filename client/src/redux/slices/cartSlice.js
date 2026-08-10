import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "cart",
  initialState: { items: [] },
  reducers: {
    setCart(state, action) {
      state.items = action.payload || [];
    },
    clearCart(state) {
      state.items = [];
    }
  }
});

export const { setCart, clearCart } = slice.actions;
export default slice.reducer;
