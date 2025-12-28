// Analytics and reporting page
"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { fetchReportFn } from "@/components/Events/actions";
import { EventDate, ClientOnly } from "@/components/Events/EventDateTime";
import EventsReport from "@/components/AnalyticsReports/EventsReporting";
import OrderReport from "@/components/AnalyticsReports/OrderReport";


const EventOrdersReportsPage = () => {
    const params = useParams();
    const { data, isLoading, error } = useQuery({
        queryKey: ["report", params.event_id],
        queryFn: () => fetchReportFn(params.event_id),
    });

    const router = useRouter();
    const showEventTickets = (event) => {
      event.preventDefault();
      router.push(`/event/${params.event_id}`);
    };

    return (
        <div className="py-4">
          <div className="px-4 mb-2">
            <h1 className="font-bold text-3xl">Activity &amp; Reporting</h1>
          </div>
          <div className="px-4">
            <h3 className="text-emerald-600 font-bold text-lg">{data?.target_event?.title}</h3>
            <div className="text-emerald-600 flex gap-x-2 items-center">
              <p className="flex flex-row items-center text-green-800 text-xs">
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
                {data?.target_event?.venue}
              </p> | 
              <p className="text-xs text-emerald-700">#{data?.target_event?.event_tag}</p> | 
              <div className="flex gap-x-1 text-green-800 items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24">
                    <g fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth={1.5}>
                        <path d="M2.5 12c0-4.478 0-6.718 1.391-8.109S7.521 2.5 12 2.5c4.478 0 6.718 0 8.109 1.391S21.5 7.521 21.5 12c0 4.478 0 6.718-1.391 8.109S16.479 21.5 12 21.5c-4.478 0-6.718 0-8.109-1.391S2.5 16.479 2.5 12Z"></path>
                        <path strokeLinecap="round" d="m9 9l4 4m3-5l-5 5"></path>
                    </g>
                </svg>
                <p className="text-xs">
                  <ClientOnly>
                    <EventDate iso={data?.target_event?.start_date} />
                  </ClientOnly>
                  <span className="text-neutral-800 font-semibold"> to </span>
                  <ClientOnly>
                    <EventDate iso={data?.target_event?.finish_date} />
                  </ClientOnly>
                </p>
              </div>
            </div>
          </div>
          {/*TICKETS*/}
          <div className="px-4 py-2 md:w-90">
            <button
              onClick={showEventTickets}
              className="bg-teal-700 text-white p-2 rounded-sm btn btn-block flex items-center gap-x-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 1024 1024">
                  <path fill="currentColor" d="M33.935 942.336c.336 0 .72 0 1.088-.031c16.193-.529 26.4-13.088 27.777-29.216C63.888 901.217 95.775 614 544.048 614.305l1.008 183.664c0 12.368 7.12 23.664 18.335 28.944c11.088 5.312 24.432 3.68 33.968-4.224l414.976-343.776a31.86 31.86 0 0 0 11.681-24.784c-.032-9.6-4.336-18.687-11.776-24.752L597.28 88.817c-9.569-7.807-22.785-9.311-33.937-4.095c-11.152 5.311-18.288 16.56-18.288 28.91l-1.008 179.633c-185.952 5.887-329.968 65.712-423.328 174.96C-31.217 646 2.69 904.385 4.287 915.137c2.368 15.68 13.872 27.199 29.649 27.199zm543.121-392.527h-.063c-320.208.192-442.591 108.32-512.464 203.824c10.224-76.496 40.064-168.72 105.008-244.031c86.336-100.096 225.44-152.848 407.536-152.848c17.68 0 32-14.32 32-32V180.978l332.433 273.344l-332.448 275.904v-148.4a31.95 31.95 0 0 0-9.409-22.656a31.96 31.96 0 0 0-22.592-9.36z"></path>
              </svg>
              Ticket Actions
            </button>
          </div>
          {/*REPORTING*/}
          <div className="bg-emerald-50 p-4 my-4">
            <EventsReport report={data} />
          </div>

          {/*ORDER LISTS*/}
          <div className="px-4 pt-2">
            <h3 className="font-bold text-2xl">Ticket orders records</h3>
            <div className="stats">
              <div className="stat flex items-center">
                <div className="flex items-end">
                  <div className="stat-value"><span className="text-2xl">{data?.orders_record.length}</span></div>
                  <div className="stat-desc"><span className="text-xs">Records</span></div>
                </div>
                <div className="flex items-end">
                  <div className="stat-value"><span className="text-2xl">{data?.checked_tickets}</span></div>
                  <div className="stat-desc"><span className="text-xs">Checked</span></div>
                </div>
              </div>
            </div>
            <div>
              {data?.orders_record?.map((order) => {
                return (
                  <div key={order.order_id}>
                    <OrderReport order={order}/>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
    );
};

export default EventOrdersReportsPage;
