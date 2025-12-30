// Updating ticket and event modal
"use client";
import { useSelector, useDispatch } from "react-redux";
import { updateEventModalState } from "@/redux/reducers/generalReducer";

const UpdateEventOrTicketModal = () => {
    const fetch_states = useSelector((state) => state.generalModal.upd_event);

    // Close modal
    const dispatch = useDispatch();
    const handleCloseUpdModal = (e, state) => {
        event.preventDefault();
        dispatch(updateEventModalState(state));
    }
    return (
        <>
            {fetch_states && (
                <div className="flex justify-center items-center fixed z-50 inset-0 backdrop-blur-sm">
                    <dialog className="relative bg-neutral-50 w-96 py-6 mx-2 flex flex-col items-center shadow-lg rounded-sm">
                        <button
                            onClick={(e) => handleCloseUpdModal(e, false)}
                            className="bg-rose-700 text-white p-2 hover:cursor-pointer hover:bg-rose-400"
                        >
                            Cancel
                        </button>
                    </dialog>
                </div>
            )}
        </>
    );
};

export default UpdateEventOrTicketModal;
