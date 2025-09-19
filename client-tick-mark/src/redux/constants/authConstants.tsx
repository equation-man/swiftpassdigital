// Action types for logging in and logging out.
export const LOGIN_START = 'LOGIN_START';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT_START = 'LOGOUT_START';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';

export type LoginStartAction = { type: typeof LOGIN_START };
export type LoginSuccessAction = { type: typeof LOGIN_SUCCESS, payload: string };
export type LoginFailureAction = { type: typeof LOGIN_FAILURE, payload: string };
export type LogoutStartAction = { type: typeof LOGOUT_START };
export type LogoutSuccessAction = { type: typeof LOGOUT_SUCCESS };
export type LogoutFailureAction = { type: typeof LOGOUT_FAULURE, payload: string };

// Exporting a union type.
export type AuthActionTypes = LoginStartAction | LoginSuccessAction | LoginFailureAction |
    LogoutStartAction | LogoutSuccessAction | LogoutFailureAction
