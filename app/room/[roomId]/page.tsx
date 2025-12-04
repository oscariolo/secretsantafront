"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Participant {
  id: number;
  name: string;
}

interface Room {
  id: string;
  participants: Participant[];
}

export default function RoomPage() {
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [secretSanta, setSecretSanta] = useState<string | null>(null);
  const [error, setError] = useState("");
  const params = useParams();
  const roomId = params.roomId as string;

  useEffect(() => {
    if (roomId) {
      const fetchRoom = async () => {
        try {
          const response = await fetch(`/api/secret-santa/room/${roomId}`);
          if (response.ok) {
            const text = await response.text();
            try {
              const data = JSON.parse(text);
              setRoom(data);
            } catch (e) {
              setError("Failed to parse room data.");
              console.error("Failed to parse room data:", text);
            }
          } else {
            setError("Room not found.");
          }
        } catch (error) {
          setError("An error occurred while fetching the room.");
          console.error("Error fetching room:", error);
        }
      };
      fetchRoom();
    }
  }, [roomId]);

  const handleParticipantSelect = async (participant: Participant) => {
    setSelectedParticipant(participant);
    setSecretSanta(null); 
    try {
      const response = await fetch(`/api/secret-santa/room/${roomId}/participant/${participant.id}`);
      if (response.ok) {
        const santaName = await response.text();
        setSecretSanta(santaName);
      } else {
        setError("Could not find the secret santa.");
      }
    } catch (error) {
      setError("An error occurred while fetching the secret santa.");
      console.error("Error fetching secret santa:", error);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>Loading room...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <main className="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800">Secret Santa Room</h1>
        <p className="text-center text-gray-600">Room ID: {room.id}</p>
        
        {!selectedParticipant ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-700">Choose your name:</h2>
            <ul className="mt-4 space-y-2">
              {room.participants.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => handleParticipantSelect(p)}
                    className="w-full px-4 py-2 text-left text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
                  >
                    {p.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              Hi, <span className="text-indigo-600">{selectedParticipant.name}</span>!
            </h2>
            {secretSanta ? (
              <p className="mt-4 text-lg">
                Your Secret Santa is: <span className="font-bold text-2xl text-green-600">{secretSanta}</span>
              </p>
            ) : (
              <p className="mt-4">Revealing your Secret Santa...</p>
            )}
            <button
              onClick={() => setSelectedParticipant(null)}
              className="mt-6 px-4 py-2 text-sm text-white bg-gray-500 rounded-md hover:bg-gray-600"
            >
              Back to list
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
