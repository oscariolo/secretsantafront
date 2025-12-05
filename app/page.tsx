"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RoomListItem {
  id: string;
  participantCount: number;
}

export default function Home() {
  const [participants, setParticipants] = useState(["", ""]);
  const [error, setError] = useState("");
  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [showRoomsList, setShowRoomsList] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      let response = await fetch("/api/secret-santa/rooms");
      console.log("Rooms response status:", response.status);
      if (response.status === 404) {
        console.log("Trying alternative endpoint: /api/secret-santa/room");
        response = await fetch("/api/secret-santa/room");
        console.log("Alternative response status:", response.status);
      }
      
      if (response.ok) {
        const text = await response.text();
        console.log("Rooms response text:", text);
        try {
          const data = JSON.parse(text);
          console.log("Parsed rooms data:", data);
          setRooms(data);
        } catch (e) {
          console.error("Failed to parse rooms JSON:", e);
        }
      } else {
        console.error("Failed to fetch rooms, status:", response.status);
        setRooms([]);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setRooms([]);
    }
  };

  const handleDeleteRoom = async (roomId: string, event: React.MouseEvent) => {
    event.stopPropagation(); 
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const response = await fetch(`/api/secret-santa/room/${roomId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchRooms();
      } else {
        alert("Failed to delete room.");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("An error occurred while deleting the room.");
    }
  };

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
        await fetchRooms();
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <main className="w-full max-w-4xl space-y-6">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-center text-gray-800">Secret Santa</h1>
          <form onSubmit={handleCreateRoom} className="space-y-4 mt-6">
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
        </div>

        <div className="p-8 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Existing Rooms</h2>
            <div className="flex gap-2">
              <button
                onClick={fetchRooms}
                className="px-4 py-2 text-sm text-green-600 bg-green-100 rounded-md hover:bg-green-200"
              >
                Refresh
              </button>
              <button
                onClick={() => setShowRoomsList(!showRoomsList)}
                className="px-4 py-2 text-sm text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
              >
                {showRoomsList ? "Hide" : "Show"} Rooms
              </button>
            </div>
          </div>
          
          {showRoomsList && (
            <div className="space-y-2">
              {rooms.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No rooms available. Create one above!</p>
              ) : (
                rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-md hover:bg-gray-100"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => router.push(`/room/${room.id}`)}
                    >
                      <p className="text-gray-800 font-medium">Room ID: {room.id}</p>
                      <p className="text-sm text-gray-600">{room.participantCount} participants</p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteRoom(room.id, e)}
                      className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
