// Declaring function types for modal triggering.
export const changeModalState = (state) => ({ displayState: state });
export const updateModalStatus = (dispState) => {
    return async (dispatch) => {
        try {
            //Change the state of the modal
            dispatch(changeModalState(dispState.modalState));
        }
        catch (error) {
            console.log("Error displaying modal");
        }
    };
};
