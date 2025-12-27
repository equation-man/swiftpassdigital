// Event component.
"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { deleteModalState } from "@/redux/reducers/generalReducer";
import { formatDateTime } from "@/lib/helpers";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { deleteEventFn, fetchReportFn } from "./actions";
import { EventDate, ClientOnly } from "@/components/Events/EventDateTime";
import ShareButton from "@/components/ShareButton/ShareButton";

const Event = ({ evnt }) => {
  const { data: session } = useSession();
  const [confirmDel, setConfirmDel] = useState(false);

  const showDelBtn = (e, val) => {
    e.preventDefault();
    setConfirmDel(val);
  };

  const router = useRouter();
  const showEvent = (event) => {
    event.preventDefault();
    router.push(`/event/${evnt.event_id}`);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["report", evnt.event_id],
    queryFn: () => fetchReportFn(evnt.event_id),
  });
  console.log("The events report data is", data)

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationKey: ["delEvent"],
    mutationFn: (eventData) => deleteEventFn(eventData.event_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["MyEvents"] });
      toast.success("Item deleted successfully!", {
        iconTheme: {
          primary: "#ecfdf5",
          secondary: "#047857",
        },
      });
    },
    onError: (err) => {
      toast.error("Failed deleting the event, try again!");
    },
  });

  const handleDelEvent = (event) => {
    event.preventDefault();
      mutation.mutate({ event_id: evnt.event_id});
    setConfirmDel(false);
  };

  const dispAct =
    session?.user?.user?.organization_id === evnt.owner_id && session?.user?.user?.org_email;

  return (
    <div className="carousel-item">
      <div className="card bg-base-100 w-70 shadow-lg rounded-sm">
        <figure>{/* Images will appear here */}</figure>
        <div className="card-body">
          <h2 className="card-title">{evnt.title}</h2>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-green-800 to-transparent my-3"></div>
          <div className="text-gray-600 flex flex-row items-center">
            <p className="text-xs">#{evnt.event_tag}</p>
            <ShareButton
              title="Enjoy efficient events on SwiftPassDigital"
              shareUrl={`https://swiftpassdigital.com/event/${evnt.event_id}`}
              message={`Grab your ticket for ${evnt.title}`}
            />
          </div>
          <p>{evnt.description}</p>
          <div className="card-actions justify-between items-center">
            <div className="text-emerald-600">
              <p className="flex flex-row items-center text-green-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  viewBox="0 0 1024 1024"
                >
                  <path
                    fill="currentColor"
                    d="M800 416a288 288 0 1 0-576 0c0 118.144 94.528 272.128 288 456.576C705.472 688.128 800 534.144 800 416M512 960C277.312 746.688 160 565.312 160 416a352 352 0 0 1 704 0c0 149.312-117.312 330.688-352 544"
                  ></path>
                  <path
                    fill="currentColor"
                    d="M512 512a96 96 0 1 0 0-192a96 96 0 0 0 0 192m0 64a160 160 0 1 1 0-320a160 160 0 0 1 0 320"
                  ></path>
                </svg>
                {evnt.venue}
              </p>
              <div className="flex gap-x-1 text-green-800">
                <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth={1.5}>
                        <path d="M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z"></path>
                        <path strokeLinecap="round" d="m9 9l4 4m3-5l-5 5"></path>
                    </g>
                </svg>
                <p className="text-xs">
                  <ClientOnly>
                    <EventDate iso={evnt.start_date} />
                  </ClientOnly>
                  <span className="text-neutral-800 font-semibold"> to </span>
                  <ClientOnly>
                    <EventDate iso={evnt.finish_date} />
                  </ClientOnly>
                </p>
              </div>
            </div>
          </div>
          {!dispAct && (
            <button
              onClick={showEvent}
              className="btn btn-block px-4 py-1 bg-emerald-800 font-semibold rounded-sm hover:cursor-pointer text-white w-full flex flex-row items-center gap-x-2 hover:bg-emerald-500"
            >
              View tickets
            </button>
          )}

          {dispAct && (
            <div className="w-full mt-2">
              <div className="w-full my-1">
                <button
                  onClick={showEvent}
                  className="btn btn-block px-4 py-1 bg-emerald-800 font-semibold rounded-sm hover:cursor-pointer text-white w-full flex flex-row items-center gap-x-2 hover:bg-emerald-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                      <path fill="currentColor" d="M23.76 2.003c0-.808-.655-1.464-1.463-1.464H1.809a1.467 1.467 0 1 0-.204 2.927a.25.25 0 0 1 .204.244v14.146a.244.244 0 0 1-.195.244a.98.98 0 0 0 .195 1.95h9.269c.134 0 .243.11.243.245v.302a.24.24 0 0 1-.107.205a1.463 1.463 0 1 0 1.678 0a.24.24 0 0 1-.107-.205v-.302c0-.135.109-.244.244-.244h9.268a.98.98 0 0 0 .195-1.951a.244.244 0 0 1-.195-.244V3.69a.254.254 0 0 1 .205-.243a1.46 1.46 0 0 0 1.258-1.444m-3.414 15.853c0 .134-.11.244-.244.244H4.005a.244.244 0 0 1-.244-.244V3.71c0-.135.109-.244.244-.244h16.097c.134 0 .244.11.244.244Z"></path>
                      <path fill="currentColor" d="M8.882 16.148c.006.402.33.727.732.732h9.268a.732.732 0 0 0 0-1.463h-.732a.244.244 0 0 1-.243-.244v-4.39a.976.976 0 0 0-.976-.976h-.976a.975.975 0 0 0-.975.976v4.39c0 .135-.11.244-.244.244h-.976a.244.244 0 0 1-.244-.244V13.71a.976.976 0 0 0-.975-.976h-.976a.976.976 0 0 0-.975.976v1.463c0 .135-.11.244-.244.244h-.732a.74.74 0 0 0-.732.731m1.22-5.121a2.23 2.23 0 0 0-.976-1.951L7.302 7.905a.3.3 0 0 1-.127-.244a.303.303 0 0 1 .293-.293h1.658a.976.976 0 0 0 .976-.975a.976.976 0 0 0-.8-.976a.25.25 0 0 1-.195-.195a.976.976 0 0 0-.976-.8a.976.976 0 0 0-.956.849a.224.224 0 0 1-.185.205C5.303 5.81 4.612 7.847 5.747 9.14q.2.228.453.394l1.795 1.19c.105.063.166.18.156.303a.303.303 0 0 1-.293.292H6.2a.976.976 0 0 0-.976.976c-.008.477.33.89.8.976c.098.02.174.097.195.195a.98.98 0 0 0 .976.8a.976.976 0 0 0 .975-.84a.23.23 0 0 1 .186-.204a2.224 2.224 0 0 0 1.746-2.195"></path>
                  </svg>
                  Sales Report
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-1 w-full">
                {/*Event editing*/}
                <button
                  className="btn px-4 py-1 bg-white-600 border border-emerald-800 rounded-sm hover:cursor-pointer text-emerald-800 flex flex-row items-center justify-center gap-x-2 hover:bg-emerald-800 hover:text-emerald-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24">
                      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                          <path strokeDasharray={20} strokeDashoffset={20} d="M3 21h18">
                              <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="20;0"></animate>
                          </path>
                          <path strokeDasharray={48} strokeDashoffset={48} d="M7 17v-4l10 -10l4 4l-10 10h-4">
                              <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.2s" dur="0.6s" values="48;0"></animate>
                          </path>
                          <path strokeDasharray={8} strokeDashoffset={8} d="M14 6l4 4">
                              <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="8;0"></animate>
                          </path>
                      </g>
                      <path fill="currentColor" fillOpacity={0} d="M14 6l4 4L21 7L17 3Z">
                          <animate fill="freeze" attributeName="fill-opacity" begin="1.1s" dur="0.5s" values="0;1"></animate>
                      </path>
                  </svg>
                </button>
                {/*Delete event*/}
                <button
                  onClick={(e) => showDelBtn(e, true)}
                  className="btn bg-white-600 border border-rose-600 text-rose-600 px-4 py-1 font-semibold rounded-sm hover:cursor-pointer hover:bg-rose-600 hover:text-rose-50 justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width={28} height={28} viewBox="0 0 24 24">
                      <path fill="currentColor" fillRule="evenodd" d="m6.774 6.4l.812 13.648a.8.8 0 0 0 .798.752h7.232a.8.8 0 0 0 .798-.752L17.226 6.4h1.203l-.817 13.719A2 2 0 0 1 15.616 22H8.384a2 2 0 0 1-1.996-1.881L5.571 6.4zM9.5 9h1.2l.5 9H10zm3.8 0h1.2l-.5 9h-1.2zM4.459 2.353l15.757 2.778a.5.5 0 0 1 .406.58L20.5 6.4L3.758 3.448l.122-.69a.5.5 0 0 1 .579-.405m6.29-1.125l3.94.695a.5.5 0 0 1 .406.58l-.122.689l-4.924-.869l.122-.689a.5.5 0 0 1 .579-.406z"></path>
                  </svg>
                </button>
              </div>

              {confirmDel && (
                <div className="mt-2 text-center">
                  <h1 className="text-rose-600 text-sm">
                    Are you sure you want to delete this event?
                  </h1>
                  <p className="text-xs text-rose-400">
                    Event with booked tickets can't be deleted
                  </p>
                  <button
                    onClick={(e) => showDelBtn(e, false)}
                    className="btn-block bg-emerald-600 text-white py-1 mb-1 hover:cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelEvent}
                    className="btn-block bg-rose-600 text-white py-1 hover:cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Event;

