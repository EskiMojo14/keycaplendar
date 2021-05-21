import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";

type MainState = {
  transition: boolean;
  loading: boolean;
  content: boolean;
};

const initialState: MainState = {
  transition: false,
  loading: false,
  content: true,
};

export const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    setTransition: (state, action: PayloadAction<boolean>) => {
      state.transition = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setContent: (state, action: PayloadAction<boolean>) => {
      state.content = action.payload;
    },
  },
});

export const { setTransition, setLoading, setContent } = mainSlice.actions;

export const selectTransition = (state: RootState) => state.main.transition;

export const selectLoading = (state: RootState) => state.main.loading;

export const selectContent = (state: RootState) => state.main.content;

export default mainSlice.reducer;
