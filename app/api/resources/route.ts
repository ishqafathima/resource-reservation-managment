
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetches resources from the database.
export async function GET() {
  const session = await auth();

   // Only logged-in users can access this API.
  if (!session?.user) {
    return Response.json(
      { message: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
     // Retrieves all resources, newest first.
    const resources = await prisma.resource.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Sends the resource list to the frontend as JSON.
    return Response.json(resources);
  } catch (error) {
    console.error("Failed to fetch resources:", error);

    return Response.json(
      { message: "Failed to fetch resources." },
      { status: 500 }
    );
  }
}

// POST: Creates a new resource.
export async function POST(request: Request) {
  // Checks whether the user is logged in.
  const session = await auth();

  if (!session?.user) {
    return Response.json(
      { message: "Unauthorized." },
      { status: 401 }
    );
  }

  // Reads the user's role from the session.
 const user = session.user as typeof session.user & { role?: string };

  // Only administrators are allowed to create resources.
if (user.role !== "ADMIN") {
    return Response.json(
      { message: "Forbidden. Admin access required." },
      { status: 403 }
    );
  }

  try {
    // Reads the resource details sent by the frontend.
    const body = await request.json();

    // Validates the name and removes extra spaces.
    const name =
      typeof body.name === "string" ? body.name.trim() : "";
      // Validates the type and removes extra spaces.
    const type =
      typeof body.type === "string" ? body.type.trim() : "";

       // Both name and type are required.
    if (!name || !type) {
      return Response.json(
        { message: "Resource name and type are required." },
        { status: 400 }
      );
    }

    // Creates a new resource in the PostgreSQL database.
    const resource = await prisma.resource.create({
      data: {
        name,
        type,
        // Saves the location if provided; otherwise stores null
        location:
          typeof body.location === "string"
            ? body.location.trim() || null
            : null,
        description:
          typeof body.description === "string"
            ? body.description.trim() || null
            : null,
            // Other fields, such as isActive and timestamps,
        // can use the defaults defined in your Prisma schema.
      },
    });

     // Returns the created resource with HTTP 201.
    return Response.json(resource, { status: 201 });
  } catch (error) {
    // Logs errors on the server.
    console.error("Failed to create resource:", error);

    return Response.json(
      { message: "Failed to create resource." },
      { status: 500 }
    );
  }
}
