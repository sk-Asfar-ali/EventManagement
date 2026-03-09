import type { Tab } from '../utils/helpers';

interface Props {
  tab: Tab;
  onTabChange: (t: Tab) => void;
  userName?: string;
  userEmail?: string;
  onLogout: () => void;
}

// Analytics removed — reports tab covers all insights
const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id:'events',    label:'My Events',  icon:'📅' },
  { id:'attendees', label:'Attendees',  icon:'👥' },
  { id:'reports',   label:'Reports',    icon:'📋' },
];

export function Sidebar({ tab, onTabChange, userName, userEmail, onLogout }: Props) {
  const name     = userName || userEmail || 'Organizer';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  return (
    <aside className="od-sidebar">
      <div className="od-sidebar-top">
        <div className="od-logo">
          <div className="od-logo-mark">E</div>
          <div className="od-logo-text">
            <span className="od-logo-name">Evently</span>
            <span className="od-logo-tag">Organizer</span>
          </div>
        </div>
      </div>

      <nav className="od-nav">
        <div className="od-nav-section">Menu</div>
        {NAV_ITEMS.map(item => (
          <button key={item.id}
            className={`od-nav-btn ${tab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}>
            <span style={{ fontSize:'1rem' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="od-sidebar-footer">
        <div className="od-user-chip">
          <div className="od-user-avatar">{initials}</div>
          <span className="od-user-name">{name}</span>
        </div>
        <button className="od-sign-out" onClick={onLogout}>
          ↩ Sign out
        </button>
      </div>
    </aside>
  );
}
