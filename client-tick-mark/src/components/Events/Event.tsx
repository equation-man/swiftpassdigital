// Event component.
import React from "react";

const Event = () => {
    return (
        <div className="carousel-item">
            <div className="card bg-base-100 w-70 shadow-sm">
              <figure>
                <img
                  src="/football.jpg"
                  alt="football" />
              </figure>
              <div className="card-body">
                <h2 className="card-title">
                    Level 1 swimming championship
                </h2>
                <div className="text-gray-600">
                    <p className="text-xs">#swimming</p>
                </div>
                <p>Kiambu county swimming championship at mpesa foundation academy.</p>
                <div className="card-actions justify-between items-center">
                    <div className="text-emerald-600">
                        <p className="flex flex-row items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 1024 1024">
                                <path fill="currentColor" d="M800 416a288 288 0 1 0-576 0c0 118.144 94.528 272.128 288 456.576C705.472 688.128 800 534.144 800 416M512 960C277.312 746.688 160 565.312 160 416a352 352 0 0 1 704 0c0 149.312-117.312 330.688-352 544"></path>
                                <path fill="currentColor" d="M512 512a96 96 0 1 0 0-192a96 96 0 0 0 0 192m0 64a160 160 0 1 1 0-320a160 160 0 0 1 0 320"></path>
                            </svg>
                            Mpesa Foundation Academy
                        </p>
                        <p>
                            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24">
                                <g fill="none">
                                    <rect width={18} height={15} x={3} y={6} stroke="currentColor" rx={2} strokeWidth={1}></rect>
                                    <path fill="currentColor" d="M3 10c0-1.886 0-2.828.586-3.414S5.114 6 7 6h10c1.886 0 2.828 0 3.414.586S21 8.114 21 10z"></path>
                                    <path stroke="currentColor" strokeLinecap="round" d="M7 3v3m10-3v3" strokeWidth={1}></path>
                                </g>
                            </svg>
                            <span className="text-gray-700 font-medium text-sm">From</span>7:00 a.m Sat, aug 6 2025 <span className="text-gray-700 font-medium text-sm">to</span> 5:00 p.m Sunday, aug 7 2025
                        </p>
                    </div>
                    <button className="px-4 py-1 bg-green-600 font-semibold rounded-sm hover:cursor-pointer text-white">Get ticket</button>
                </div>
              </div>
            </div>
        </div>
    );
}
export default Event;
