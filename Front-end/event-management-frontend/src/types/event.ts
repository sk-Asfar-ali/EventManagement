export interface EventDto {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  status: "REGISTERED" | "NOT_REGISTERED" | "CLOSED";
  canCancel: boolean;
}