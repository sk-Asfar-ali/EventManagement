import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import EventCard from "../components/EventCard";
import type { EventDto } from "../types/event";
import {
  getEvents,
  registerEvent,
  cancelEvent,
  getMyEvents,
} from "../api/eventsApi";

type Tab = "ALL" | "MY";

export default function UserEventsPage() {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("ALL");

  useEffect(() => {
    loadEvents();
  }, [activeTab]);

  const loadEvents = async () => {
    setLoading(true);

    try {
      const data =
        activeTab === "ALL"
          ? await getEvents()
          : await getMyEvents();

      setEvents(data);
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (id: number) => {
    await registerEvent(id);
    loadEvents();
  };

  const handleCancel = async (id: number) => {
    await cancelEvent(id);
    loadEvents();
  };

  return (
    <Layout>
      {/* Page Title */}
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Event Dashboard
      </h1>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "ALL"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          All Events
        </button>

        <button
          onClick={() => setActiveTab("MY")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            activeTab === "MY"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          My Registered Events
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <p className="text-gray-500">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-500">
          No events found for this category.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              {...event}
              onRegister={() => handleRegister(event.id)}
              onCancel={() => handleCancel(event.id)}
            />
          ))}
        </div>
      )}
    </Layout>
  );
}