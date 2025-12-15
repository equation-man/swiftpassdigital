import Link from "next/link";
import EventsDisp from "@/components/Events/EventsDisp";

export default function Home() {
  return (
    <div>
        {/*BODY*/}
        <div className="p-2 bg-gradient-to-r from-emerald-100 via-emerald-50 via-white-100 to-green-100">
            <div className="flex flex-col md:flex-row md:justify-between items-center gap-x-5">
                <div className="self-end order-2 md:order-1">
                    <p className="text-center text-sm">
                        <Link href="/how-it-works" className="underline text-teal-600 hover:cursor-pointer">See How It Works</Link> | 
                        <Link href="/payments-policy" className="underline text-teal-600 hover:cursor-pointer"> Payments Policy</Link> |  
                        <Link href="/terms-of-service" className="underline text-teal-600 hhover:cursor-pointer"> Terms Of Service</Link>
                    </p>
                    <div className="my-6">
                        <h1 className="text-3xl md:text-6xl font-bold text-gray-900 text-center">
                            Turning <span className="text-emerald-600">seamless experiences</span> into <span className="text-emerald-500">memorable moments</span> that excite
                        </h1>
                    </div>
                    <div className="w-full flex flex-col items-center justify-center gap-x-2 my-4">
                        <h2 className="font-bold text-xl">Available Events</h2>
                        {/*<button className="bg-emerald-800 rounded-full px-4 py-1 text-white">topics</button>*/}
                        <p className="text-sm text-neutral-700 font-semibold">Trending topics</p>
                        <ul className="inline-flex space-x-1 text-gray-600 text-sm">
                            <li>#Sports</li>
                            <li>#Tech</li>
                            <li>#Concerts</li>
                        </ul>
                    </div>
                </div>
                {/*<div className="order-1 md:order-2">
                    <div className="card bg-base-100 image-full w-96 shadow-sm rounded-md hover:cursor-pointer">
                      <figure>
                        <img
                          src="/logo-files/swiftpass-logo-only-svg.svg"
                          alt="Swimmer" />
                      </figure>
                      <div className="card-body">
                        <h1 className="font-bold text-emerald-200">promotion</h1>
                        <h2 className="card-title text-emerald-400">Advertise your product here</h2>
                        <p></p>
                        <div className="card-actions justify-end">
                            <button className="px-4 py-1 bg-green-600 font-semibold rounded-sm hover:cursor-pointer">Get ticket</button>
                        </div>
                      </div>
                    </div>
                </div>*/}
            </div>
            {/*Events List Body*/}
            <div>
                <EventsDisp />
            </div>
        </div>
    </div>
  );
}
