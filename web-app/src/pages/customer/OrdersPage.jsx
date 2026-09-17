import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, ChevronRight } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../features/auth/AuthContext';
import { formatPrice, formatDate } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../config/constants';

export default function OrdersPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*, order_items(*)').eq('customer_id', user.id).order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner--lg" /><p className="loading-screen__text">{t('common.loading')}</p></div>;

  if (orders.length === 0) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-state__icon"><ClipboardList size={80} /></div>
        <h2 className="empty-state__title">{t('order.empty')}</h2>
        <p className="empty-state__description">{t('order.empty_desc')}</p>
        <Link to="/products" className="btn btn--primary btn--lg">{t('home.shop_now')}</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>{t('order.title')}</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {orders.map((order) => {
          const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.placed;
          return (
            <Link key={order.id} to={`/orders/${order.id}`} className="card card--clickable" style={{ textDecoration: 'none' }}>
              <div className="card__body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)' }}>{order.order_number}</span>
                    <span className="badge" style={{ background: `${status.color}15`, color: status.color }}>{t(`order.${order.status === 'out_for_delivery' ? 'out_for_delivery' : order.status}`)}</span>
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{formatDate(order.created_at)} · {order.order_items?.length || 0} {t('order.items')} · {t('checkout.cod')}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)' }}>{formatPrice(order.total)}</span>
                  <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
