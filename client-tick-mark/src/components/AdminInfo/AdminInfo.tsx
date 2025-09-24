/// Admin info 
import React from "react";

const AdminInfo = () => {
    return (
        <div>
            <div>
                <h1 className="font-bold text-xl text-gray-700">Admin Panel</h1>
                <h3 className="font-semibold text-lg">KCAA</h3>
                <p>Kiambu swimming organization.</p>
                <div>
                    <button className="bg-emerald-700 text-white px-2 py-1 rounded-sm text-sm flex flex-row items-center gap-x-1">
                        Add wallet
                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                            <path fill="currentColor" d="M19 12a1 1 0 0 1 1-1h.01a1 1 0 1 1 0 2H20a1 1 0 0 1-1-1"></path>
                            <path fill="currentColor" fillRule="evenodd" d="M18.6 4H3.4A2.4 2.4 0 0 0 1 6.4v11.2A2.4 2.4 0 0 0 3.4 20h15.2a2.4 2.4 0 0 0 2.4-2.4V16h.4a2.6 2.6 0 0 0 2.6-2.6v-2.8A2.6 2.6 0 0 0 21.4 8H21V6.4A2.4 2.4 0 0 0 18.6 4m-2 6a.6.6 0 0 0-.6.6v2.8a.6.6 0 0 0 .6.6h4.8a.6.6 0 0 0 .6-.6v-2.8a.6.6 0 0 0-.6-.6z" clipRule="evenodd"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div className="pt-5">
                <div>
                    <div className="flex flex-row gap-x-2">
                        <h3 className="font-bold text-gray-600 text-lg">Access</h3>
                        <button
                            className="bg-white text-emerald-700 px-1 text-xs rounded-sm flex flex-row gap-x-1 items-center hover:cursor-pointer border border-emerald-700"
                        >
                            Add access
                            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                                <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2m5 11h-4v4h-2v-4H7v-2h4V7h2v4h4z"></path>
                            </svg> 
                        </button>
                    </div>
                </div>
                <div>
                    No access granted
                </div>
            </div>
        </div>
    );
}

export default AdminInfo
