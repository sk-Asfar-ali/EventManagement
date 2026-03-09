import type { Tab } from '../utils/helpers';

const NAV: { id: Tab; label: string; icon: string }[] = [
  { id:'browse',        label:'Browse',        icon:'🔍' },
  { id:'bookings',      label:'My Bookings',   icon:'🎟' },
  { id:'notifications', label:'Notifications', icon:'🔔' },
  { id:'profile',       label:'Profile',       icon:'👤' },
  { id:'attendance',    label:'Attendance',    icon:'✅' },
];

interface Props {
  tab: Tab;
  onTabChange: (t: Tab) => void;
  initials: string;
  unreadCount: number;
  onLogout: () => void;
}

export function Topbar({ tab, onTabChange, initials, unreadCount, onLogout }: Props) {
  return (
    <header className="ud-topbar">
      <div className="ud-brand">
        <div className="ud-brand-mark">E</div>
        <span className="ud-brand-name">Evently</span>
      </div>

      <nav className="ud-nav">
        {NAV.map(item => (
          <button key={item.id}
            className={`ud-nav-btn ${tab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'notifications' && unreadCount > 0 && (
              <span className="ud-nav-badge" />
            )}
          </button>
        ))}
      </nav>

      <div className="ud-topbar-right">
        <div className="ud-avatar">{initials}</div>
        <button className="ud-logout-btn" onClick={onLogout}>↩ Sign out</button>
      </div>
    </header>
  );
}
