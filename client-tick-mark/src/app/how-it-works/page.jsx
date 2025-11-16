const HowItWorks = () => {
    return (
        <main className="p-2 px-4">
            <div className="py-1">
                <h1 className="font-bold text-emerald-900 text-xl">How It Works</h1>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Create an Organizer Account</h3>
                <p className="text-gray-700 md:w-2/3">
                    Set up your organization in seconds, <span className="font-semibold text-gray-800">manage events, tickets and payouts all from one place</span>.
                    You can also invite a staff member with <span className="font-semibold text-gray-800">scan-only access</span> for event day.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Create, Publish Event, and Sell Tickets Easily</h3>
                <p className="text-gray-700 md:w-2/3">
                    Seamlessly <span className="font-semibold text-gray-800">add event details, set ticket tiers(e.g Regular, VIP, Individual, Group), pricing, capacity and 
                        publish events online instantly and become searchable</span> on the platform.
                    They can also <span className="font-semibold text-gray-800">sell tickets easily via sharing the event link</span>.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Customers Discover Events</h3>
                <p className="text-gray-700 md:w-2/3">
                    Users looking for events can; <span className="font-semibold text-gray-800">browse recommended events, use the search bar to find specific events, 
                        view the event details</span> and available ticket types.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Secure Ticket Purchase &amp; Checkout</h3>
                <p className="text-gray-700 md:w-2/3">
                    Buyers choose their ticket, proceed to the secure checkout and pay using preferred, trusted payment method(e.g 
                    <span className="font-semibold text-gray-800">card, mobile money, or bank channels</span>).
                    All <span className="font-semibold text-gray-800">payments are processed by a licensed, highly compliant payment processor</span>, ensuring encryption, safety, and reliability at every step.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Instant Digital Ticket Delivery</h3>
                <p className="text-gray-700 md:w-2/3">
                    After successful payment, <span className="font-semibold text-gray-800">a digital ticket is automatically generated, and QR-code image</span> which is instantly 
                    emailed to the buyer. <span className="font-semibold text-gray-800">QR codes are unique, secure, and validated only once at the venue</span>.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Fast ticket scanning</h3>
                <p className="text-gray-700 md:w-2/3">
                    Tickets can be  <span className="font-semibold text-gray-800">scanned at the event entrance</span>. Event staff or authorized third-party scanners use our secure scanning tool,
                    the <span className="font-semibold text-gray-800">QR code is scanned</span> and <span className="font-semibold text-gray-800">verified in real time</span>. Successfully scanned <span className="font-semibold text-gray-800">tickets change status immediately to prevent reuse</span>. 
                    Only assigned staff can access scanning, they cannot edit events, see finances, or manage organizer details.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Tracking sales &amp; Payouts</h3>
                <p className="text-gray-700 md:w-2/3">
                    Organizers can <span className="font-semibold text-gray-800">manage all events from one dashboard; viewing ticket sales, check-ins, and revenue</span> for each individual event. 
                    <span className="font-semibold text-gray-800">Reports are also generated</span> for each event. Payouts follow the payment processor&apos;s standard two working day schedule.
                </p>
            </div>
        </main>
    );
};

export default HowItWorks;
