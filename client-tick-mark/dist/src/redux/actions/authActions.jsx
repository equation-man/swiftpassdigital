import { loginStart, logoutStart } from "../actionCreators/actionCreator";
export const login = (credentials) => {
    return async (dispatch) => {
        try {
            dispatch(loginStart());
            // Connecting to the api for login goes here and get the response.
            // response = api.post('/users', {dataa})
            // dispatch(loginSuccess(response.data.access_token));
            console.log("Login in redux");
        }
        catch (error) {
            //dispatch(loginFailure(error.response.data.detail));
            console.log("Login error in redux");
        }
    };
};
export const logout = () => {
    return async (dispatch) => {
        try {
            dispatch(logoutStart());
            // Send api request here and get the response.
            // if (response.data.statsu_code === 200) dispatch(logoutSuccess())
            // else dispatch(logoutFailure("Could not log out")
            console.log("Logout in redux");
        }
        catch (error) {
            // dispatch(logoutFailure(error.response.data.detail));
            console.log("Logout error in redux");
        }
    };
};
