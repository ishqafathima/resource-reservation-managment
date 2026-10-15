"use client"; //to use client-side features


import { signOut } from "next-auth/react";//import sign-out function from nextAuth


export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="mt-4 w-full rounded-lg border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
    >
      Sign Out
    </button>
  );
}
