// Updating ticket and event modal
"use client";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { updateEventModalState } from "@/redux/reducers/generalReducer";

const UpdateEventOrTicketModal = ({ eventDetails }) => {
    const fetch_states = useSelector((state) => state.generalModal.upd_event);
    const fetch_ev_details = useSelector((state) => state.generalModal.event_details);

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

    return (
        <>
            {fetch_states && (
                <div className="flex justify-center items-center fixed z-50 inset-0 backdrop-blur-sm">
                    <dialog className="relative bg-neutral-50 w-96 py-6 mx-2 flex flex-col items-center shadow-lg rounded-sm">
                        <div className="">
                            <h4 className="text-lg font-bold text-center text-neutral-700">Edit options</h4>
                            <h3 className="text-xl font-semibold text-center text-teal-700">{fetch_ev_details.event_title}</h3>
                        </div>
                        <div className="grid grid-cols-2 w-full gap-x-2">
                            <button
                                onClick={(e) => handleCloseUpdModal(e, false)}
                                className="btn btn-block bg-emerald-500 text-white p-2 m-2 hover:cursor-pointer hover:bg-rose-400"
                            >
                                Event Actions
                            </button>
                            <button
                                onClick={(e) => handleTicketUpdate(e, false)}
                                className="btn btn-block bg-teal-700 text-white p-2 m-2 hover:cursor-pointer hover:bg-teal-500"
                            >
                                Ticket Actions
                            </button>
                        </div>
                        <div className="w-full w-2">
                            <button
                                onClick={(e) => handleCloseUpdModal(e, false)}
                                className="btn btn-block bg-rose-700 text-white p-2 m-2 hover:cursor-pointer hover:bg-rose-400"
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
