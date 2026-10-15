"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Defines the shape of a resource returned by the API.
// This helps TypeScript check the resource data.
type ResourceOption = {
    id: number;
    name: string;
    type: string;
    isActive: boolean;
};

export default function ReservationForm()
{
     const router = useRouter();
    const searchParams = useSearchParams();
    // Reads optional values from the URL.
    // Example: /reservations/new?resourceId=1&start=...&end=...
    // The empty string is used when a parameter is missing.
    const selectedResource = searchParams.get("resourceId") ?? "";
const selectedStart = searchParams.get("start") ?? "";
const selectedEnd = searchParams.get("end") ?? "";

    // Stores the available resources fetched from the API.
    const [resources, setResources] = useState<ResourceOption[] > ([]);
    const [title, setTitle] = useState("");
    const [resourceId, setResourceId] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [loadingResources, setLoadingResources] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Runs when the component loads and when the URL selections change.
    // It retrieves the available resources from the backend.
useEffect(() => {
    async function loadResources() {
        try {
            const response = await fetch("/api/resources");

            if (!response.ok) {
                throw new Error("Unable to load resources.");
            }

            const data: ResourceOption[] = await response.json();
            const activeResources = data.filter(
                (resource) => resource.isActive
            );

            setResources(activeResources);



            if (
                selectedResource &&
                activeResources.some(
                    (resource) => String(resource.id) === selectedResource
                )
            ) {
                setResourceId(selectedResource);
            }

            if (selectedStart) {
                setStartTime(selectedStart);
            }

            if (selectedEnd) {
                setEndTime(selectedEnd);
            }
        } catch {
            setError("Could not load resources. Please refresh the page.");
        } finally {
            setLoadingResources(false);
        }
    }

    // Calls the function that fetches the resources.
    loadResources();
    // Re-run the effect when any of these URL values changes.
}, [selectedResource, selectedStart, selectedEnd]);



// Runs when the user submits the reservation form.
    async function handleSubmit(event: React.FormEvent<HTMLFormElement>)
    {
        // Prevents the browser from reloading the entire page.
        event.preventDefault();
         // Clears old messages before validating the new submission.
        setError("");
        setSuccess("");

         // checking that every required value has been provided.
        if(!title.trim() || !resourceId || !startTime || !endTime)
        {
            setError("Please complete all fields. ");
            return;
        }

        const start = new Date (startTime);
        const end = new Date (endTime);

        //checks whether both dtes represents valid times
        if(Number.isNaN(start.getTime()) || Number.isNaN (end.getTime()))
        {
            setError("Please enter valid dates and time. ");
            return;
        }

         //reservation must start in the future
        if(start <= new Date())
        {
            setError("The reservation must start in the future. ");
            return;
        }

        //end time must be later than the start time
        if(end <= start)
        {
            setError("The end time must be after the start time. ");
            return;
        }

        //disabled submit button while sending the request
        setSubmitting(true);

        try {
            //sends reservation details to the backed api
            const response = await fetch("/api/reservations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    resourceId: Number(resourceId),
                    startTime: start.toISOString(),
                    endTime: end.toISOString(),

                }),
            });

             //reads the response returned by the api
            const result = await response.json();

            //if api rejects the request, display its error message
            if(!response.ok)
            {
                throw new Error(result.message || "Failed to create reservation. ");
            }

            setSuccess("Reservation created successfully! ");
            //clear the form
            setTitle("");
            setResourceId("");
            setStartTime("");
            setEndTime("");
        }catch(err)
        {
            setError(
                err instanceof Error
                ? err.message
                : "Something went wrong. Please try again"
            );
        }finally{
            setSubmitting(false);
        }
    }

    return (
       <div className="mx-auto max-w-2xl">
        <div className="mb-8" >
            <p className="text-sm text-slate-500">
                Dashboard / Reservations / New
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Create Reservation
            </h1>
            <p className="mt-2 text-slate-500">
                Choose a resource and schedule your reservation.
            </p>
        </div>

        <form
           onSubmit={handleSubmit}
           className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm:p-8">
            <div>
                <label
                   htmlFor="title"
                   className="mb-2 block text-sm font-semibold text-slate-700">
                    Reservation Title
                   </label>
                   <input
                   id="title"
                   type="text"
                   value={title}
                   onChange={(event) => setTitle(event.target.value)}
                   placeholder="e.g. Team Meeting"
                   required

                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"></input>

            </div>

            <div>
                <label
                htmlFor="resource"
                className="mb-2 block text-sm font-semibold text-slate-700">
                    Select Resource
                </label>

<select
  id="resource"
  value={resourceId}
  onChange={(event) => setResourceId(event.target.value)}
  required
  disabled={loadingResources}
  className={`w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 ${
    resourceId === "" ? "text-slate-400" : "text-black"
  }`}
>
  <option value="" disabled>
    {loadingResources ? "Loading resources..." : "Choose a resource"}
  </option>

  {resources.map((resource) => (
    <option
      key={resource.id}
      value={resource.id}
      className="text-black"
    >
      {resource.name} - {resource.type}
    </option>
  ))}
</select>


                {!loadingResources && resources.length === 0 && (
                    <p className="mt-2 text-sm text-amber-700">
                        No active resources are available. Add a resource first.
                    </p>
                )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <label
                    htmlFor="startTime"
                    className="mb-2 block text-sm font-semibold text-slate-700">
                        Start Date &amp; Time
                    </label>
                    <input
                    id="startTime"
                    type="datetime-local"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"/>

                </div>

                <div>
                    <label
                    htmlFor="endTime"
                    className="mb-2 block text-sm font-semibold text-slate-700">
                        End Date &amp; Time
                    </label>
                    <input
                      id="endTime"
                      type="datetime-local"
                      value={endTime}
                      onChange={(event) => setEndTime(event.target.value)}
                      required
                      className="w-full rounded-lg border border-slate-300 px-3 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" />

                </div>
            </div>

            {error && (
                <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}

            {success && (
                <div
                role="status"
                className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">
                    <p className="font-semibold">{success}</p>
                    <button
                    type="button"
                    onClick={ () => {
                        router.push("/");
                        router.refresh();
                    }}
                    className="mt-3 font-semibold underline">
                        Return to Dashboard
                    </button>
                </div>
            )}

            <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5" >
              <button
              type="submit"
              disabled={submitting || loadingResources || resources.length === 0}
              className="rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">
                {submitting ? "Creating..." : "Create Reservation"}
            </button>

            <button
            type="button"
            onClick={ () => router.push("/")}
            className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
            </button>
            </div>
           </form>
       </div>

    );
}
