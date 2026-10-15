import { NextResponse } from "next/server"; // NextResponse lets us send JSON responses with HTTP status codes.
import bcrypt from "bcryptjs"; // bcryptjs securely hashes passwords before they are saved.
import { prisma } from "@/lib/prisma"; // Imports the Prisma client used to access PostgreSQL.


// Handles POST requests sent to /api/register.
export async function POST(request: Request) {
  try {
     // Reads the data sent by the registration form.
    const body = await request.json();

    // Checks that the name is a string and removes extra spaces.
    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    // Reads the password without trimming it,because spaces can be part of a password.
      const password =
      typeof body.password === "string" ? body.password : "";

      // Makes sure all required fields have been provided.
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    // Prevents names longer than 100 characters.
    if (name.length > 100) {
      return NextResponse.json(
        { message: "Name must be 100 characters or fewer." },
        { status: 400 }
      );
    }


    // Checks the basic email format and maximum email length.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Requires the password to contain between 8 and 72 characters.
    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        { message: "Password must be between 8 and 72 characters." },
        { status: 400 }
      );
    }

    // Searches the database for an account with this email.
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // Prevents duplicate accounts with the same email.
    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hashes the password using bcrypt with a cost factor of 12.
    // The original plain-text password is not saved in the database.
    const hashedPassword = await bcrypt.hash(password, 12);

    // Creates the new user record in PostgreSQL.
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        // The database schema should assign the default USER role.
        // The API deliberately does not accept a role from the user.
      },
    });

    return NextResponse.json(
      { message: "Account created successfully. You can now sign in." },
      { status: 201 }
    );
  } catch (error) {
    // Also handle a duplicate-email race condition safely.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    //logs unexpected errors for debuggging on the server
    console.error("Registration failed:", error);

    // Sends a generic error response to the frontend.
    return NextResponse.json(
      { message: "Unable to create your account. Please try again." },
      { status: 500 }
    );
  }
}
