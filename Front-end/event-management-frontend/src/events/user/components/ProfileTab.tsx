interface UserInfo {
  id?: number; name?: string; email?: string; role?: string;
}

export function ProfileTab({ user, initials }: { user: UserInfo; initials: string }) {
  const fields = [
    { label:'Full Name',     val: user.name || '—' },
    { label:'Email Address', val: user.email || '—' },
    { label:'Account Role',  val: user.role, capitalize: true },
    { label:'User ID',       val: `#${user.id}`, mono: true },
  ];

  return (
    <div className="profile-card">
      <div className="profile-avatar-row">
        <div className="profile-avatar">{initials}</div>
        <div>
          <div className="profile-name">{user.name || 'User'}</div>
          <span className="profile-role-tag">👤 Attendee</span>
        </div>
      </div>
      <div className="profile-fields">
        {fields.map(f => (
          <div className="profile-field" key={f.label}>
            <label>{f.label}</label>
            <div className="profile-field-val" style={{
              textTransform: f.capitalize ? 'capitalize' : undefined,
              fontFamily: f.mono ? 'monospace' : undefined,
              fontSize: f.mono ? '.8rem' : undefined,
              color: f.mono ? 'var(--ud-ink-3)' : undefined,
            }}>
              {f.val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
