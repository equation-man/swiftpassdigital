// Event payment modal.
"use client";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updatePaymentModalState } from "@/redux/reducers/generalReducer";
import { singleTicketInfoFn } from "@/app/event/actions";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types/types";

// Defining props for this component.
type PaymentModalProps = {
    ticketId: string;
    evendDetails: Event;
}

const TicketPaymentModal = ({ ticketId, eventDetails }: PayemntModalProps) => {
    const fetch_states = useSelector((state) => state.generalModal.payment);
    const [inputs, setInputs] = useState();

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => ({...values, [name]:value}));
    }

    const dispatch = useDispatch();
    const handlePaymentModDisp = (e, state) => {
        e.preventDefault();
        dispatch(updatePaymentModalState(state))
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ['ticket', ticketId],
        queryFn: () => singleTicketInfoFn(ticketId),
        onSuccess: () => {
        },
        onError: () => {
        }
    });

    const handleContactSubmission = async (event) => {
        event.preventDefault();
    }

    return (
        <>
            {fetch_states && (
                <div className="flex justify-center items-center fixed z-50 inset-0 backdrop-blur-sm">
                    <dialog className="relative bg-neutral-50 w-96 py-6 mx-2 flex flex-col items-center shadow-lg rounded-sm">
                        <div className="flex flex-col items-center justify-center">
                            <h3 className="font-bold text-gray-700 text-md">Payments and Contact details</h3>
                            <h1 className="font-bold text-lg">{eventDetails?.title}</h1>
                            <p className="text-emerald-800 font-bold text-xl">{data?.base_price}</p>
                            <p className="text-emerald-600 font-medium">{data?.ticket_class} {data?.ticket_type}</p>
                            <div>
                                <form id="contactForm" onSubmit={handleContactSubmission}>
                                    <div>
                                        <label className="font-medium text-gray-600">Email</label>
                                        <input onChange={handleChange} id="user_email" name="user_email" className="input validator w-full" type="email" required placeholder="mail@gmail.com" />
                                    </div>
                                    <div>
                                        <label className="font-medium text-gray-600">Phone</label>
                                        <input onChange={handleChange} id="user_contact" name="user_contact" className="input validator w-full" type="text" required placeholder="Phone no."/>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div className="text-white flex flex-row gap-x-3 w-full p-2">
                            <button
                                onClick={e => handlePaymentModDisp(e, false)}
                                className="bg-emerald-500 btn-block p-2 hover:cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="contactForm"
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

export default TicketPaymentModal;
