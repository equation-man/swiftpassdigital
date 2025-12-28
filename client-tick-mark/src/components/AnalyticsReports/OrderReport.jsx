// Singel Order Report.
"use client";

const OrderReport = ({ order }) => {
  return (
    <main>
      <div className="flex w-full border border-emerald-500 rounded-md p-2 justify-between">
        <div className="flex flex-col justify-center">
          <h4 className="font-semibold text-neutral-700">Code</h4>
          <p className="text-xs">{order?.entrance_code}</p>
        </div>
        <div className="flex flex-col justify-center">
          <h4 className="font-semibold text-neutral-700">Status</h4>
          <p className="text-xs">{order?.ticket_status}</p>
        </div>
        <div className="flex flex-col justify-center">
          <h4 className="font-semibold text-neutral-700">Amount</h4>
          <p className="text-xs">{order?.ticket_price}</p>
        </div>
        {/*Button goes here*/}
        <button
          className="btn bg-emerald-600 text-white"
        >
          Check
        </button>
      </div>
    </main>
  )
};

export default OrderReport;
