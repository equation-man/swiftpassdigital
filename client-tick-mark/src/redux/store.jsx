// In this file we will configure our store.
import { configureStore } from "@reduxjs/toolkit";
import thunk from "redux-thunk";
import authReducer from "@/redux/reducers/authReducer";
import modalReducer from "@/redux/reducers/generalReducer";

const store = configureStore({
  reducer: {
    auth: authReducer,
    generalModal: modalReducer, // Key matches slice name
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
    }),
});

export default store;
