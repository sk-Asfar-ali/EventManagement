import { useState } from 'react';
import { ModalShell } from './UI';
import { type OrgEvent, type EventFormData, EMPTY_FORM, toLocalDT } from '../utils/helpers';

interface Props {
  initial?: OrgEvent | null;
  onClose: () => void;
  onSave: (data: EventFormData) => void;
  loading: boolean;
}

export function EventModal({ initial, onClose, onSave, loading }: Props) {
  const [form, setForm] = useState<EventFormData>(
    initial ? {
      title: initial.title,
      description: initial.description,
      venue: initial.venue,
      eventDate: toLocalDT(initial.eventDate),
      registrationClosingDate: toLocalDT(initial.registrationClosingDate),
      durationInHours: initial.durationInHours,
    } : EMPTY_FORM
  );

  const set = (k: keyof EventFormData, v: string | number) =>
    setForm(f => ({ ...f, [k]: v }));

  const canSubmit = !loading && !!form.title && !!form.eventDate;

  return (
    <ModalShell
      title={initial ? 'Edit Event' : 'New Event'}
      subtitle={initial ? 'Update event details' : 'Fill in the details to create a new event'}
      onClose={onClose}
    >
      <div className="modal-form">
        <div className="mfield">
          <label>Event Title</label>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. Annual Tech Summit" />
        </div>
        <div className="mfield">
          <label>Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Describe your event…" />
        </div>
        <div className="mfield">
          <label>Venue</label>
          <input value={form.venue} onChange={e => set('venue', e.target.value)}
            placeholder="e.g. Chennai Trade Centre" />
        </div>
        <div className="modal-row">
          <div className="mfield">
            <label>Event Date & Time</label>
            <input type="datetime-local" value={form.eventDate}
              onChange={e => set('eventDate', e.target.value)} />
          </div>
          <div className="mfield">
            <label>Registration Closes</label>
            <input type="datetime-local" value={form.registrationClosingDate}
              onChange={e => set('registrationClosingDate', e.target.value)} />
          </div>
        </div>
        <div className="mfield" style={{ maxWidth: 150 }}>
          <label>Duration (hours)</label>
          <input type="number" min={1} max={72} value={form.durationInHours}
            onChange={e => set('durationInHours', parseInt(e.target.value) || 1)} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!canSubmit} onClick={() => onSave(form)}>
            {loading ? <span className="btn-spin" /> : initial ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
