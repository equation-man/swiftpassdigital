// Organization Header component
import React from "react";
import Link from "next/link";

const OrgHeader = () => {
    return (
        <div className="p-2">
            <div className="my-2">
                <h1 className="font-bold text-2xl">KCAA</h1>
                <p>Kiambu County Aquatics Association</p>
                <div className="flex flex-row gap-x-2">
                    <button className="text-emerald-700 hover:cursor-pointer font-medium rounded-xs border border-emerald-600 text-xs p-1">
                        <Link href="/organizations/profile">
                            Manage Account
                        </Link>
                    </button>
                    <button className="bg-emerald-700 text-white font-medium text-xs p-1 rounded-xs">
                        Create New Event
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-2 bg-emerald-100 rounded-xs p-1 text-green-7">
                <div>
                    <h3 className="font-semibold"><span className="text-green-800">Total Tickets:</span> 66</h3>
                    <h3 className="font-semibold"><span className="text-green-800">Tickets Sold:</span> 58</h3>
                    <h3 className="font-semibold"><span className="text-green-800">Amount:</span> 58000</h3>
                </div>
                <div>
                    <h3 className="font-semibold"><span className="text-green-800">Payments processing fee:</span> 870</h3>
                    <h3 className="font-semibold"><span className="text-green-800">Service fee:</span> 2900</h3>
                        <h3 className="font-semibold"><span className="text-green-800">Net Total:</span> 54230</h3>
                </div>
            </div>
            <div className="my-2 flex flex-row gap-x-2">
                <h3 className="font-bold text-emerald-800 text-2xl">My Events</h3>
            </div>
        </div>
    );
};

export default OrgHeader;
