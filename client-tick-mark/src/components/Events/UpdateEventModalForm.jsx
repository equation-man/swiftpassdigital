// Create Event modal.
"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import {
    createEventModalState, createTicketModalState,
    updateEvDetails, createEvDetails, clearTicketItems
} from "@/redux/reducers/generalReducer";

import { createEventFn } from "@/app/event/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dateTimeToUtc } from "@/lib/helpers";
import CreateTicketModal from "@/components/Events/CreateTicketModal";

const UpdateEventModalForm = ({ eventOwner }) => {
    const fetch_states = useSelector((state) => state.generalModal.upd_event);
    const [inputs, setInputs] = useState({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs((values) => ({ ...values, [name]: value }));
    };

    const dispatch = useDispatch();
    const handleCreateEventModDisp = (e, state) => {
        e.preventDefault();
        dispatch(createEventModalState(state));
        dispatch(clearTicketItems());
    };

    // Fetching event details and ticket details.
    const fetch_tick_itms = useSelector((state) => state.generalModal.ticket_items);
    const fetch_ev_payload = useSelector((state) => state.generalModal.create_event_details);

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: ["createEvent"],
        mutationFn: (inputs) => createEventFn(inputs),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["MyEvents"] });

            toast.success("Congratulations! Your event has been created!", {
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
            dispatch(createTicketModalState(false));
            dispatch(clearTicketItems());
            dispatch(createEventModalState(false));
        },
        onError: () => {
            toast.error("Failed creating event, try again!");
        }
    });

    const handleTicketCreation = async (event) => {
        event.preventDefault();
        const updatedInputs = { ...inputs };

        updatedInputs.owner_id = eventOwner.organization_id;
        updatedInputs.start_date = dateTimeToUtc(updatedInputs.start_date);
        updatedInputs.finish_date = dateTimeToUtc(updatedInputs.finish_date);

        // mutation.mutate(updatedInputs);
        dispatch(createEvDetails(updatedInputs));
        dispatch(createTicketModalState(true));
    };

    const handleCreateEventSubmission = async (event) => {
        event.preventDefault();
        const eventUpdate = { event_details: fetch_ev_payload, ticket_details: fetch_tick_itms };
        // Mutation to add the event
        mutation.mutate(eventUpdate);
        dispatch(createTicketModalState(false));
        dispatch(clearTicketItems());
        dispatch(createEventModalState(false));
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
                                    id="eventForm"
                                    onSubmit={handleCreateEventSubmission}
                                    onReset={(e) => handleCreateEventModDisp(e, false)}
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
                                            required
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
                                            required
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
                                            required
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
                                            required
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
                                            required
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
                                            required
                                            placeholder="Tell people about the event."
                                        ></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {!!fetch_tick_itms ? (
                            <p className="text-xs text-green-600 pt-1 px-2">
                                Your event is ready for publishing
                            </p>
                        ):(
                            <p className="text-xs text-rose-600 pt-1 px-2">
                                Create ticket to publish the event. You can create tickets of different types e.g reqular, discount
                            </p>
                        )}
                        <div className="text-white flex flex-row gap-x-3 w-full p-2">
                            <button
                                onClick={handleTicketCreation}
                                disabled={!!fetch_tick_itms}
                                className={`bg-emerald-800 btn-block p-2 ${!!fetch_tick_itms ? "hover:cursor-not-allowed" : "hover:cursor-pointer"}`}
                            >
                                Generate ticket
                            </button>
                            <button
                                type="submit"
                                form="eventForm"
                                disabled={!!!fetch_tick_itms}
                                className={`bg-emerald-500 btn-block p-2 ${!!!fetch_tick_itms ? "hover:cursor-not-allowed" : "hover:cursor-pointer" }`}
                            >
                                Publish
                            </button>
                        </div>
                        <div className="text-white w-full p-2">
                            <button
                                type="reset"
                                form="eventForm"
                                className="bg-emerald-500 btn-block p-2 hover:cursor-pointer"
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

export default UpdateEventModalForm;

