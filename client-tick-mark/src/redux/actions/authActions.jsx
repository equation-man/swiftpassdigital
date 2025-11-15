// DEFINING THE ACTIONS WE INTEND TO DO.
// Here we will only have to actions,
// Login in and another one for Log out
// Both the log in and log out will be
// exposed to the entire application.
import api from '@/app/api/api';
import {
    loginFailure,
    loginStart,
    loginSuccess,
    logoutFailure,
    logoutStart,
    logoutSuccess
} from "../actionCreators/actionCreator";

// Login action
export const login = (credentials) => {
    return async (dispatch) => {
        try {
            dispatch(loginStart());
            // Connect to the API for login
            // const response = await api.post('/users', credentials);
            // dispatch(loginSuccess(response.data.access_token));
            console.log("Login in redux");
        } catch (error) {
            // dispatch(loginFailure(error.response?.data?.detail || "Login failed"));
            console.log("Login error in redux");
        }
    };
};

// Logout action
export const logout = () => {
    return async (dispatch) => {
        try {
            dispatch(logoutStart());
            // Send API request for logout
            // const response = await api.post('/logout');
            // if (response.data.status_code === 200) dispatch(logoutSuccess());
            // else dispatch(logoutFailure("Could not log out"));
            console.log("Logout in redux");
        } catch (error) {
            // dispatch(logoutFailure(error.response?.data?.detail || "Logout failed"));
            console.log("Logout error in redux");
        }
    };
};

