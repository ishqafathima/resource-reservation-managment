"use client"; //use browser features, React state, and click events.

import { useState} from "react";

type Props = {
    reservationId: number;  //id of the reservation of the cancel
    status: string; //current status of the reservation
};

export default function CancelReservationButton({
    reservationId,
    status,
}: Props) {
    //tracks whether cancellation request in progress
    const [loading, setLoading] = useState(false);
    //stores an error message if cancellation fails
    const [message, setMessage] = useState("");

    async function handleCancel() {
        const confirmed=window.confirm(
            "Are you sure you want to cancel this reservation? "
        );

        // If the user chooses Cancel in the confirmation dialog,
        // stop without sending a request to the backend.
        if(!confirmed) return;

        setLoading(true);
        setMessage("");

        try{
            const response=await fetch(
                `/api/reservations/${reservationId}`,
                {method: "PATCH"}
            );

            const data = await response.json();

            if(!response.ok)
            {
                setMessage(data.message || "Failed to cacel reservation.");
                return;
            }


            // Reloads the current page to show the updated reservation.
            window.location.reload();
        } catch {
            setMessage("Something went wrong. please try again. ");
        }finally {
            // Stops the loading state after the request finishes.
            setLoading(false);
        }
    }

    // Only confirmed reservations can be cancelled.
    // Other statuses display "Unavailable" instead of a button.
    if (status !== "CONFIRMED")
    {
        return < span className="text-xs text-slate-400">Unavailable</span>;
    }


    return(
        <div>
            <button
            onClick={handleCancel}
            disabled={loading}
            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 ">
                {loading ? "Cancelling..." : "Cancel"}
            </button>

            {message && (
                <p className="mt-2 max-w-40 text-xs text-red-600">
                    {message}
                </p>
            )}
        </div>
    );
}
