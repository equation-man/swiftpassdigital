// In this file we will configure our store.
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/redux/reducers/authReducer";
import modalReducer from "@/redux/reducers/generalReducer";
const store = configureStore({
    reducer: {
        auth: authReducer,
        //general: generalReducer,
        generalModal: modalReducer, // Key matches name.
        // Add other reducer if needed.
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
        thunk: true,
        serializableCheck: false,
    })
});
// We can export store and other types that we will
// need throughout the application.
export default store;
