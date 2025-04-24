import { React, useEffect, useState } from "react";

export default function JoinLink() {
  const [klasResponse, setKlasResponse] = useState("Nog Geen Response");

  async function fetchExample() {
    const url = import.meta.env.VITE_API_URL;
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTAsImlhdCI6MTc0MjEyOTQ5NCwiZXhwIjoxNzQyNzM0Mjk0fQ.w6oHGhY0GsvcqEk70Y1fQmN8Xnp3rXYBwUUWlvBea4U";
    const response = await fetch(`${url}/class/teacher`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: "hobbesje" }),
    });

    setKlasResponse(JSON.stringify(await response.json()));
  }

  return (
    <div className="flex flex-col gap-y-10">
      <button
        className="p-2 rounded-xl bg-red-100 w-32 hover:cursor-pointer"
        onClick={fetchExample}
      >
        Maak Klas aan!
      </button>
      <div className="bg-gray-100 p-8 w-full ">{klasResponse}</div>
    </div>
  );
}
