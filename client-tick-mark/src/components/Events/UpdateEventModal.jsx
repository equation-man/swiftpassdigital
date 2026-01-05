// Updating ticket and event modal
"use client";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { updateEventModalState, updateEventFormState } from "@/redux/reducers/generalReducer";

const UpdateEventOrTicketModal = ({ eventDetails }) => {
    const fetch_states = useSelector((state) => state.generalModal.upd_event);
    const fetch_ev_details = useSelector((state) => state.generalModal.event_details);
    const fetch_upd_form = useSelector((state) => state.generalModal.upd_form);

    // Close modal
    const dispatch = useDispatch();
    const handleCloseUpdModal = (e, state) => {
        e.preventDefault();
        dispatch(updateEventModalState(state));
    }

    // Handle ticket actions.
    const router = useRouter();
    const handleTicketUpdate = (e, state) => {
        e.preventDefault();
        dispatch(updateEventModalState(state));
        router.push(`/event/${fetch_ev_details.event_id}`);
    };

    // Handle event form.
    const handleEventFormDisplay = (e, state) => {
        e.preventDefault();
        dispatch(updateEventModalState(false));
        dispatch(updateEventFormState(state));
    };

    return (
        <>
            {fetch_states && (
                <div className="flex justify-center items-center fixed z-50 inset-0 backdrop-blur-sm">
                    <dialog className="relative bg-neutral-50 w-96 py-6 mx-2 flex flex-col items-center justify-center shadow-lg rounded-sm">
                        <div className="">
                            <h4 className="text-xl font-bold text-center text-neutral-700">Event edit options</h4>
                            <h3 className="text-lg text-center text-teal-700">{fetch_ev_details.event_title} event</h3>
                        </div>
                        <div className="grid grid-cols-2 itms-center w-full gap-x-2 p-2">
                            <button
                                onClick={(e) => handleEventFormDisplay(e, true)}
                                className="btn btn-block bg-emerald-600 text-white hover:cursor-pointer hover:bg-emerald-400"
                            >
                                Event Actions
                            </button>
                            <button
                                onClick={(e) => handleTicketUpdate(e, false)}
                                className="btn btn-block bg-teal-700 text-white hover:cursor-pointer hover:bg-teal-500"
                            >
                                Ticket Actions
                            </button>
                        </div>
                        <div className="w-full justify-center p-2">
                            <button
                                onClick={(e) => handleCloseUpdModal(e, false)}
                                className="btn btn-block bg-rose-700 text-white hover:cursor-pointer hover:bg-rose-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </dialog>
                </div>
            )}
        </>
    );
};

export default UpdateEventOrTicketModal;
