import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Clock, ChefHat, Truck, Package, XCircle, MapPin, Banknote } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../features/auth/AuthContext';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const statusSteps = [
  { key: 'placed', icon: Clock, label: 'order.placed', desc: 'order.placed_desc' },
  { key: 'confirmed', icon: Check, label: 'order.confirmed', desc: 'order.confirmed_desc' },
  { key: 'preparing', icon: ChefHat, label: 'order.preparing', desc: 'order.preparing_desc' },
  { key: 'out_for_delivery', icon: Truck, label: 'order.out_for_delivery', desc: 'order.out_for_delivery_desc' },
  { key: 'delivered', icon: Package, label: 'order.delivered', desc: 'order.delivered_desc' },
];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => { fetchOrder(); }, [id]);

  const fetchOrder = async () => {
    const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).single();
    setOrder(data);
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!confirm(t('order.cancel_confirm'))) return;
    setCancelling(true);
    try {
      const { error } = await supabase.rpc('cancel_order', { p_order_id: id, p_user_id: user.id });
      if (error) throw error;
      toast.success(t('order.cancelled'));
      fetchOrder();
    } catch (err) {
      toast.error(err.message || t('errors.generic'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner--lg" /></div>;
  if (!order) return <div className="empty-state"><h3>{t('common.no_results')}</h3></div>;

  const isCancelled = order.status === 'cancelled';
  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const canCancel = ['placed', 'confirmed'].includes(order.status);

  return (
    <div className="animate-fade-in">
      <Link to="/orders" className="btn btn--ghost btn--sm" style={{ marginBottom: 'var(--space-5)' }}><ArrowLeft size={16} /> {t('common.back')}</Link>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{order.order_number}</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: 0 }}>{formatDateTime(order.created_at)}</p>
        </div>
        {canCancel && <button className="btn btn--danger btn--sm" onClick={handleCancel} disabled={cancelling}>{cancelling ? t('common.loading') : t('order.cancel')}</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 380px' : '1fr', gap: 'var(--space-6)' }}>
        <div>
          {/* Status Tracker */}
          <div className="checkout-section" style={{ marginBottom: 'var(--space-5)' }}>
            <h3 className="checkout-section__title">{t('order.track')}</h3>
            {isCancelled ? (
              <div className="order-tracker"><div className="order-tracker__step order-tracker__step--cancelled"><div className="order-tracker__dot"><XCircle size={16} /></div><div className="order-tracker__info"><div className="order-tracker__title">{t('order.cancelled_status')}</div><p className="order-tracker__desc">{t('order.cancelled_desc')}</p>{order.cancelled_at && <div className="order-tracker__time">{formatDateTime(order.cancelled_at)}</div>}</div></div></div>
            ) : (
              <div className="order-tracker">
                {statusSteps.map((step, i) => {
                  const Icon = step.icon;
                  const isCompleted = i < currentStepIndex;
                  const isActive = i === currentStepIndex;
                  const timestamps = { placed: order.created_at, confirmed: order.confirmed_at, preparing: order.preparing_at, out_for_delivery: order.dispatched_at, delivered: order.delivered_at };
                  return (
                    <div key={step.key} className={`order-tracker__step ${isCompleted ? 'order-tracker__step--completed' : ''} ${isActive ? 'order-tracker__step--active' : ''}`}>
                      {i < statusSteps.length - 1 && <div className="order-tracker__line" />}
                      <div className="order-tracker__dot">{(isCompleted || isActive) && <Icon size={14} />}</div>
                      <div className="order-tracker__info">
                        <div className="order-tracker__title">{t(step.label)}</div>
                        {(isCompleted || isActive) && <p className="order-tracker__desc">{t(step.desc)}</p>}
                        {timestamps[step.key] && <div className="order-tracker__time">{formatDateTime(timestamps[step.key])}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="checkout-section">
            <h3 className="checkout-section__title">{t('order.items')}</h3>
            {order.order_items?.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-color-light)' }}>
                <div><div style={{ fontWeight: 600 }}>{item.product_name}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{formatPrice(item.unit_price)} × {item.quantity}</div></div>
                <span style={{ fontWeight: 700 }}>{formatPrice(item.total_price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div className="cart-summary">
            <h3 className="cart-summary__title">{t('checkout.order_summary')}</h3>
            <div className="cart-summary__row"><span className="cart-summary__label">{t('cart.subtotal')}</span><span className="cart-summary__value">{formatPrice(order.subtotal)}</span></div>
            <div className="cart-summary__row"><span className="cart-summary__label">{t('cart.delivery_charge')}</span><span className={order.delivery_charge == 0 ? 'cart-summary__free' : 'cart-summary__value'}>{order.delivery_charge == 0 ? t('cart.free') : formatPrice(order.delivery_charge)}</span></div>
            <div className="cart-summary__row cart-summary__row--total"><span>{t('cart.total')}</span><span>{formatPrice(order.total)}</span></div>
            <div className="divider" />
            <div style={{ fontSize: 'var(--text-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}><Banknote size={16} style={{ color: 'var(--color-accent-600)' }} /> <span style={{ fontWeight: 600 }}>{t('checkout.cod')}</span></div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}><MapPin size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 2 }} /> <span style={{ color: 'var(--text-tertiary)' }}>{order.delivery_address}, {order.delivery_city} {order.delivery_pincode}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
