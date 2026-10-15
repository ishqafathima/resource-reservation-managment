
import "dotenv/config"; //Load environment variables from .env
import { hash } from "bcryptjs"; //Used to hash passwords securely
import { PrismaPg } from "@prisma/adapter-pg"; //connecting Prisma to postgreSQL
import { PrismaClient } from "../app/generated/prisma/client";
import { createInterface } from "node:readline/promises"; //used to get input from the trerminal
import { stdin, stdout } from "node:process";

async function main() {

    //create a terminal input interface
  const rl = createInterface({ input: stdin, output: stdout });

  try {
    //get admin details from the terminal
    const name = (await rl.question("Admin name: ")).trim();
    const email = (
      await rl.question("Admin email: ")
    ).trim().toLowerCase();
    const password = await rl.question("Admin password: ");

    //validate required fields and password length
    if (!name || !email || password.length < 12) {
      throw new Error(
        "Name and email are required. Use a password of at least 12 characters."
      );
    }

    //get the database connection URL from .env
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is missing from .env.");
    }

    //create a prisma client connected to postgreSQL
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });

    try {

        //checking whether email already exists
      const existing = await prisma.user.findUnique({
        where: { email },
      });

      if (existing) {
        throw new Error(
          "That email already exists. No account was changed."
        );
      }

      //creating admin account and securely hash the password
      await prisma.user.create({
        data: {
          name,
          email,
          password: await hash(password, 12),
          role: "ADMIN",
        },
      });

      console.log("Admin account created successfully.");
    } finally {
      await prisma.$disconnect();
    }
  } finally {
    rl.close();
  }
}

//handles error and report failures
main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : "Admin setup failed."
  );
  process.exitCode = 1;
});
