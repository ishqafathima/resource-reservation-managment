"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation"; // Reads query parameters from the current URL.
import Link from "next/link";

export default function LoginPage() {
    // Tracks whether the user has just registered successfully.
const [registered, setRegistered] = useState(false);

useEffect(() => {
    // Reads the current URL's query parameters.
    // Example: /login?registered=true
  const params = new URLSearchParams(window.location.search);
  setRegistered(params.get("registered") === "true");
}, []);

//stores the email and password entered by the user
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");  // Stores an error message if login fails.
  const [loading, setLoading] = useState(false);

  // Runs when the user submits the login form.
  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true); // Shows the loading state while authentication is happening.

    try {
        // Sends the credentials to NextAuth for authentication.
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

       // If authentication fails, show an error message.
      if (result?.error) {
        setError("Invalid email or password.");
        // If authentication succeeds, navigate to the dashboard.
      } else if (result?.ok) {
        window.location.href = "/";
      } else {
        setError("Unable to sign in. Please try again.");
      }
    } catch {
        // Displays a message if something unexpected goes wrong.
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  //redners the login page
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-violet-600 text-2xl text-white">
            ◷
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in to your Resource Reservation System
          </p>
        </div>

        {registered && (
          <p
            role="status"
            className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-700"
          >
            Account created successfully! You can now sign in.
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-violet-600 hover:text-violet-700"
          >
            Sign Up
          </Link>
        </p>

        <p className="mt-4 text-center text-xs text-slate-500">
          Secure access to your Resource Reservation System
        </p>
      </div>
    </main>
  );
}
