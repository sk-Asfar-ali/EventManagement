import type { EventItem } from "../types/types";

export const events: EventItem[] = [
  {
    id: 1,
    name: "Tech Conference",
    location: "New York",
    date: "2026-04-20",
    registered: false,
    within24hrs: false
  },
  {
    id: 2,
    name: "Startup Meetup",
    location: "San Francisco",
    date: "2026-04-10",
    registered: true,
    within24hrs: false
  }
];
