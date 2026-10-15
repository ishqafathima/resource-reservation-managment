
import "dotenv/config"; //Load environment variables from .env
import { hash } from "bcryptjs"; // Used to hash passwords securely
import { PrismaPg } from "@prisma/adapter-pg"; // Connect Prisma to PostgreSQL
import { PrismaClient } from "../app/generated/prisma/client";
import { createInterface } from "node:readline/promises"; // Used to get input from the terminal
import { stdin, stdout } from "node:process";

async function main() {

    //create a terminal input interface
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    //get regular user details from the terminal
    const name = (await rl.question("User name: ")).trim();
    const email = (
      await rl.question("User email: ")
    ).trim().toLowerCase();
    const password = await rl.question("User password: ");

    //validate required fields and password length
    if (!name || !email || password.length < 12) {
      throw new Error(
        "Name and email are required. Use a password of at least 12 characters."
      );
    }

    //get the databse connection URL from .env
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is missing from .env.");
    }

    //create a prisma client connected to postgresql
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });

    try {
        //check whether the email already exists
      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        throw new Error(
          "That email already exists. No account was changed."
        );
      }

      //create a regular user account and hash the password
      await prisma.user.create({
        data: {
          name,
          email,
          password: await hash(password, 12),
          role: "USER",
        },
      });

      console.log("Regular user account created successfully.");
    } finally {
        //close the database connection
      await prisma.$disconnect();
    }
  } finally {
    //close the terminal input interface
    rl.close();
  }
}

//Handle erros and report failure
main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "User setup failed."
  );
  process.exitCode = 1;
});
