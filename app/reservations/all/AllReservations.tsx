import Link from "next/link";
import CancelReservationButton from "../CancelReservationButton";

type Reservation = {
    id: number,
    title:string,
    startTime:Date,
    endTime:Date,
    status:string;
    resource: {
        name: string;
    };
};

type Props = {
    reservations: Reservation[];
};

export default function AllReservations({
    reservations,
}:Props) {
    return(
        <main className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        All Reservations
                    </h1>
                    <p className="mt-2 text-slate-500">
                        View and manage all resource reservations.
                    </p>
                    </div>


<div className="flex gap-3">
  <Link
    href="/reservations/new"
    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
  >
    + New Reservation
  </Link>
</div>

                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                 <div className="border-b border-slate-200 px-6 py-6">
                    <h2 className="font-semibold text-slate-900">
                        Reservation List
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Total reservations: {reservations.length}
                    </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                  <th className="px-6 py-4 font-medium">Title</th>
                                  <th className="px-6 py-4 font-medium">Resource</th>
                                  <th className="px-6 py-4 font-medium">Start Time</th>
                                  <th className="px-6 py-4 font-medium">End Time</th>
                                  <th className="px-6 py-4 font-medium">Status</th>
                                  <th className="px-6 py-4 font-medium">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y  divide-slate-100">
                                {reservations.length === 0 ? (
                                    <tr>
                                        <td
                                        colSpan={6}
                                        className="px-6 py-10 text-center text-slate-500">
                                            No reservation found.
                                        </td>
                                    </tr>
                                ): (
                                    reservations.map((reservation) => (
                                        <tr
                                        key={reservation.id}
                                        className="hover:bg-slate-50">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {reservation.title}
                                            </td>

                                            <td className="px-6 py-4 text-slate-600">
                                                {reservation.resource.name}
                                            </td>

                                            <td className="px-6 py-4 text-slate-600">
                                                {new Date(reservation.endTime).toLocaleString()}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold $ {
                                                    reservation.status === "CONFIRMED"
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-slate-100 text-slate-600"
                                                }`} >
                                                    {reservation.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <CancelReservationButton
                                                reservationId={reservation.id}
                                                status={reservation.status} />
                                            </td>
                                        </tr>
                                    ))
                                )
                                    }
                            </tbody>
                        </table>
                        </div>
                </div>
            </div>
        </main>
    );
}
