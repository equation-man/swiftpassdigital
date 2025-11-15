
// Action creator to change modal state
export const changeModalState = (state) => ({
    type: "CHANGE_MODAL_STATE", // it's good practice to include a type for Redux actions
    displayState: state
});

// Thunk action to update modal status asynchronously
export const updateModalStatus = (dispState) => {
    return async (dispatch) => {
        try {
            // Change the state of the modal
            dispatch(changeModalState(dispState.modalState));
        } catch (error) {
            console.log("Error displaying modal", error);
        }
    };
};

