export default function AdminNotifications() {
  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h3 className="admin-section__title">Notifications</h3>
      </div>
      <div className="admin-section__body" style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Push notifications system integration pending (SMS/WhatsApp provider required).</p>
      </div>
    </div>
  );
}
