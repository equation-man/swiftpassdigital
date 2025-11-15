/// Actions are created here.
import {
    LOGIN_FAILURE,
    LOGIN_START,
    LOGIN_SUCCESS,
    LOGOUT_FAILURE,
    LOGOUT_START,
    LOGOUT_SUCCESS
} from "../constants/authConstants";

// Action creators
export const loginStart = () => ({ type: LOGIN_START });
export const loginSuccess = (token) => ({ type: LOGIN_SUCCESS, payload: token });
export const loginFailure = (error) => ({ type: LOGIN_FAILURE, payload: error });
export const logoutStart = () => ({ type: LOGOUT_START });
export const logoutSuccess = () => ({ type: LOGOUT_SUCCESS });
export const logoutFailure = (error) => ({ type: LOGOUT_FAILURE, payload: error });

