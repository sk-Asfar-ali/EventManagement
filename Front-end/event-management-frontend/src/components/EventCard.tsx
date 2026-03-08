import Button from "./Button";
import type { EventDto } from "../types/event";

interface Props extends EventDto {
  onRegister: () => void;
  onCancel: () => void;
}

export default function EventCard({
  title,
  description,
  eventDate,
  status,
  canCancel,
  onRegister,
  onCancel,
}: Props) {
  return (
    <div className="bg-white shadow-md rounded-xl p-5 flex flex-col justify-between">
      <div>
        <h2 className="font-semibold text-lg mb-2">{title}</h2>

        <p className="text-gray-600 text-sm mb-3">{description}</p>

        <p className="text-xs text-gray-500">
          {new Date(eventDate).toLocaleString()}
        </p>
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">
        {status === "NOT_REGISTERED" && (
          <Button onClick={onRegister}>Register</Button>
        )}

        {status === "REGISTERED" && (
          <>
            <Button disabled variant="secondary">
              Registered
            </Button>

            <Button
              variant="danger"
              disabled={!canCancel}
              onClick={onCancel}
            >
              Cancel
            </Button>
          </>
        )}

        {status === "CLOSED" && (
          <Button disabled variant="secondary">
            Closed
          </Button>
        )}
      </div>

      {status === "REGISTERED" && !canCancel && (
        <p className="text-xs text-gray-400 mt-2">
          Cannot cancel within 24 hours
        </p>
      )}
    </div>
  );
}