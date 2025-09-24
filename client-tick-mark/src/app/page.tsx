import Events from "@/components/Events/Events";


export default function Home() {
  return (
    <div>
        {/*BODY*/}
        <div className="p-2 bg-gradient-to-r from-emerald-100 via-emerald-50 via-white-100 to-green-100">
            <div className="flex flex-col md:flex-row md:justify-between items-center gap-x-5">
                <div className="self-end order-2 md:order-1">
                    <div className="my-4">
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
                            Seamless <span className="text-emerald-600">ticketing</span> that empowers <span className="text-emerald-500">organizers</span> and <span className="text-emerald-700">delights fans</span>
                        </h1>
                    </div>
                    {/*SEARCH EVENTS"*/}
                    <div className="relative mx-auto w-full">
                      <form className="flex items-center w-full">
                        <label
                          htmlFor="default-search"
                          className="mb-2 text-sm font-medium text-neutral-400 sr-only"
                        >Search</label>
                        <input
                          type="search"
                          id="searchQuery"
                          name="searchQuery"
                          className=" block w-full p-[0.7rem] ps-10 text-sm text-neutral-600 rounded-md bg-neutral-50 focus:outline-emerald-400 
                          focus:ring-0 focus:border-emerald-400"
                          placeholder="Search event, venue or topic"
                          required
                        />
                        <button
                            className="btn-sm text-neutral-500 bg-neutral-50 hover:bg-gray-200 m-2 hover:cursor-pointer
                          focus:ring-1 focus:outline-none focus:ring-focus-400 font-medium rounded-sm text-sm absolute right-0 top-0 mt-[0.35rem] mr-[0.35rem]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 24 24">
                              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314"></path>
                            </svg>
                        </button>
                      </form>
                    </div>
                </div>
                <div className="order-1 md:order-2">
                    <div className="card bg-base-100 image-full w-96 shadow-sm rounded-md hover:cursor-pointer">
                      <figure>
                        <img
                          src="/swimmer.jpg"
                          alt="Swimmer" />
                      </figure>
                      <div className="card-body">
                        <h1 className="font-bold text-emerald-200">promoted</h1>
                        <h2 className="card-title text-emerald-400">Kiambu Level 1 swimming championship</h2>
                        <p>Level 1 swimming championship at mpesa foundation from 7 am on saturday.</p>
                        <div className="card-actions justify-end">
                            <button className="px-4 py-1 bg-green-600 font-semibold rounded-sm hover:cursor-pointer">Get ticket</button>
                        </div>
                      </div>
                    </div>
                </div>
            </div>
            {/*Events List*/}
            <div className="flex flex-row items-center gap-x-2 my-4">
                <h2 className="font-bold text-lg">Trending</h2>
                <button className="bg-emerald-800 rounded-full px-4 py-1 text-white">topics</button>
                <ul className="inline-flex space-x-1 font-semibold text-gray-600">
                    <li>#Sports</li>
                    <li>#Tech</li>
                    <li>#Concerts</li>
                </ul>
            </div>
            <div>
                <Events />
            </div>
        </div>
    </div>
  );
}
