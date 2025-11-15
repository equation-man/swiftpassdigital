// This helps decide how the state will change on the invocation of a given action.
import { authInitialState } from "../initialStates/authInitialState";
import {
    LOGIN_SUCCESS,
    LOGIN_FAILURE,
    LOGIN_START,
    LOGOUT_SUCCESS,
    LOGOUT_FAILURE
} from "../constants/authConstants";

const authReducer = (state = authInitialState, action) => {
    switch (action.type) {
        case LOGIN_START:
            return { ...state, loading: true, error: null };
        case LOGIN_SUCCESS:
            return { ...state, token: action.payload, isAuthenticated: true, loading: false };
        case LOGIN_FAILURE:
            return { ...state, loading: false, error: action.payload };
        case LOGOUT_SUCCESS:
            return { ...state, loading: true, error: null };
        case LOGOUT_FAILURE:
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

export default authReducer;
