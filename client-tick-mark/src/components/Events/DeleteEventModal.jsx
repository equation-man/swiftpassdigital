// Deleting event modal.
"use client";

import { useSelector, useDispatch } from "react-redux";
import { deleteModalState } from "@/redux/reducers/generalReducer";

const DeleteEventModal = ({ eventDetails }) => {
    const fetch_state = useSelector((state) => state.generalModal.del_event);

    const dispatch = useDispatch();

    const handleDisplayDelModal = (e, state) => {
        e.preventDefault();
        dispatch(deleteModalState(state));
    };

    return (
        <>
            {fetch_state && (
                <div className="flex justify-center items-center fixed z-50 inset-0 backdrop-blur-sm">
                    <dialog className="relative bg-neutral-50 w-96 py-6 mx-2 flex flex-col items-center shadow-lg rounded-sm">
                        <p className="text-center px-4">
                            Are you sure you want to delete this event?
                            <br />
                            Events can only be deleted if tickets have not been booked.
                        </p>

                        <div className="mt-4 flex gap-4">
                            <button
                                onClick={(e) => handleDisplayDelModal(e, false)}
                                className="bg-emerald-500 text-white px-4 py-2 rounded hover:cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={(e) => handleDisplayDelModal(e, true)}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </dialog>
                </div>
            )}
        </>
    );
};

export default DeleteEventModal;

