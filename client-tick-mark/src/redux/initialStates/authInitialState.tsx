// Initial state to help the program run correctly on the first render.
// Here we defile and interface for the initial state required.


// Defining an interface.
export interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

// Defining initial state.
export const authInitialState: AuthState = {
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};
