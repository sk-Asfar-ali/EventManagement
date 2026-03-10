import { ModalShell, EmptyState } from './UI';
import { type OrgEvent, type Registration, initials } from '../utils/helpers';

interface Props {
  event: OrgEvent;
  regs: Registration[];
  onClose: () => void;
}

export function AttendeesModal({ event, regs, onClose }: Props) {
  return (
    <ModalShell
      title={event.title}
      subtitle={`${regs.length} registered attendee${regs.length !== 1 ? 's' : ''}`}
      onClose={onClose}
    >
      {regs.length === 0 ? (
        <EmptyState icon="👥" title="No registrations yet" />
      ) : (
        <div className="attendees-list">
          {regs.map(r => (
            <div className="attendee-row" key={r.registrationId}>
              <div className="attendee-avatar">{initials(r.user.name)}</div>
              <div>
                <div className="attendee-name">{r.user.name}</div>
                <div className="attendee-email">{r.user.email}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ModalShell>
  );
}
