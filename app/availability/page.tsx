
import { connection } from "next/server"; // Imports connection() to make the page use request-time data.
import { prisma } from "@/lib/prisma"; // Imports Prisma to communicate with the PostgreSQL database.
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const instant = false;  // This is a custom setting; it is not a standard Next.js route option.


// Defines the query parameters accepted by this page.
// The user selects start and end times in the availability form.
type AvailabilityPageProps = {
  searchParams: Promise<{
    start?: string;
    end?: string;
  }>;
};

export default async function AvailabilityPage({
  searchParams,
}: AvailabilityPageProps) {
    // Ensures request-time information is available.
  await connection();

  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const params = await searchParams;
  const start = params.start ?? "";
  const end = params.end ?? "";

  const startDate = new Date(start);
  const endDate = new Date(end);

  // Checks that both dates exist, are valid,
  // and that the end time is after the start time.
  const hasValidRange =
    start !== "" &&
    end !== "" &&
    !Number.isNaN(startDate.getTime()) &&
    !Number.isNaN(endDate.getTime()) &&
    endDate > startDate;

    // Gets all active resources from the database,
  // sorted alphabetically by name.
  const resources = await prisma.resource.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
   // If the date range is valid, find reservations that overlap it.
  // Otherwise, use an empty array because no valid check can be done.

  const overlappingReservations = hasValidRange
    ? await prisma.reservation.findMany({
        where: {
          startTime: { lt: endDate },
          endTime: { gt: startDate },
        },
        select: {
          resourceId: true,
        },
      })
    : [];

     // Creates a Set of resource IDs that have overlapping reservations.
  const reservedResourceIds = new Set(
    overlappingReservations.map(
      (reservation) => reservation.resourceId
    )
  );
 rendering the page
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-medium text-cyan-400">
          RESOURCEHUB
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Resource Availability
        </h1>

        <p className="mt-2 text-slate-400">
          Select a date and time to check which resources are free.
        </p>

        <form
          action="/availability"
          method="GET"
          className="mt-8 grid gap-4 rounded-xl border border-slate-800 bg-slate-900 p-5 sm:grid-cols-3"
        >
          <div>
            <label
              htmlFor="start"
              className="mb-2 block text-sm text-slate-300"
            >
              Start date and time
            </label>
            <input
              id="start"
              name="start"
              type="datetime-local"
              required
              defaultValue={start}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
            />
          </div>

          <div>
            <label
              htmlFor="end"
              className="mb-2 block text-sm text-slate-300"
            >
              End date and time
            </label>
            <input
              id="end"
              name="end"
              type="datetime-local"
              required
              defaultValue={end}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Check Availability
            </button>
          </div>
        </form>

        {start !== "" && end !== "" && !hasValidRange && (
          <p className="mt-4 text-sm text-red-400">
            Please select a valid start and end time. The end must be
            after the start.
          </p>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => {
            const isReserved = reservedResourceIds.has(resource.id);

            return (
              <div
                key={resource.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold">
                    {resource.name}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      !hasValidRange
                        ? "bg-slate-800 text-slate-300"
                        : isReserved
                          ? "bg-red-500/10 text-red-400"
                          : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {!hasValidRange
                      ? "Not checked"
                      : isReserved
                        ? "Reserved"
                        : "Available"}
                  </span>
                </div>

                <p className="mt-3 text-sm text-slate-400">
                  Type: {resource.type}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Location: {resource.location}
                </p>

                <p className="mt-4 text-sm text-slate-300">
                  {resource.description || "No description available."}
                </p>

                {hasValidRange && !isReserved && (
                  <a
                    href={`/reservations/new?resourceId=${resource.id}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`}
                    className="mt-5 inline-block rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
                  >
                    Make a Reservation
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {resources.length === 0 && (
          <p className="mt-8 rounded-xl border border-slate-800 p-6 text-slate-400">
            No active resources are available.
          </p>
        )}
      </div>
    </main>
  );
}
