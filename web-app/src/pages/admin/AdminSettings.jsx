import { Settings } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="animate-fade-in">
      <div className="empty-state">
        <div className="empty-state__icon"><Settings size={80} /></div>
        <h2 className="empty-state__title">System Settings</h2>
        <p className="empty-state__description">System configuration and delivery settings will be available here.</p>
      </div>
    </div>
  );
}
