
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

//configure authentication and export useful functions
export const { handlers, signIn, signOut, auth } = NextAuth({
    //Use JWT-based sessions
  session: {
    strategy: "jwt",
  },

  //Allow login using email and password
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },


      //verify the user's login credentials
      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials?.password !== "string"
        ) {
          return null;
        }

        //normalize the email
        const email = credentials.email.trim().toLowerCase();


        //find the user in database
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        //compare the enterd password with the stored hash
        const passwordIsValid = await compare(
          credentials.password,
          user.password
        );

        if (!passwordIsValid) {
          return null;
        }


        //return the authenticated user's details
        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  //Store the user's ID and role in the JWT
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const account = user as typeof user & {
          role?: string;
        };

        token.id = user.id;
        token.role = account.role;
      }

      return token;
    },

    //Make the ID and role available in the session
    session({ session, token }) {
      const sessionUser = session.user as typeof session.user & {
        id?: string;
        role?: string;
      };

      sessionUser.id = token.id as string;
      sessionUser.role = token.role as string;

      return session;
    },
  },

  //use our custom login page
  pages: {
    signIn: "/login",
  },
});
