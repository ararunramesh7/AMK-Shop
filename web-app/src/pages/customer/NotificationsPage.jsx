import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const { t } = useTranslation();
  return (
    <div className="empty-state animate-fade-in">
      <div className="empty-state__icon"><Bell size={80} /></div>
      <h2 className="empty-state__title">{t('notification.empty')}</h2>
      <p className="empty-state__description">{t('notification.empty_desc')}</p>
    </div>
  );
}
