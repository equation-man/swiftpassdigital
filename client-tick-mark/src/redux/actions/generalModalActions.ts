import {Dispatch} from "redux";

// Declaring function types for modal triggering.
export const changeModalState = (state: bool) => ({displayState: state});

export const updateModalStatus = (dispState: {modalState: bool}) => {
    return async (dispatch: Dispatch) => {
        try {
            //Change the state of the modal
            dispatch(changeModalState(dispState.modalState));
        } catch (error: unknown) {
            console.log("Error displaying modal");
        }
    };
}
