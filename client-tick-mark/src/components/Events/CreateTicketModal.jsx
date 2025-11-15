// Event Creation ticket.
"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { createTicketModalState } from "@/redux/reducers/generalReducer";
import { createTicketFn } from "@/app/event/actions";
import { useMutation } from "@tanstack/react-query";
import { dateTimeToUtc } from "@/lib/helpers";

const CreateTicketModal = ({ eventDetails }) => {
    const fetch_states = useSelector((state) => state.generalModal.create_ticket);
    const fetch_ev_details = useSelector((state) => state.generalModal.event_details);
    const [inputs, setInputs] = useState({});

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs((values) => ({ ...values, [name]: value }));
    };

    const dispatch = useDispatch();

    const handleCreateTicketModDisp = (e, state) => {
        e.preventDefault();
        dispatch(createTicketModalState(state));
    };

    const mutation = useMutation({
        mutationKey: ["createTicket"],
        mutationFn: (inputs) => createTicketFn(inputs),
        onSuccess: () => {
            toast.success("Success! Ticket created.", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            });
            dispatch(createTicketModalState(false));
        },
        onError: () => {
            toast.error("Ticket creation failed");
        },
    });

    const handleTicketSubmission = async (event) => {
        event.preventDefault();

        const updatedInputs = { ...inputs };

        updatedInputs.capacity = Number(updatedInputs.capacity);
        updatedInputs.event_id = fetch_ev_details.event_id;
        updatedInputs.start_time = dateTimeToUtc(fetch_ev_details.start_time);
        updatedInputs.finish_time = dateTimeToUtc(fetch_ev_details.finish_time);
        updatedInputs.discount_time = 0;

        mutation.mutate(updatedInputs);
    };

    return (
        <>
            {fetch_states && (
                <div className="flex justify-center items-center fixed z-50 inset-0 backdrop-blur-sm">
                    <dialog className="relative bg-neutral-50 w-96 py-6 mx-2 flex flex-col items-center shadow-lg rounded-sm">
                        <div className="flex flex-col items-center justify-center">
                            <h3 className="font-bold text-gray-700 text-md">Create event ticket</h3>
                            <h1 className="text-lg font-semibold">
                                {fetch_ev_details.event_title}
                            </h1>
                            <h1 className="font-bold text-lg">{eventDetails?.title}</h1>

                            <div className="px-2">
                                <form id="createTicketForm" onSubmit={handleTicketSubmission}>
                                    <div>
                                        <label className="font-medium text-gray-600">
                                            Ticket Price
                                        </label>
                                        <input
                                            onChange={handleChange}
                                            name="base_price"
                                            min="0"
                                            className="input validator w-full"
                                            type="number"
                                            required
                                            placeholder="Ticket price"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-medium text-gray-600">
                                            Number of Tickets
                                        </label>
                                        <input
                                            onChange={handleChange}
                                            name="capacity"
                                            min="1"
                                            className="input validator w-full"
                                            type="number"
                                            required
                                            placeholder="No of tickets"
                                        />
                                    </div>

                                    <div>
                                        <label className="font-medium text-gray-600">
                                            Select ticket type
                                        </label>
                                        <select
                                            onChange={handleChange}
                                            name="ticket_type"
                                            className="px-2"
                                        >
                                            <option value="Regular">Regular</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="font-medium text-gray-600">
                                            Select ticket class
                                        </label>
                                        <select
                                            onChange={handleChange}
                                            name="ticket_class"
                                            className="px-2"
                                        >
                                            <option value="Individual">Individual</option>
                                        </select>
                                    </div>

                                    <div>
                                        <textarea
                                            onChange={handleChange}
                                            name="description"
                                            rows="7"
                                            className="input validator w-full"
                                            required
                                            placeholder="Ticket description. Give a brief description for the ticket"
                                        ></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="text-white flex flex-row gap-x-3 w-full p-2">
                            <button
                                onClick={(e) => handleCreateTicketModDisp(e, false)}
                                className="bg-emerald-500 btn-block p-2 hover:cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                form="createTicketForm"
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
};

export default CreateTicketModal;

