
//import tools for dynamic rendering and database access
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
// Import authentication and redirect functions
import { auth } from "@/auth";
import { redirect } from "next/navigation";
// Import the form used to add resources
import AddResourceForm from "./AddResourceForm";

// Disable instant static rendering for this page
export const instant = false;

export default async function ResourcesPage() {
    //wait for a real request before accessing dynamic data
  await connection();

  //get the currenct user session
  const session = await auth();

  //redirect who sare not logged in
  if (!session?.user) {
    redirect("/login");
  }

  //get user role
  const user = session.user as typeof session.user & {
    role?: string;
  };

  //check whether use is admin
  const isAdmin = user.role === "ADMIN";

  // Fetch resources from the database
  // Admins see all resources; regular users see active resources
  const resources = await prisma.resource.findMany({
    where: isAdmin ? {} : { isActive: true },
    orderBy: { id: "asc" },
  });

  //dispaly
return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <a
          href="/"
          className="text-sm font-medium text-violet-600 hover:underline"
        >
          ← Back to Dashboard
        </a>

        <div className="mb-8 mt-4">
          <h1 className="text-3xl font-bold text-slate-900">
            Resources
          </h1>
          <p className="mt-2 text-slate-500">
            {isAdmin
              ? "Add and manage bookable resources."
              : "View available resources for reservations."}
          </p>
        </div>

        {isAdmin && <AddResourceForm />}

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">
            {isAdmin ? "Total Resources" : "Available Resources"}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {resources.length}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="font-semibold text-slate-900">
              {isAdmin ? "All Resources" : "Available Resources"}
            </h2>
          </div>

          {resources.length === 0 ? (
            <p className="p-6 text-slate-500">
              No resources found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {resources.map((resource) => (
                    <tr key={resource.id}>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {resource.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {resource.type}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {resource.location || "Not specified"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            resource.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {resource.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-6">
          <a
            href="/reservations/new"
            className="inline-block rounded-lg bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
          >
            + Create Reservation
          </a>
        </div>
      </div>
    </main>
  );
}
