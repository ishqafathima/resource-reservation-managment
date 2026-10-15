
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH updates an existing reservation.
// The reservation ID comes from the URL.
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
     // Checks whether the user is logged in.
  const session = await auth();

   // Rejects requests from unauthenticated users.
  if (!session?.user) {
    return Response.json(
      { message: "Unauthorized." },
      { status: 401 }
    );
  }

  // Reads the user's ID and role from the session.
  const user = session.user as typeof session.user & {
    id?: string;
    role?: string;
  };

  // Converts the session ID to a number.
  const userId = Number(user.id);
  const isAdmin = user.role === "ADMIN"; // Checks whether the logged-in user is an administrator.

  // Regular users must have a valid user ID.
  // Admins are handled separately.
  if (!isAdmin && (!Number.isInteger(userId) || userId <= 0)) {
    return Response.json(
      { message: "Invalid user session." },
      { status: 401 }
    );
  }

  try {
    // Gets the reservation ID from the dynamic URL.
    // Example: /api/reservations/5 gives id = "5".
    const { id } = await context.params;
    const reservationId = Number(id); // Converts the ID string to a number.

    if (!Number.isInteger(reservationId) || reservationId <= 0) {
      return Response.json(
        { message: "Invalid reservation ID." },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
    });

    // Returns an error if the reservation doesn't exist.
    if (!reservation) {
      return Response.json(
        { message: "Reservation not found." },
        { status: 404 }
      );
    }

    // Admins can cancel any reservation.
    // Regular users can cancel only their own reservations.
    if (!isAdmin && reservation.userId !== userId) {
      return Response.json(
        { message: "You can only cancel your own reservations." },
        { status: 403 }
      );
    }

     // Prevents cancelling a reservation more than once.
    if (reservation.status === "CANCELLED") {
      return Response.json(
        { message: "This reservation is already cancelled." },
        { status: 409 }
      );
    }

    // Updates the reservation status in PostgreSQL.
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: "CANCELLED" }, // Keeps the reservation record but marks it as cancelled.
      include: { resource: true },
    });

    // Returns the updated reservation.
    return Response.json(updatedReservation, { status: 200 });
  } catch (error) {
    // Logs unexpected errors for server-side debugging.
    console.error("Failed to cancel reservation:", error);

    // Returns a general error message to the client.
    return Response.json(
      { message: "Failed to cancel reservation." },
      { status: 500 }
    );
  }
}
