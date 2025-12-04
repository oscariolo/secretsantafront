"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [participants, setParticipants] = useState(["", ""]);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleParticipantChange = (index: number, value: string) => {
    const newParticipants = [...participants];
    newParticipants[index] = value;
    setParticipants(newParticipants);
  };

  const addParticipantInput = () => {
    setParticipants([...participants, ""]);
  };

  const removeParticipantInput = (index: number) => {
    if (participants.length > 2) {
      const newParticipants = participants.filter((_, i) => i !== index);
      setParticipants(newParticipants);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const participantNames = participants.map((p) => p.trim()).filter((name) => name !== "");

    if (participantNames.length < 2) {
      setError("You need at least 2 participants.");
      return;
    }

    try {
      const response = await fetch("/api/secret-santa/room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ participants: participantNames }),
      });

      if (response.ok) {
        const roomUrl = await response.text();
        const roomId = roomUrl.split("/").pop();
        router.push(`/room/${roomId}`);
      } else {
        setError("Failed to create room. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please check if the backend is running.");
      console.error("Error creating room:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <main className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">Secret Santa</h1>
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Enter participant names
            </label>
            <div className="space-y-2 mt-1">
              {participants.map((participant, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={participant}
                    onChange={(e) => handleParticipantChange(index, e.target.value)}
                    className="w-full p-2 text-black border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder={`Participant ${index + 1}`}
                  />
                  {participants.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeParticipantInput(index)}
                      className="px-3 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                    >
                      -
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addParticipantInput}
              className="w-full mt-2 px-4 py-2 text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
            >
              + Add Participant
            </button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Room
          </button>
        </form>
      </main>
    </div>
  );
}
