// DEFINING THE ACTIONS WE INTEND TO DO.
// Here we will only have to actions,
// Login in and another one for Log out
// Both the log in and log out will be
// exposed to the entire application.
import api from '@/app/api/api';
import {Dispatch} from "redux";
import {
    loginFailure, loginStart,
    loginSuccess, logoutFailure,
    logoutStart, logoutSuccess
} from "../actionCreators/actionCreator";

export const login = (credentials: {username: string; password: string}) => {
    return async (dispatch: Dispatch) => {
        try {
            dispatch(loginStart());
            // Connecting to the api for login goes here and get the response.
            // response = api.post('/users', {dataa})
            // dispatch(loginSuccess(response.data.access_token));
            console.log("Login in redux");
        } catch (error: any) {
            //dispatch(loginFailure(error.response.data.detail));
            console.log("Login error in redux");
        }
    };
};

export const logout = () => {
    return async (dispatch: Dispatch) => {
        try {
            dispatch(logoutStart());
            // Send api request here and get the response.
            // if (response.data.statsu_code === 200) dispatch(logoutSuccess())
            // else dispatch(logoutFailure("Could not log out")
            console.log("Logout in redux")
        } catch (error: any) {
            // dispatch(logoutFailure(error.response.data.detail));
            console.log("Logout error in redux");
        }
    };
};
