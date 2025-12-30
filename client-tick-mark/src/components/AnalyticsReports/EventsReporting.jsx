"use client"
const EventsReport = ({report}) => {
  return (
    <main className="my-4">
      <div className="mb-1">
        <h3 className="text-xl font-bold text-emerald-800 pb-1">Earnings Summary</h3>
        <div className="stats shadow-lg bg-white/40 border-white/10 backdrop-blur-lg w-full">
          <div className="stat">
            <div className="stat-title">Total tickets available</div>
            <div className="stat-value">{report?.tickets_available}</div>
            <div className="stat-desc">of {report?.ticket_supply}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Net Earnings in KES</div>
            <div className="stat-value">{report?.net_sales_amount}</div>
            <div className="stat-desc">{report?.service_fees} service fees</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 items-center justify-center my-4">
        {/*TICKETS*/}
        <div>
          <h3 className="text-xl font-bold text-emerald-800 pb-1">Tickets Sold</h3>
          <div className="stats stats-vertical lg:stats-horizontal shadow-xl bg-white/40 border-white/10 backdrop-blur-lg">
            <div className="stat">
              <div className="stat-title">Regular Tickets</div>
              <div className="stat-value">{report?.regular_tickets}</div>
              <div className="stat-desc">Sold</div>
            </div>

            <div className="stat">
              <div className="stat-title">Discounted Tickets</div>
              <div className="stat-value">{report?.discounted_tickets}</div>
              <div className="stat-desc">Sold</div>
            </div>

            <div className="stat">
              <div className="stat-title">Total Tickets</div>
              <div className="stat-value">{report?.total_tickets}</div>
              <div className="stat-desc">Sold</div>
            </div>
          </div>
        </div>
        {/*SALES*/}
        <div>
          <h3 className="text-xl font-bold text-emerald-800 pb-1">Sales Value</h3>
          <div className="stats stats-vertical lg:stats-horizontal shadow bg-white/40 border-white/10 backdrop-blur-lg">
            <div className="stat">
              <div className="stat-title">Regular Sales Value</div>
              <div className="stat-value">{report?.regular_sales_amount}</div>
              <div className="stat-desc">KES</div>
            </div>

            <div className="stat">
              <div className="stat-title">Discounted Sales Value</div>
              <div className="stat-value">{report?.discounted_sales_amount}</div>
              <div className="stat-desc">KES</div>
            </div>

            <div className="stat">
              <div className="stat-title">Total Sales Value</div>
              <div className="stat-value">{report?.total_sales_amount}</div>
              <div className="stat-desc">KES</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
};

export default EventsReport;
