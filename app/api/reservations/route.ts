
import { auth } from "@/auth"; // Imports authentication to identify the logged-in user.
import { prisma } from "@/lib/prisma";

// GET: Fetches reservations from the database.
export async function GET() {
  const session = await auth();

  // Only logged-in users can access reservations.
  if (!session?.user) {
    return Response.json(
      { message: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
      // Gets the user's ID and role from the session.
    const user = session.user as typeof session.user & {
      id?: string;
      role?: string;
    };

    // Makes sure the user ID exists.
    if (!user.id) {
      return Response.json(
        { message: "User ID not found." },
        { status: 401 }
      );
    }

    // Admins can see all reservations.
    // Regular users can see only their own reservations.
    const reservations = await prisma.reservation.findMany({
      where:
        user.role === "ADMIN"
          ? {}
          : { userId: Number(user.id) },
          // Includes resource details with each reservation.
      include: {
        resource: true,
      },
      // Sorts reservations by start time, earliest first.
      orderBy: {
        startTime: "asc",
      },
    });

    return Response.json(reservations);
    // Returns the reservations as JSON.
  } catch (error) {
    console.error("Failed to fetch reservations:", error);

    return Response.json(
      { message: "Failed to fetch reservations." },
      { status: 500 }
    );
  }
}

// POST: Creates a new reservation.
export async function POST(request: Request) {
    // Checks whether the user is logged in.
  const session = await auth();

  if (!session?.user) {
    return Response.json(
      { message: "Unauthorized." },
      { status: 401 }
    );
  }

   // Reads the logged-in user's ID from the session.
  const user = session.user as typeof session.user & {
    id?: string;
  };

  const userId = Number(user.id);

  // Rejects missing or invalid user IDs.
  if (!Number.isInteger(userId) || userId <= 0) {
    return Response.json(
      { message: "Invalid user session." },
      { status: 401 }
    );
  }

  try {
    // Reads the reservation details sent by the frontend.
    const body = await request.json();

    // Accepts a string title and removes extra spaces.
    const title =
      typeof body.title === "string" ? body.title.trim() : "";

      // Converts the resource ID and selected times to usable values.
    const resourceId = Number(body.resourceId);
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);

    // Checks that a title and a positive integer resource ID exist.
    if (
      !title ||
      !Number.isInteger(resourceId) ||
      resourceId <= 0
    ) {
      return Response.json(
        { message: "A title and valid resource are required." },
        { status: 400 }
      );
    }

    // Checks that both times are valid and the end is after the start.
    if (
      typeof body.startTime !== "string" ||
      typeof body.endTime !== "string" ||
      !Number.isFinite(startTime.getTime()) ||
      !Number.isFinite(endTime.getTime()) ||
      endTime <= startTime
    ) {
      return Response.json(
        { message: "Please provide valid start and end times." },
        { status: 400 }
      );
    }

    // Checks that the selected resource exists.
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

     // Reservations cannot be created for missing or inactive resources.
    if (!resource || !resource.isActive) {
      return Response.json(
        { message: "Resource not found or inactive." },
        { status: 404 }
      );
    }

    // Searches for an existing CONFIRMED reservation
    // that overlaps the requested time for this resource.
    const overlappingReservation =
      await prisma.reservation.findFirst({
        where: {
          resourceId,
          status: "CONFIRMED",
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      });

      // Prevents booking a resource during a conflicting reservation.
    if (overlappingReservation) {
      return Response.json(
        {
          message:
            "This resource is already reserved during the selected time.",
        },
        { status: 409 }
      );
    }

    // Creates the reservation in PostgreSQL.
    const reservation = await prisma.reservation.create({
      data: {
        title,
        resourceId,
        startTime,
        endTime,
        status: "CONFIRMED",
        userId,
      },
      include: {
        resource: true,
      },
    });

    return Response.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Failed to create reservation:", error);

    // Returns a general error response to the frontend.
    return Response.json(
      { message: "Failed to create reservation." },
      { status: 500 }
    );
  }
}
