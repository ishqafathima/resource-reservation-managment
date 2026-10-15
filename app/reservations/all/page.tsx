import { connection } from "next/server"; // Imports connection() to make this page use dynamic rendering.
import { prisma } from "@/lib/prisma"; // Imports the shared Prisma client to communicate with PostgreSQL.
import AllReservations from "./AllReservations";// Imports the component that displays the reservations on the screen.
import { auth } from "@/auth"; // Imports auth() to get the currently logged-in user's session.
import { redirect } from "next/navigation";// Imports redirect() to send users to another page.

export const instant = false; //configures the pages rendering behavior in this proejct

// This is an asynchronous server component.
// It loads reservation data before rendering the component.
export default async function AllReservationsPage() {

    // Ensures this page waits for a request before continuing
  // with request-dependent work.
  await connection();

  // Gets information about the currently logged-in user.
  const session = await auth();


  //if nobody is logged in redirect them to the login page
  if (!session?.user) {
    redirect("/login");
  }

  // Gets the user's session information and allows us to
  // access the user's ID and role in TypeScript.
  const user = session.user as typeof session.user & {
    id?: string;
    role?: string;
  };

  //if user id is missing redirect to the login page
  if (!user.id) {
    redirect("/login");
  }

  //retrieves reservation form the database
  const reservations = await prisma.reservation.findMany({

    where:
      user.role === "ADMIN"
        ? {}
        : { userId: Number(user.id) },
         // Also retrieves each reservation's related resource details,
    // such as the resource name and location.
    include: {
      resource: true,
    },
    //sorts reservations by start time, earliest first
    orderBy: {
      startTime: "asc",
    },
  });

   // Passes the retrieved reservations to the component
  // that displays them in the user interface.
  return <AllReservations reservations={reservations} />;
}
