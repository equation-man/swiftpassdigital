// In this file we will configure our store.
import {configureStore, Dispatch, applyThunk, ThunkAction} from "@reduxjs/toolkit";
//import {ThunkMiddleware, ThunkAction} from "redux-thunk";
import thunk from "redux-thunk";
import {Action} from "@reduxjs/toolkit";
import authReducer from "@/redux/reducers/authReducer";

const store = configureStore({
    reducer: {
        auth: authReducer,
        // Add other reducer if needed.
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            thunk: true,
            serializableCheck: false,
        })
});

// We can export store and other types that we will
// need throughout the application.
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknnown, Action<string>>;
