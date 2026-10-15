
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import ReservationForm from "./ReservationForm";

// This is a project-specific export, not a standard Next.js
// route configuration option. Check whether your project needs it.
export const instant = false;


// Defines the page for creating a new reservation.
// "async" allows us to use await to get the session.
export default async function NewReservationPage() {
  await connection();

  //checks the current session
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <ReservationForm />
    </main>
  );
}
