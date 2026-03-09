import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth,type Role } from '../context/AuthContext';

function pwStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const labels = ['','Weak','Fair','Good','Strong'];
  const colors = ['','#C84B31','#D4860A','#2A7A4B','#1E6B6B'];
  return { level:s, label:labels[s]||'', color:colors[s]||'' };
}

export default function RegisterPage() {
  const [role, setRole]         = useState<Role>('user');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const strength = pwStrength(password);
  const isOrg = role === 'organizer';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register({ name, email, password, role });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2200);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      {/* Left */}
      <div className="auth-panel">
        <div className="auth-panel-deco"><span/><span/><span/></div>
        <div className="auth-panel-dots">{Array.from({length:21}).map((_,i)=><span key={i}/>)}</div>
        <div className="auth-panel-inner">
          <div className="auth-brand">
            <div className="auth-brand-mark">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L18 16H2L10 2Z" fill="white"/>
              </svg>
            </div>
            <span className="auth-brand-name">Evently</span>
          </div>
          <div className="auth-panel-copy">
            <h2>Your next <em>great event</em><br/>starts here.</h2>
            <p>Join as a guest to discover and register for events, or as an organizer to create and manage your own.</p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="auth-form-area">
        <div className="auth-card">
          <div className="auth-card-head">
            <h1>Create account</h1>
            <p>Choose your role to get started</p>
          </div>

          {/* Role toggle */}
          <div className="role-toggle">
            <button type="button" className={`role-btn ${!isOrg ? 'active' : ''}`} onClick={()=>setRole('user')}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M2 12.5c0-2.761 2.239-4.5 5-4.5s5 1.739 5 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Attendee
            </button>
            <button type="button" className={`role-btn ${isOrg ? 'active teal' : ''}`} onClick={()=>setRole('organizer')}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1.5" y="3" width="11" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5 3V2a2 2 0 014 0v1M7 6.5v1.5M6 7.5h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Organizer
            </button>
          </div>

          {/* Role hint */}
          <div className="alert" style={{
            background: isOrg ? 'var(--teal-pale)' : 'var(--cream-2)',
            border: `1px solid ${isOrg ? 'rgba(30,107,107,.2)' : 'var(--border)'}`,
            color: isOrg ? 'var(--teal)' : 'var(--ink-3)',
            fontSize: '.82rem', padding:'10px 13px',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,marginTop:1}}>
              <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M7 6v4M7 4.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            {isOrg
              ? 'As an organizer you can create events, manage attendees, and track analytics.'
              : 'As an attendee you can browse events, register, and manage your bookings.'}
          </div>

          {error && (
            <div className="alert error">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,marginTop:1}}>
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7 4v3M7 9.5h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="alert success">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0,marginTop:1}}>
                <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M4.5 7l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Account created! Redirecting to login…
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="field">
              <label>Full name</label>
              <div className="field-wrap">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="7.5" cy="5" r="2.75" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M2 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input type="text" placeholder="John Doe" value={name}
                  onChange={e=>setName(e.target.value)} required autoComplete="name"
                  className={isOrg ? 'teal-focus' : ''} />
              </div>
            </div>

            <div className="field">
              <label>Email address</label>
              <div className="field-wrap">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x=".75" y="2.75" width="13.5" height="9.5" rx="1.75" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M.75 5.5l6.75 3.75 6.75-3.75" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={e=>setEmail(e.target.value)} required autoComplete="email"
                  className={isOrg ? 'teal-focus' : ''} />
              </div>
            </div>

            <div className="field">
              <label>Password</label>
              <div className="field-wrap">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="2.75" y="6.75" width="9.5" height="6.5" rx="1.25" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4.5 6.75V5a3 3 0 016 0v1.75" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <input type={showPw?'text':'password'} placeholder="Create a strong password" value={password}
                  onChange={e=>setPassword(e.target.value)} required autoComplete="new-password"
                  className={isOrg ? 'teal-focus' : ''} />
                <button type="button" className="pw-toggle" onClick={()=>setShowPw(v=>!v)}>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M1.5 7.5s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.3"/>
                    <circle cx="7.5" cy="7.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    {showPw && <path d="M2.5 2.5l10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>}
                  </svg>
                </button>
              </div>
              {password && (
                <div className="pw-strength">
                  <div className="pw-strength-bars">
                    {[1,2,3,4].map(i=>(
                      <div key={i} className="pw-bar"
                        style={{background: i<=strength.level ? strength.color : 'var(--cream-3)'}}/>
                    ))}
                  </div>
                  <span className="pw-label" style={{color:strength.color}}>{strength.label}</span>
                </div>
              )}
            </div>

            <div className="field">
              <label>Confirm password</label>
              <div className="field-wrap">
                <svg className="field-icon" width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <rect x="2.75" y="6.75" width="9.5" height="6.5" rx="1.25" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M4.5 6.75V5a3 3 0 016 0v1.75" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <input type={showPw?'text':'password'} placeholder="Repeat your password" value={confirm}
                  onChange={e=>setConfirm(e.target.value)} required autoComplete="new-password"
                  className={isOrg ? 'teal-focus' : ''} />
              </div>
            </div>

            <button type="submit" className={`auth-btn ${isOrg?'teal':'ink'}`} disabled={loading||success}>
              {loading ? <span className="btn-spin"/> : `Create ${isOrg?'organizer':'attendee'} account`}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
