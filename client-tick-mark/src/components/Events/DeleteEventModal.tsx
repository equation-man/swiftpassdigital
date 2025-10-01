// Deleting event modal.
"use client";
import { useSelector, useDispatch } from "react-redux";
import { deleteModalState } from "@/redux/reducers/generalReducer";

type Props = {
    eventDetails: Event;
}

const DeleteEventModal = ({ eventDetails }: Props) => {
    const fetch_state = useSelector((state) => state.generalModal.del_event);

    const dispatch = useDispatch();
    const handleDisplayDelModal = (e, state) => {
        e.preventDefault();
        dispatch(deleteModalState(state));
    }

    return (
        <>
            {fetch_state && (
                <div className="flex justify-center items-center fixed z-50 inset-0 backdrop-blur-sm">
                    <dialog className="relative bg-neutral-50 w-96 py-6 mx-2 flex flex-col items-center shadow-lg rounded-sm">
                        Are you sure you want to delete this event?
                        Events can only be deleted if tickets have not been booked.
                        <button onClick={handleDisplayDelModal(e, false)}>
                            Cancel
                        </button>
                    </dialog>
                </div>
            )}
        </>
    )
};

export default DeleteEventModal;
