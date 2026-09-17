import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../config/constants';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, User, Phone, CheckCircle, Package, Truck, ChefHat, XCircle, FileText } from 'lucide-react';

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    const { data } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).single();
    setOrder(data);
    setLoading(false);
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!confirm(`Are you sure you want to update order status to ${ORDER_STATUSES[newStatus].label}?`)) return;
    
    setUpdating(true);
    try {
      const { error } = await supabase.rpc('update_order_status', { 
        p_order_id: id, 
        p_status: newStatus 
      });
      if (error) throw error;
      toast.success('Order status updated');
      fetchOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner--lg" /></div>;
  if (!order) return <div className="empty-state"><h3>Order not found</h3></div>;

  const currentStatus = ORDER_STATUSES[order.status] || ORDER_STATUSES.placed;
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';

  return (
    <div className="animate-fade-in">
      <Link to="/admin/orders" className="btn btn--ghost btn--sm" style={{ marginBottom: 'var(--space-5)' }}>
        <ArrowLeft size={16} /> Back to Orders
      </Link>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            Order {order.order_number}
            <span className="badge" style={{ background: `${currentStatus.color}15`, color: currentStatus.color, fontSize: 'var(--text-sm)' }}>
              {currentStatus.label}
            </span>
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: 'var(--space-1) 0 0' }}>
            Placed on {formatDateTime(order.created_at)}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {order.status === 'placed' && (
            <>
              <button className="btn btn--primary" onClick={() => handleUpdateStatus('confirmed')} disabled={updating}><CheckCircle size={16}/> Confirm Order</button>
              <button className="btn btn--danger btn--ghost" onClick={() => handleUpdateStatus('cancelled')} disabled={updating}><XCircle size={16}/> Cancel</button>
            </>
          )}
          {order.status === 'confirmed' && (
            <button className="btn btn--primary" onClick={() => handleUpdateStatus('preparing')} disabled={updating}><ChefHat size={16}/> Start Preparing</button>
          )}
          {order.status === 'preparing' && (
            <button className="btn btn--primary" onClick={() => handleUpdateStatus('out_for_delivery')} disabled={updating}><Truck size={16}/> Dispatch Delivery</button>
          )}
          {order.status === 'out_for_delivery' && (
            <button className="btn btn--success" onClick={() => handleUpdateStatus('delivered')} disabled={updating}><Package size={16}/> Mark Delivered</button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 380px' : '1fr', gap: 'var(--space-6)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="admin-section">
            <div className="admin-section__header">
              <h3 className="admin-section__title"><Package size={18} /> Order Items</h3>
            </div>
            <div className="table-container">
              <table className="table">
                <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Total</th></tr></thead>
                <tbody>
                  {order.order_items?.map((item) => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{item.product_name}</td>
                      <td>{formatPrice(item.unit_price)}</td>
                      <td>{item.quantity}</td>
                      <td style={{ fontWeight: 600 }}>{formatPrice(item.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-tertiary)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', minWidth: '200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}><span>Delivery Charge</span><span>{formatPrice(order.delivery_charge)}</span></div>
                <div className="divider" style={{ margin: 'var(--space-1) 0' }}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-lg)', fontWeight: 700 }}><span>Total</span><span>{formatPrice(order.total)}</span></div>
              </div>
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section__header">
              <h3 className="admin-section__title"><FileText size={18} /> Order Timeline</h3>
            </div>
            <div className="admin-section__body">
              <div className="order-tracker">
                {order.created_at && <div className="order-tracker__step order-tracker__step--completed"><div className="order-tracker__line"/><div className="order-tracker__dot"><Clock size={14}/></div><div className="order-tracker__info"><div className="order-tracker__title">Order Placed</div><div className="order-tracker__time">{formatDateTime(order.created_at)}</div></div></div>}
                {order.confirmed_at && <div className="order-tracker__step order-tracker__step--completed"><div className="order-tracker__line"/><div className="order-tracker__dot"><CheckCircle size={14}/></div><div className="order-tracker__info"><div className="order-tracker__title">Order Confirmed</div><div className="order-tracker__time">{formatDateTime(order.confirmed_at)}</div></div></div>}
                {order.preparing_at && <div className="order-tracker__step order-tracker__step--completed"><div className="order-tracker__line"/><div className="order-tracker__dot"><ChefHat size={14}/></div><div className="order-tracker__info"><div className="order-tracker__title">Preparation Started</div><div className="order-tracker__time">{formatDateTime(order.preparing_at)}</div></div></div>}
                {order.dispatched_at && <div className="order-tracker__step order-tracker__step--completed"><div className="order-tracker__line"/><div className="order-tracker__dot"><Truck size={14}/></div><div className="order-tracker__info"><div className="order-tracker__title">Out for Delivery</div><div className="order-tracker__time">{formatDateTime(order.dispatched_at)}</div></div></div>}
                {order.delivered_at && <div className="order-tracker__step order-tracker__step--completed"><div className="order-tracker__dot"><Package size={14}/></div><div className="order-tracker__info"><div className="order-tracker__title">Delivered</div><div className="order-tracker__time">{formatDateTime(order.delivered_at)}</div></div></div>}
                {order.cancelled_at && <div className="order-tracker__step order-tracker__step--cancelled"><div className="order-tracker__dot"><XCircle size={14}/></div><div className="order-tracker__info"><div className="order-tracker__title" style={{color: 'var(--color-error)'}}>Cancelled</div><div className="order-tracker__time">{formatDateTime(order.cancelled_at)}</div></div></div>}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          <div className="admin-section">
            <div className="admin-section__header">
              <h3 className="admin-section__title"><User size={18} /> Customer Details</h3>
            </div>
            <div className="admin-section__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div className="header__avatar">{order.customer_name?.charAt(0) || 'C'}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{order.customer_name}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12}/> {order.customer_phone}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="admin-section">
            <div className="admin-section__header">
              <h3 className="admin-section__title"><MapPin size={18} /> Delivery Address</h3>
            </div>
            <div className="admin-section__body">
              <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {order.delivery_address}<br/>
                {order.delivery_city} - {order.delivery_pincode}
              </p>
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-primary-50)', color: 'var(--color-primary-800)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', display: 'inline-flex' }}>
                Distance: ~{order.distance_km} km
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
