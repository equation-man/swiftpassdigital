const TermsOfService = () => {
    return (
        <main className="p-2 px-4">
            <div className="py-1">
                <h1 className="font-bold text-emerald-900 text-xl">Terms of Service</h1>
                <p className="text-gray-700 md:w-2/3">Welcome to SwiftPassDigital. By using our services, you agree to the following terms and conditions.</p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Account Setup and Responsibility</h3>
                <p className="text-gray-700 md:w-2/3">
                    Organizers must <span className="font-teal-700 font-semibold">provide accurate and up-to-date information</span> when creating an account. 
                    SwiftPassDigital is not liable for unauthorized access or losses resulting from incorrect account or payment setup.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Payment Processing</h3>
                <p className="text-gray-700 md:w-2/3">
                    All payments are <span className="font-teal-700 font-semibold">processed by a licensed, PCI-compliant payment provider</span>. Organizers must ensure <span className="font-teal-700 font-semibold">bank or mobile money accounts are 
                        properly linked</span>. SwiftPassDigital is not responsible for delays, errors, or failures in payment processing caused by the payment processor.
                </p>
                <p className="text-gray-700 md:w-2/3">
                    Payouts follow the payment processor&apos;s settlement schedule, typically two working days after the sale.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Event Creation and Ticketing</h3>
                <p className="text-gray-700 md:w-2/3">
                    Organizers must <span className="font-teal-700 font-semibold">provide accurte event information</span>, including date, venue, pricing, and capacity.
                    Tickets are generated digitally and may include a QR code for entry validation. Organizers are responsible for ensuring the event can 
                    proceed as advertised.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Event Cancellation</h3>
                <p className="text-gray-700 md:w-2/3">
                    If an event is cancelled, organizers must communicate promptly with ticket holders. 
                    SwiftPassDigital currently doesn't support facilitating refunds and does not assume liability for cancelled events.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Third Party Access</h3>
                <p className="text-gray-700 md:w-2/3">
                    Organizers can grant limited access to staff or third party personnel for ticket scanning only. 
                    <span className="font-teal-700 font-semibold">Third party users are restricted from modifying event details</span>, accessing financial information, or
                    managing payouts. Organizers are responsible for any actions performed by third party users they 
                    authorize.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Fees and Commissions</h3>
                <p className="text-gray-700 md:w-2/3">
                    The platform charges a <span className="font-teal-700 font-semibold">10% service fee on each ticket sold</span>. This fee is automatically deducted before payouts are processed. 
                    Organizers are responsible for ensuring that pricing accounts for platform fees.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Security and Liability</h3>
                <p className="text-gray-700 md:w-2/3">
                    SwiftPassDigital <span className="font-teal-700 font-semibold">implements industry-standard security measures, but cannot guarantee against all security breaches</span>. 
                    Organizers are responsible for maintaining secure credentials and payment details. The platform is not liable for losses 
                    resulting from fraudlent activity, unauthorized access, or misconfigured payment accounts.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">User Conduct</h3>
                <p className="text-gray-700 md:w-2/3">
                    Organizers must comply with all applicable laws and regulations.
                    Ticket buyers must <span className="font-teal-700 font-semibold">use tickets responsibly</span> and cannot resell or distribute tickets in violation of platform rules. 
                    The platform reserves the <span className="font-teal-700 font-semibold">right to suspend accounts</span> for misuse, fraud, or violation of these terms.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Limitation of Liability</h3>
                <p className="text-gray-700 md:w-2/3">
                    The platform provides tools and servivices "as is", and is <span className="font-teal-700 font-semibold">not liable for direct, indirect, or consequential damages 
                        arising from ticket sales, event cancellations, payment delays, or user actions.</span> 
                    Liability is limited to the amount actually paid to the organizer via the platform for the affected transactions.
                </p>
            </div>
            <div className="py-2">
                <h3 className="py-1 font-semibold text-emerald-600">Modifications</h3>
                <p className="text-gray-700 md:w-2/3">
                    SwiftPassDigital reserves the <span className="font-teal-700 font-semibold">right to modify these terms of service at any time</span>. Updates will be posted on the platform, and 
                    continued use constitutes acceptance of the new terms.
                </p>
            </div>
        </main>
    );
};

export default TermsOfService;























