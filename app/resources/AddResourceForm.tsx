
"use client"; //enables client-side intercations

import { useState } from "react"; //// Import React state to store form values
import { useRouter } from "next/navigation"; // Used to refresh the page after adding a resource

export default function AddResourceForm() {
    // Create a router to refresh the current page
  const router = useRouter();

  //store the values entered into the form
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");// Store the success or error message
  const [loading, setLoading] = useState(false);// Track whether the form is submitting

  //run when form is submitted
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    //prevent the browser from reloading the page
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
        //send the d form data to resource api
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          location,
          description,
        }),
      });

      //read the api response
      const data = await response.json();

      //display an error if the api request fsailed
      if (!response.ok) {
        setMessage(data.message || "Failed to add resource.");
        return;
      }

      //clear the form after successful submissin
      setName("");
      setType("");
      setLocation("");
      setDescription("");
      //displaying success message and refrewsh the page data
      setMessage("Resource added successfully!");
      router.refresh();
    } catch {
        //handle network error
      setMessage("Something went wrong. Please try again.");
    } finally {
        //stop the laoding state
      setLoading(false);
    }
  }

  //display form
  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">
        Add New Resource
      </h2>

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Resource name"
          className="rounded-lg border border-slate-300 px-4 py-3"
        />

        <input
          required
          value={type}
          onChange={(event) => setType(event.target.value)}
          placeholder="Type (e.g. Meeting Room)"
          className="rounded-lg border border-slate-300 px-4 py-3"
        />

        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Location (optional)"
          className="rounded-lg border border-slate-300 px-4 py-3"
        />

        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description (optional)"
          className="rounded-lg border border-slate-300 px-4 py-3"
        />

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Resource"}
          </button>
        </div>


        {/*display success or error message*/}
        {message && (
          <p className="sm:col-span-2 text-sm text-slate-700" role="status">
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
