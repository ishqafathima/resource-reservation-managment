// Import tools for dynamic page rendering and database access
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
// Import reservation cancellation and sign-out components
import CancelReservationButton from "./reservations/CancelReservationButton";
import SignOutButton from "./SignOutButton";
// Import authentication and redirect functions
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Disable instant static rendering for this page
export const instant = false;


// Main Dashboard page component
export default async function Dashboard() {
  // Wait for a real request before accessing dynamic data
  await connection();

  // Get the current user's session
  const session = await auth();


  // Redirect users who are not logged in
  if (!session?.user) {
    redirect("/login");
  }

  // Get the user's ID and role
  const user = session.user as typeof session.user & {
  id?: string;
  role?: string;
};

// Fetch the five most recent reservations
  // Admins see all reservations; regular users see their own
const recentReservations = await prisma.reservation.findMany({
  where:
    user.role === "ADMIN"
      ? {}
      : { userId: Number(user.id) },

      // Include resource details for each reservation
    include: {
      resource: true,
    },

    //show newest reservation first
    orderBy: {
      createdAt: "desc",
    },
    take: 5, //limit results to five reservation
  });

  //count all resources
  const totalResources = await prisma.resource.count();
  //count only active resources
  const activeResources = await prisma.resource.count({
    where: { isActive: true },
  });
  //calculate the begining and end of today
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  //count confirmed reservation starting today
  const todaysReservations = await prisma.reservation.count({
    where: {
      startTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: "CONFIRMED",
    },
  });

  //count confiremd reservations starting in the future
  const upcomingBookings = await prisma.reservation.count({
    where: {
      startTime: { gt: today },
      status: "CONFIRMED",
    },
  });

  //prepare dashboard statistics for dispaly
  const stats = [
    {
      label: "Total Resources",
      value: String(totalResources),
      icon: "▦",
    },
    {
      label: "Active Resources",
      value: String(activeResources),
      icon: "✓",
    },
    {
      label: "Today's Reservations",
      value: String(todaysReservations),
      icon: "▣",
    },
    {
      label: "Upcoming Bookings",
      value: String(upcomingBookings),
      icon: "◷",
    },
  ];

  //render the dashboard ui
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      {/* Sidebar with navigation and sign-out button */}
      <aside className="w-full bg-slate-900 p-6 text-white md:min-h-screen md:w-64">
        <h1 className="text-xl font-bold">
          Resource<span className="text-violet-400">Hub</span>
        </h1>

        <p className="mt-2 text-xs text-slate-400">
          Reservation Management
        </p>

  {/* Navigation links */}
<nav className="mt-10 space-y-2">
  {[
    { label: "Dashboard", href: "/" },
    { label: "Resources", href: "/resources" },
    { label: "Reservations", href: "/reservations/all" },
    { label: "Availability", href: "/availability" },
  ].map((item, index) => {
    const isActive = index === 0;

    return (
      <a
        key={item.label}
        href={item.href}
        className={`block rounded-lg px-4 py-3 text-sm ${
          isActive
            ? "bg-violet-600 text-white"
            : "text-slate-300 hover:bg-slate-800"
        }`}
      >
        {["▦", "▣", "◷", "✓"][index]} {item.label}
      </a>
    );
  })}
</nav>

        {/* Help information */}
        <div className="mt-10 rounded-xl bg-slate-800 p-4">
          <p className="text-sm font-semibold">Need help?</p>
          <p className="mt-2 text-xs text-slate-400">
            Manage your shared resources in one place.
          </p>
        </div>
        {/* Reusable sign-out component */}
        <SignOutButton />
      </aside>


       {/* Main dashboard content */}
      <section className="min-w-0 flex-1 p-5 md:p-8">
        {/* Dashboard heading and new reservation link */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Workspace / Overview
            </p>
            <h2 className="mt-1 text-2xl font-bold">Dashboard</h2>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back! Here is your resource overview.
            </p>
          </div>

          <a
  href="/reservations/new"
  className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
>
  + New Reservation
</a>
        </header>

       {/* Display the four statistics cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {stat.label}
                </p>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-lg text-violet-600">
                  {stat.icon}
                </span>
              </div>

              <p className="mt-4 text-3xl font-bold">{stat.value}</p>
            </article>
          ))}
        </div>

         {/* Recent reservations table */}
        <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
            <div>
              <h3 className="font-bold">Recent Reservations</h3>
              <p className="mt-1 text-sm text-slate-500">
                A quick look at resource bookings
              </p>
            </div>

 {/* Link to all reservations */}
<a
  href="/reservations/all"
  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
>
  View all
</a>

          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Resource</th>
                  <th className="px-5 py-4 font-medium">Requester</th>
                  <th className="px-5 py-4 font-medium">Date &amp; Time</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medum ">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentReservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold">
                      {reservation.resource.name}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      Not provided
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                      <div>
                        {new Date(
                          reservation.startTime
                        ).toLocaleDateString()}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        {new Date(
                          reservation.startTime
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {" – "}
                        {new Date(
                          reservation.endTime
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          reservation.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <CancelReservationButton
                      reservationId={reservation.id}
                      status={reservation.status}
                      />
                    </td>
                  </tr>
                ))}
                  {/* Show a message when no reservations exist */}
                {recentReservations.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No reservations yet. Create a reservation to see it here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
           {/* Dashboard footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          ResourceHub · Resource Reservation Management System
        </p>
      </section>
    </main>
  );
}
