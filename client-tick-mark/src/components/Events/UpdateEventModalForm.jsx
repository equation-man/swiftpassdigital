// Create Event modal.
"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { updateEventFormState, updateEventModalState } from "@/redux/reducers/generalReducer";
import { editEventFn } from "@/app/event/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dateTimeToUtc } from "@/lib/helpers";
import CreateTicketModal from "@/components/Events/CreateTicketModal";

const UpdateEventModalForm = ({ eventOwner }) => {
    // Fetching data from redux store.
    const fetch_states = useSelector((state) => state.generalModal.upd_form);
    const fetch_ev_payload = useSelector((state) => state.generalModal.event_details);

    const [inputs, setInputs] = useState({});
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs((values) => ({ ...values, [name]: value }));
    };

    const dispatch = useDispatch();
    const handleEditEventModDisp = (e) => {
        e.preventDefault();
        dispatch(updateEventModalState(false));
        dispatch(updateEventFormState(false));
    };

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: ["editEvent"],
        mutationFn: (inputs) => editEventFn(inputs),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["MyEvents"] });

            toast.success("Event has been edited successfully", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            });

            dispatch(
                updateEvDetails({
                    event_id: data.event_id,
                    event_title: data.title,
                    start_time: data.start_date,
                    finish_time: data.finish_date,
                })
            );
            //dispatch(createTicketModalState(false));
            //dispatch(clearTicketItems());
            dispatch(updateEventFormState(false));
        },
        onError: (error) => {
            toast.error("Failed editing the event, try again!");
        }
    });

    const handleEditEventSubmission = async (event) => {
        event.preventDefault();
        const eventUpdate = {...inputs};
        // Mutation to add the event
        mutation.mutate(eventUpdate);
        //dispatch(createTicketModalState(false));
        //dispatch(clearTicketItems());
    };

    return (
        <>
            {fetch_states && (
                <div className="flex justify-center items-center fixed z-50 inset-0 backdrop-blur-sm">
                    <dialog className="relative bg-neutral-50 w-96 py-6 mx-2 flex flex-col items-center shadow-lg rounded-sm">
                        <div className="flex flex-col items-center justify-center">
                            <h3 className="font-bold text-gray-700 text-md">
                                {eventOwner.organization_name} Event
                            </h3>
                            <div className="px-2">
                                <form
                                    id="eventUpdateForm"
                                    onSubmit={handleEditEventSubmission}
                                    className="w-90"
                                >
                                    <div>
                                        <label className="font-medium text-gray-600">
                                            Event title
                                        </label>
                                        <input
                                            onChange={handleChange}
                                            name="title"
                                            className="input validator w-full"
                                            type="text"
                                            placeholder="Event title"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-medium text-gray-600">
                                            Event venue
                                        </label>
                                        <input
                                            onChange={handleChange}
                                            name="venue"
                                            className="input validator w-full"
                                            type="text"
                                            placeholder="Event venue"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-medium text-gray-600">
                                            Event tag
                                        </label>
                                        <input
                                            onChange={handleChange}
                                            name="event_tag"
                                            className="input validator w-full"
                                            type="text"
                                            placeholder="e.g. Swimming, Athletics"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-medium text-gray-600">
                                            Start date
                                        </label>
                                        <input
                                            onChange={handleChange}
                                            name="start_date"
                                            className="input validator w-full"
                                            type="datetime-local"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-medium text-gray-600">
                                            End date
                                        </label>
                                        <input
                                            onChange={handleChange}
                                            name="finish_date"
                                            className="input validator w-full"
                                            type="datetime-local"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-medium text-gray-600">
                                            Event description
                                        </label>
                                        <textarea
                                            onChange={handleChange}
                                            name="description"
                                            rows="7"
                                            className="input validator w-full"
                                            placeholder="Tell people about the event."
                                        ></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="text-white flex flex-row gap-x-3 w-full p-2">
                            <button
                                type="button"
                                onClick={handleEditEventModDisp}
                                className="bg-emerald-800 btn-block p-2 hover:cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="eventUpdateForm"
                                className="bg-emerald-500 btn-block p-2 hover:cursor-pointer"
                            >
                                Complete
                            </button>
                        </div>
                    </dialog>
                </div>
            )}
        </>
    );
};

export default UpdateEventModalForm;

