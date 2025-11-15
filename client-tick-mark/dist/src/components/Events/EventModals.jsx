// Event payment modal.
"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import { useSelector, useDispatch } from "react-redux";
import { updatePaymentModalState } from "@/redux/reducers/generalReducer";
import { singleTicketInfoFn, mpesaTicketPurchaseFn } from "@/app/event/actions";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/helpers";
const TicketPaymentModal = ({ ticketId, eventDetails }) => {
    const fetch_states = useSelector((state) => state.generalModal.payment);
    const [inputs, setInputs] = useState();
    const [phone, setPhone] = useState("");
    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs(values => (Object.assign(Object.assign({}, values), { [name]: value })));
    };
    const dispatch = useDispatch();
    const handlePaymentModDisp = (e, state) => {
        e.preventDefault();
        dispatch(updatePaymentModalState(state));
    };
    const { data, isLoading, error } = useQuery({
        queryKey: ['ticket', ticketId],
        queryFn: () => singleTicketInfoFn(ticketId),
        enabled: !!ticketId && fetch_states,
        onSuccess: () => {
        },
        onError: () => {
        }
    });
    const router = useRouter();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: ['purchaseOrder'],
        mutationFn: (orderInputData) => mpesaTicketPurchaseFn(orderInputData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
            toast.success("Ticket payment being processed...", {
                iconTheme: {
                    primary: "#ecfdf5",
                    secondary: "#047857",
                },
            });
            // Redirect to ticket page with query params of reference, ticket_id dynamic url.
            window.location.href = data.authorization_url;
            //router.push(`/verify/${data.ticket_id}?reference=${data.paystack_reference}`)
            //console.log("The mutation for payment data is", data);
            dispatch(updatePaymentModalState(false));
        },
        onError: (err) => {
            console.log("The error during ticket purchase is", err);
            router.push(`/verify/failed`);
            toast.error("Ticket payment confirmation failed.");
            dispatch(updatePaymentModalState(false));
        }
    });
    const handleContactSubmission = async (event) => {
        event.preventDefault();
        inputs.user_contact = phone;
        const payload = { orderDet: inputs, ticketId: ticketId };
        mutation.mutate(payload);
    };
    return (<>
            {fetch_states && (<div className="flex justify-center items-center fixed z-50 inset-0 backdrop-blur-sm">
                    <dialog className="relative bg-neutral-50 w-96 py-6 mx-2 flex flex-col items-center shadow-lg rounded-sm">
                        <div className="flex flex-col items-center justify-center">
                            <h3 className="font-bold text-gray-700 text-md">Ticket payment and contact details</h3>
                            <h1 className="font-bold text-lg text-center">{eventDetails === null || eventDetails === void 0 ? void 0 : eventDetails.title}</h1>
                            <p className="text-emerald-800 font-bold text-xl text-center">{formatCurrency(data === null || data === void 0 ? void 0 : data.base_price)}</p>
                            <p className="text-emerald-600 font-medium text-center">{data === null || data === void 0 ? void 0 : data.ticket_class} {data === null || data === void 0 ? void 0 : data.ticket_type}</p>
                            <div className="px-2">
                                <form id="contactForm" onSubmit={handleContactSubmission}>
                                    <div>
                                        <label className="font-medium text-gray-600">Email(Ticket delivered here)</label>
                                        <input onChange={handleChange} id="user_email" name="user_email" className="input validator w-full" type="email" required placeholder="mail@gmail.com"/>
                                    </div>
                                    <div className="w-full">
                                        <label className="font-medium text-gray-600">Phone contact (with country code)</label>
                                        <PhoneInput country={"ke"} value={phone} onChange={setPhone} inputClass="!w-full" inputProps={{
                name: "user_contact",
                required: true,
            }}/>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <div>
                            {mutation.isPending && (<div className="flex flex-row items-center justify-center text-emerald-600 gap-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24">
                                        <rect width={6} height={14} x={1} y={4} fill="currentColor">
                                            <animate id="SVGBoZ3Ab9F" fill="freeze" attributeName="y" begin="0;SVG0XJl4OCs.end-0.25s" dur="0.75s" values="1;5"></animate>
                                            <animate fill="freeze" attributeName="height" begin="0;SVG0XJl4OCs.end-0.25s" dur="0.75s" values="22;14"></animate>
                                            <animate fill="freeze" attributeName="opacity" begin="0;SVG0XJl4OCs.end-0.25s" dur="0.75s" values="1;0.2"></animate>
                                        </rect>
                                        <rect width={6} height={14} x={9} y={4} fill="currentColor" opacity={0.4}>
                                            <animate fill="freeze" attributeName="y" begin="SVGBoZ3Ab9F.begin+0.15s" dur="0.75s" values="1;5"></animate>
                                            <animate fill="freeze" attributeName="height" begin="SVGBoZ3Ab9F.begin+0.15s" dur="0.75s" values="22;14"></animate>
                                            <animate fill="freeze" attributeName="opacity" begin="SVGBoZ3Ab9F.begin+0.15s" dur="0.75s" values="1;0.2"></animate>
                                        </rect>
                                        <rect width={6} height={14} x={17} y={4} fill="currentColor" opacity={0.3}>
                                            <animate id="SVG0XJl4OCs" fill="freeze" attributeName="y" begin="SVGBoZ3Ab9F.begin+0.3s" dur="0.75s" values="1;5"></animate>
                                            <animate fill="freeze" attributeName="height" begin="SVGBoZ3Ab9F.begin+0.3s" dur="0.75s" values="22;14"></animate>
                                            <animate fill="freeze" attributeName="opacity" begin="SVGBoZ3Ab9F.begin+0.3s" dur="0.75s" values="1;0.2"></animate>
                                        </rect>
                                    </svg>
                                    <span className="text-sm">Processing payment! Wait a minute...</span>
                                </div>)}
                            {mutation.isError && (<p className="text-rose-500">Error! Failed processing ticket</p>)}
                        </div>
                        <div className="text-white flex flex-row gap-x-3 w-full p-2">
                            <button onClick={e => handlePaymentModDisp(e, false)} className="bg-emerald-500 btn-block p-2 hover:cursor-pointer" disabled={mutation.isPending}>
                                Cancel
                            </button>
                            <button type="submit" form="contactForm" className="bg-emerald-800 btn-block p-2 hover:cursor-pointer" disabled={mutation.isPending}>
                                Continue
                            </button>
                        </div>
                    </dialog>
                </div>)}
        </>);
};
export default TicketPaymentModal;
