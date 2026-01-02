// Event Creation ticket.
"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { createTicketModalState, addTicketDetails, addDiscountDetails, addTicketItems } from "@/redux/reducers/generalReducer";
import { createTicketFn } from "@/app/event/actions";
import { useMutation } from "@tanstack/react-query";
import { dateTimeToUtc } from "@/lib/helpers";

const CreateTicketModal = ({ eventDetails }) => {
    const fetch_states = useSelector((state) => state.generalModal.create_ticket);
    const fetch_ev_details = useSelector((state) => state.generalModal.event_details);
    const [inputs, setInputs] = useState({ ticket_type: "Regular", ticket_class: "Individual" });
    const [discountState, setDiscountState] = useState(false);

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
        onError: (err) => {
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

        //mutation.mutate(updatedInputs);
        dispatch(addTicketItems(addTicketDetails({
            event_id: fetch_ev_details.event_id,
            base_price: updatedInputs.base_price,
            capacity: updatedInputs.capacity,
            ticket_type: updatedInputs.ticket_type,
            ticket_class: updatedInputs.ticket_class,
            discount_time: updatedInputs.discount_time,
            start_time: updatedInputs.start_time,
            finish_time: updatedInputs.finish_time,
            description: updatedInputs.description,
            discount_rules: {
                name: updatedInputs.name,
                discount_type: updatedInputs.discount_type,
                value: updatedInputs.value,
                start_date: updatedInputs.start_date,
                end_date: updatedInputs.end_date,
                max_users: updatedInputs.max_users,
            } 
        })))
        dispatch(createTicketModalState(false));
    };

    const handleAnotherTicketAdd = async (event) => {
        event.preventDefault();
        const updatedInputs = { ...inputs };
        updatedInputs.capacity = Number(updatedInputs.capacity);
        updatedInputs.event_id = fetch_ev_details.event_id;
        updatedInputs.start_time = dateTimeToUtc(fetch_ev_details.start_time);
        updatedInputs.discount_time = 0;
        //mutation.mutate(updatedInputs);
        dispatch(addTicketItems(addTicketDetails({
            event_id: fetch_ev_details.event_id,
            base_price: updatedInputs.base_price,
            capacity: updatedInputs.capacity,
            ticket_type: updatedInputs.ticket_type,
            ticket_class: updatedInputs.ticket_class,
            discount_time: updatedInputs.discount_time,
            start_time: updatedInputs.start_time,
            finish_time: updatedInputs.finish_time,
            description: updatedInputs.description,
            discount_rules: {
                name: updatedInputs.name,
                discount_type: updatedInputs.discount_type,
                value: updatedInputs.value,
                start_date: updatedInputs.start_date,
                end_date: updatedInputs.end_date,
                max_users: updatedInputs.max_users,
            } 
        })));
        dispatch(createTicketModalState(false));
    }

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
                                    <div className="flex flex-row justify-between w-full gap-x-2">
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
                                    </div>

                                    <div className="flex flex-row items-center">
                                        <div>
                                            <label className="font-medium text-gray-600">
                                                Type
                                            </label>
                                            <select
                                                onChange={handleChange}
                                                name="ticket_type"
                                                className="px-2"
                                                required
                                            >
                                                <option value="">Ticket type</option>
                                                <option value="Regular">Regular</option>
                                                <option vlaue="Discount">Discount</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="font-medium text-gray-600">
                                                Class
                                            </label>
                                            <select
                                                onChange={handleChange}
                                                name="ticket_class"
                                                className="px-2"
                                                required
                                            >
                                                <option value="">Ticket class</option>
                                                <option value="Individual">Individual</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        {inputs.ticket_type == "Discount" && (
                                            <div className="w-full mb-2">
                                                <div>
                                                    <label className="font-medium text-gray-600">
                                                        Discount name
                                                    </label>
                                                    <input
                                                        onChange={handleChange}
                                                        className="input validator w-full h-10"
                                                        name="name"
                                                        type="text"
                                                        placeholder="Discount name"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="font-medium text-gray-600">
                                                        Percentage amount
                                                    </label>
                                                    <input
                                                        onChange={handleChange}
                                                        className="input validator w-full"
                                                        name="value"
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        placeholder="Value(0-100)"
                                                        required
                                                    />
                                                </div>
                                                <div className="w-full">
                                                    <div>
                                                        <label className="font-medium text-gray-600">
                                                            Discount start
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
                                                            Discount end
                                                        </label>
                                                        <input
                                                            onChange={handleChange}
                                                            name="end_date"
                                                            className="input validator w-full"
                                                            type="datetime-local"
                                                            required
                                                        />
                                                    </div>

                                                </div>
                                            </div>
                                        )}
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

                        <div className="w-full p-2">
                            {/*Add modal to the react store and open a new ticket creation modal*/}
                        </div>
                        <div className="text-white flex flex-row gap-x-3 w-full p-2">
                            <button
                                onClick={(e) => handleCreateTicketModDisp(e, false)}
                                className="bg-emerald-500 btn-block p-2 hover:cursor-pointer rounded-sm"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleAnotherTicketAdd}
                                type="submit"
                                form="createTicketForm"
                                className="bg-emerald-800 btn-block p-2 hover:cursor-pointer rounded-sm"
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

export default CreateTicketModal;

