const PaymentsPolicy = () => {
    return (
        <main className="p-2 px-4">
            <div className="py-1">
                <h1 className="font-bold text-emerald-900 text-xl">Payments Policy</h1>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Secure payments</h3>
                <p className="text-gray-700 md:w-2/3">
                    All payments on this platform are <span className="font-teal-700 font-semibold">securely processed through a trusted, licensed, enterprise-grade, PCI-DSS compoliant payment processor</span>. 
                    This ensures encrypted card and mobile money transactions, protected settlement routing to ensure <span className="font-teal-700 font-semibold">funds remain safe throughout the 
                        entire process until they are settled to your bank or mobile money account</span>.
                    SwiftPassDigital <span className="font-teal-700 font-semibold">does not store any sensitive</span> payment information.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Payouts to Event Organizers</h3>
                <p className="text-gray-700 md:w-2/3">
                    Event organizers receive <span className="font-teal-700 font-semibold">payouts after two working days (T+2) after each successful ticket sale</span>.
                    Working days exclude weekends and public holidays.
                    For example: a ticket sold on Monday is paid out on Wednesday, as long as it's a working day.
                    Payouts are <span className="font-teal-700 font-semibold">sent directly to the bank account</span> you've linked on your dashboard.
                    <span className="font-teal-700 font-semibold">All payout timelines follow the payment processor's settlement schedule, not SwiftPassDigital's custom timing.</span>
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Platform Commission</h3>
                <p className="text-gray-700 md:w-2/3">
                    SwiftPassDigital charges a <span className="text-neutral-800 font-bold">10% service fee on each ticket sold</span>, by default, unless 
                    state otherwise. There are no hidden charges.
                    This fee covers processing, secure payment handling, infrastructure, and platform services.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Currencies supported</h3>
                <p className="text-gray-700 md:w-2/3">
                    SwiftPassDigital currently support payouts in <span className="font-teal-700 font-semibold">KES for local bank accounts</span> and mobile money accounts. 
                    The payout currency depend on the account you connect in your account settings.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Minimum Payout Amount</h3>
                <p className="text-gray-700 md:w-2/3">
                    The <span className="font-teal-700 font-semibold">minimum payout amount is KES 100</span>. If your balance is below the minimum, it will automatically roll over to the 
                    next payout.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Important Notice</h3>
                <ul className="text-gray-700 md:w-2/3 list-disc px-4">
                    <li>
                        All payments processing for ticket sales are conducted via a licensed third-party payment processor.
                    </li>
                    <li>
                        All payout timelines and settlement rules applied follow the payment processor's official policies.
                    </li>
                    <li>
                        The platform does not accelerate, delay, or otherwise influence the payment processor's settlement schedule.
                    </li>
                    <li>
                        The payment processor is licensed and PCI-DSS compliant. The platform does not store sensitive payments credentials.
                    </li>
                </ul>
            </div>

        </main>
    );
};

export default PaymentsPolicy;




































