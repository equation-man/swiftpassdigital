// Action types for logging in and logging out
export const LOGIN_START = 'LOGIN_START';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT_START = 'LOGOUT_START';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

// You can optionally document expected payloads for clarity

// Example action creators:
export const loginStart = () => ({ type: LOGIN_START });
export const loginSuccess = (token) => ({ type: LOGIN_SUCCESS, payload: token });
export const loginFailure = (error) => ({ type: LOGIN_FAILURE, payload: error });

export const logoutStart = () => ({ type: LOGOUT_START });
export const logoutSuccess = () => ({ type: LOGOUT_SUCCESS });
export const logoutFailure = (error) => ({ type: LOGOUT_FAILURE, payload: error });

// Optional: you can export all action creators together
export const authActions = {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure
};

