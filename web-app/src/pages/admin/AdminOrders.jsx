import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { formatPrice, formatDateTime } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../config/constants';
import { Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase()) || 
                          o.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-section animate-fade-in">
      <div className="admin-section__header" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '16px' }}>
        <h3 className="admin-section__title">Order Management</h3>
        
        <div style={{ display: 'flex', gap: '16px', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <select className="form-input" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            {Object.entries(ORDER_STATUSES).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <div className="search-bar" style={{ maxWidth: '300px' }}>
            <Search size={18} className="search-bar__icon" />
            <input 
              type="text" 
              className="search-bar__input" 
              placeholder="Search by ID or Name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}/></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.placed;
                return (
                  <tr key={order.id}>
                    <td><Link to={`/admin/orders/${order.id}`} style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>{order.order_number}</Link></td>
                    <td>{formatDateTime(order.created_at)}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{order.customer_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.customer_phone}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(order.total)}</td>
                    <td>
                      <span className="badge" style={{ background: `${status.color}20`, color: status.color, border: `1px solid ${status.color}40` }}>
                        {status.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/orders/${order.id}`} className="btn btn--ghost btn--sm">
                        View <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
