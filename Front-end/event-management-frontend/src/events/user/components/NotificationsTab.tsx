import { type Notif, timeAgo } from '../utils/helpers';
import { EmptyState } from './UI';

interface Props {
  notifs: Notif[];
  unreadCount: number;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
}

export function NotificationsTab({ notifs, unreadCount, onMarkRead, onMarkAllRead }: Props) {
  return (
    <>
      {unreadCount > 0 && (
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
          <button className="ud-btn ud-btn-outline ud-btn-sm" style={{ flex:'none' }} onClick={onMarkAllRead}>
            Mark all read
          </button>
        </div>
      )}
      {notifs.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" desc="You'll be notified about events and updates here" />
      ) : (
        <div className="notif-list">
          {notifs.map((n, i) => (
            <div key={n.id} className={`notif-item ${!n.isRead ? 'unread' : ''}`}
              style={{ animationDelay:`${i*.05}s` }}>
              <div className={`notif-dot ${n.isRead ? 'read' : ''}`} />
              <div style={{ flex:1 }}>
                <div className="notif-text">{n.message}</div>
                <div className="notif-time">{timeAgo(n.createdAt)}</div>
              </div>
              {!n.isRead && (
                <button className="notif-mark-btn" title="Mark as read" onClick={() => onMarkRead(n.id)}>
                  ✓
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
