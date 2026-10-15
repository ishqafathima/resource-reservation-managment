
import { PrismaPg } from "@prisma/adapter-pg"; //import the postgresql adapter for prisma
import { PrismaClient } from "../app/generated/prisma/client";//import the generated prisma client



const connectionString = process.env.DATABASE_URL; //get the db connection url from .env

//check whether the db url exists
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in the .env file");
}

//create an adapter to connect prisma postgresql
const adapter = new PrismaPg({ connectionString });

//store the prisma client globally to reuse it
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

//reuse an existing client or create a new one
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });


  //save the client globally during development
  //to avoid creating multiple clients unncessarily
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
