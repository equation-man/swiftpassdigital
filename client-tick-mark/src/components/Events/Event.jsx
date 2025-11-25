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
      <div className="card bg-base-100 w-70 shadow-sm rounded-sm">
        <figure>{/* Images will appear here */}</figure>
        <div className="card-body">
          <h2 className="card-title">{evnt.title}</h2>
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
              <div>
                <p className="text-xs">
                  <span className="text-gray-700 font-medium">From</span>{" "}
                  <ClientOnly>
                    <EventDate iso={evnt.start_date} />
                  </ClientOnly>
                </p>
                <p className="text-xs">
                  <span className="text-gray-700 font-medium">To</span>{" "}
                  <ClientOnly>
                    <EventDate iso={evnt.finish_date} />
                  </ClientOnly>
                </p>
              </div>
            </div>
          </div>

          {dispAct && session?.user?.user?.org_email && (
            <div className="bg-emerald-100 rounded-xs text-green-7 mt-2">
              <div className="bg-emerald-700 w-full">
                <h3 className="font-semibold text-emerald-50 p-1">Report</h3>
              </div>
              <div className="p-1">
                <h3 className="font-semibold">
                  <span className="text-green-800">Total Tickets:</span>{" "}
                  {data?.total_tickets}
                </h3>
                <h3 className="font-semibold">
                  <span className="text-green-800">Tickets Sold:</span>{" "}
                  {data?.tickets_sold}
                </h3>
                <h3 className="font-semibold">
                  <span className="text-green-800">Total sales:</span>{" "}
                  {data?.total_sales/100}
                </h3>
                <h3 className="font-semibold text-teal-700">
                  <span className="text-green-800">Service &amp; trans fee:</span>{" "}
                  {data?.service_fee + (data?.total_sales/100) * 0.029}
                </h3>
                <h3 className="font-semibold">
                  <span className="text-green-800">Net Total:</span>{" "}
                  {/*data?.net_total*/}
                  {(data?.total_sales/100) - (data?.total_sales/100) * 0.029}
                </h3>
              </div>
            </div>
          )}

          <button
            onClick={showEvent}
            className="px-4 py-1 bg-emerald-800 font-semibold rounded-sm hover:cursor-pointer text-white"
          >
            View{dispAct && <span>/Scan</span>} tickets
          </button>

          {dispAct && (
            <div className="w-full mt-2">
              <div className="flex flex-row items-center gap-x-2 w-full">
                <button
                  onClick={(e) => showDelBtn(e, true)}
                  className="btn btn-block bg-white-600 border border-rose-600 text-rose-600 px-4 py-1 font-semibold rounded-sm hover:cursor-pointer"
                >
                  Delete Event
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

