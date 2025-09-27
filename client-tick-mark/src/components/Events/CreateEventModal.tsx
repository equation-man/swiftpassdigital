// Create Event modal.
"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { createEventModalState } from "@/redux/reducers/generalReducer";
import { createTicketModalState, updateEvDetails } from "@/redux/reducers/generalReducer";
import { createEventFn } from "@/app/event/actions";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Event, CreateEvent } from "@/types/types";
import { dateTimeToUtc } from "@/lib/helpers";
import { Event } from "@/types/types";
import CreateTicketModal from "@/components/Events/CreateTicketModal";

// Defining props for this component.
type Props= {
    eventOwner: T;
    ownerUpdFn: (value: Event) => void;
}

const EventCreationModal = ({ eventOwner }: Props) => {
    const fetch_states = useSelector((state) => state.generalModal.create_event);
    const [inputs, setInputs] = useState<CreateEvent | {}>({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]:value}));
    }

    const dispatch = useDispatch();
    const handleCreateEventModDisp = (e, state) => {
        e.preventDefault();
        dispatch(createEventModalState(state))
    }

    const mutation = useMutation({
        mutationKey: ['createEvent'],
        mutationFn: (inputs) => createEventFn(inputs),
        onSuccess: (data) => {
            toast.success("Congratulations your event has been created!", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            })
            dispatch(updateEvDetails({ event_id: data.event_id, event_title: data.title, start_time: data.start_date, finish_time: data.finish_date}))
            dispatch(createEventModalState(false));
        },
        onError: (err: Error) => {
            toast.error("Failed creating event, try again!");
        }
    });
    const handleCreateEventSubmission = async (event) => {
        event.preventDefault();
        inputs.owner_id = eventOwner.organization_id;
        const s_date = dateTimeToUtc(inputs.start_date);
        const f_date = dateTimeToUtc(inputs.finish_date);
        inputs.start_date = s_date;
        inputs.finish_date = f_date;
        mutation.mutate(inputs)
        dispatch(createTicketModalState(true))
    }

    return (
        <>
            {fetch_states && (
                <div className="flex justify-center items-center fixed z-50 inset-0 backdrop-blur-sm">
                    <dialog className="relative bg-neutral-50 w-96 py-6 mx-2 flex flex-col items-center shadow-lg rounded-sm">
                        <div className="flex flex-col items-center justify-center">
                            <h3 className="font-bold text-gray-700 text-md">{eventOwner.organization_name} Event</h3>
                            <div className="px-2">
                                <form id="eventForm" onSubmit={handleCreateEventSubmission} className="w-90">
                                    <div>
                                        <label className="font-medium text-gray-600">Event title</label>
                                        <input onChange={handleChange} id="title" name="title" className="input validator w-full" type="text" required placeholder="Event title" />
                                    </div>
                                    <div>
                                        <label className="font-medium text-gray-600">Event venue</label>
                                        <input onChange={handleChange} id="venue" name="venue" className="input validator w-full" type="text" required placeholder="Event venue" />
                                    </div>
                                    <div>
                                        <label className="font-medium text-gray-600">Event tag</label>
                                        <input onChange={handleChange} id="event_tag" name="event_tag" className="input validator w-full" type="text" required placeholder="e.g Swimming, Athletics" />
                                    </div>
                                    <div>
                                        <label className="font-medium text-gray-600">Start date</label>
                                        <input onChange={handleChange} id="start_date" name="start_date" className="input validator w-full" type="datetime-local" required />
                                    </div>
                                    <div>
                                        <label className="font-medium text-gray-600">End date</label>
                                        <input onChange={handleChange} id="finish_date" name="finish_date" className="input validator w-full" type="datetime-local" required />
                                    </div>
                                    <div>
                                        <label className="font-medium text-gray-600">Event description</label>
                                        <textarea
                                            onChange={handleChange}
                                            id="description"
                                            rows="7"
                                            name="description"
                                            className="input validator w-full" type="email"
                                            required
                                            placeholder="Tell people about the event." 
                                        ></textarea>
                                    </div>

                                </form>
                            </div>
                        </div>
                        <div className="text-white flex flex-row gap-x-3 w-full p-2">
                            <button
                                onClick={e => handleCreateEventModDisp(e, false)}
                                className="bg-emerald-500 btn-block p-2 hover:cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="eventForm"
                                className="bg-emerald-800 btn-block p-2 hover:cursor-pointer"
                            >
                                Continue
                            </button>
                        </div>
                    </dialog>
                </div>
            )}
        </>
    );
}

export default EventCreationModal;
