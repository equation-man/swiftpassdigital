"use client";

import Events from "@/components/Events/Events";
import Search from "@/components/Search/Search";
import { useState } from "react";

const EventsDisp = () => {
    const [searchState, setSearchState] = useState(null);
    const [inputs, setInputs] = useState({ searchQuery: "" });

    const handleChange = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setInputs((values) => ({ ...values, [name]: value }));
    };

    const handleSearchClick = (event) => {
        event.preventDefault();
        setSearchState(inputs);
    };

    const clearSearch = () => {
        setSearchState(null);
        setInputs({ searchQuery: "" });
    };

    return (
        <div>
            {/* SEARCH EVENTS */}
            <div className="relative mx-auto w-full">
                <form className="flex items-center w-full">
                    <label
                        htmlFor="default-search"
                        className="mb-2 text-sm font-medium text-neutral-400 sr-only"
                    >
                        Search
                    </label>

                    <input
                        onChange={handleChange}
                        type="search"
                        id="searchQuery"
                        name="searchQuery"
                        className="block w-full p-[0.7rem] ps-10 text-sm text-neutral-600 rounded-md bg-neutral-50 focus:outline-emerald-400 
                        focus:ring-0 focus:border-emerald-400"
                        placeholder="Search event, venue or topic"
                        required
                    />

                    {searchState ? (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="btn-sm text-neutral-500 bg-neutral-50 hover:bg-gray-200 m-2 p-1 hover:cursor-pointer
                            focus:ring-1 focus:outline-none focus:ring-focus-400 font-medium rounded-sm text-sm absolute right-0 top-0 mt-[0.35rem] mr-[0.35rem]"
                        >
                            Terminate
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSearchClick}
                            className="btn-sm text-neutral-500 bg-neutral-50 hover:bg-gray-200 m-2 hover:cursor-pointer
                            focus:ring-1 focus:outline-none focus:ring-focus-400 font-medium rounded-sm text-sm absolute right-0 top-0 mt-[0.36rem] mr-[0.36rem]"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={26}
                                height={26}
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314"
                                ></path>
                            </svg>
                        </button>
                    )}
                </form>
            </div>

            {/* Events body */}
            {searchState ? <Search itms={searchState} /> : <Events />}
        </div>
    );
};

export default EventsDisp;

