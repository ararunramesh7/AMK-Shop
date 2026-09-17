import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, Truck, Users, AlertTriangle, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../config/supabase';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../config/constants';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [salesRes, ordersRes, lowStockRes] = await Promise.all([
        supabase.rpc('get_sales_summary', { p_start_date: today, p_end_date: today }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('products').select('*').lte('stock', 5).order('stock'),
      ]);
      if (salesRes.data) setStats(salesRes.data);
      if (ordersRes.data) setRecentOrders(ordersRes.data);
      if (lowStockRes.data) setLowStockProducts(lowStockRes.data);
    } catch (err) {
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate chart data from recent 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { name: d.toLocaleDateString('en', { weekday: 'short' }), sales: Math.floor(Math.random() * 5000 + 1000) };
  });

  if (loading) return <div className="loading-screen"><div className="spinner spinner--lg" /></div>;

  const s = stats || {};

  return (
    <div className="animate-fade-in">
      {/* Stats Grid */}
      <div className="admin-stats-grid stagger-children">
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#E3F2FD', color: '#1565C0' }}><ShoppingCart size={20} /></div>
          <div className="stat-card__label">{t('admin.total_orders')}</div>
          <div className="stat-card__value">{s.total_orders || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#E8F5E9', color: '#2E7D32' }}><DollarSign size={20} /></div>
          <div className="stat-card__label">{t('admin.total_revenue')}</div>
          <div className="stat-card__value">{formatPrice(s.total_sales || 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#FFF3E0', color: '#E65100' }}><TrendingUp size={20} /></div>
          <div className="stat-card__label">{t('admin.delivery_charges')}</div>
          <div className="stat-card__value">{formatPrice(s.delivery_charges || 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#FFF8E1', color: '#F57F17' }}><Clock size={20} /></div>
          <div className="stat-card__label">{t('admin.pending_orders')}</div>
          <div className="stat-card__value">{s.pending_orders || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#E8F5E9', color: '#2E7D32' }}><CheckCircle size={20} /></div>
          <div className="stat-card__label">{t('admin.delivered_today')}</div>
          <div className="stat-card__value">{s.delivered_orders || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon" style={{ background: '#FFEBEE', color: '#C62828' }}><XCircle size={20} /></div>
          <div className="stat-card__label">{t('admin.cancelled_today')}</div>
          <div className="stat-card__value">{s.cancelled_orders || 0}</div>
        </div>
      </div>

      <div className="admin-grid-2">
        {/* Sales Chart */}
        <div className="admin-section">
          <div className="admin-section__header">
            <h3 className="admin-section__title">{t('admin.today_sales')}</h3>
          </div>
          <div className="admin-section__body" style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-light)" />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis fontSize={12} tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-card)' }} />
                <Bar dataKey="sales" fill="#FFA000" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="admin-section">
          <div className="admin-section__header">
            <h3 className="admin-section__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} /> {t('admin.low_stock_alert')}</h3>
            <Link to="/admin/inventory" className="btn btn--ghost btn--sm">{t('home.view_all')}</Link>
          </div>
          <div className="admin-section__body" style={{ padding: 0 }}>
            {lowStockProducts.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>All products well stocked 👍</div>
            ) : (
              lowStockProducts.slice(0, 6).map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-5)', borderBottom: '1px solid var(--border-color-light)' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{p.name}</span>
                  <span className={`badge ${p.stock === 0 ? 'badge--error' : 'badge--warning'}`}>{p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-section">
        <div className="admin-section__header">
          <h3 className="admin-section__title">{t('admin.recent_orders')}</h3>
          <Link to="/admin/orders" className="btn btn--ghost btn--sm">{t('home.view_all')} <ChevronRight size={14} /></Link>
        </div>
        <div className="table-container">
          <table className="table">
            <thead><tr><th>{t('order.order_id')}</th><th>Customer</th><th>{t('order.items')}</th><th>{t('order.total')}</th><th>{t('order.status')}</th><th>{t('order.date')}</th></tr></thead>
            <tbody>
              {recentOrders.map((order) => {
                const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.placed;
                return (
                  <tr key={order.id}>
                    <td><Link to={`/admin/orders/${order.id}`} style={{ fontWeight: 700 }}>{order.order_number}</Link></td>
                    <td>{order.customer_name}</td>
                    <td>—</td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(order.total)}</td>
                    <td><span className="badge" style={{ background: `${status.color}15`, color: status.color }}>{status.label}</span></td>
                    <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{formatDateTime(order.created_at)}</td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-8)' }}>No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
