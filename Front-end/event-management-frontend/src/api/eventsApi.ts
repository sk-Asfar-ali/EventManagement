import api from "./axios";
import type { EventDto } from "../types/event";

export const getEvents = async (): Promise<EventDto[]> => {
  const res = await api.get("/users/events");
  return res.data;
};

export const registerEvent = async (eventId: number) => {
  const res = await api.post("/users/events/register", {
    eventId,
  });

  return res.data;
};

export const cancelEvent = async (eventId: number) => {
  const res = await api.patch("/users/events/cancel", {
    eventId,
  });

  return res.data;
};

export const getMyEvents = async () => {
  const res = await api.get("/users/events/my");
  return res.data;
};