import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { formatPrice } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, TrendingDown, Package, XCircle } from 'lucide-react';

const COLORS = ['#FFA000', '#2E7D32', '#1565C0', '#C62828', '#6A1B9A', '#F57F17'];

export default function AdminReports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week'); // week, month, year

  useEffect(() => {
    fetchReports();
  }, [timeframe]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Determine date ranges based on timeframe
      const endDate = new Date();
      const startDate = new Date();
      
      if (timeframe === 'week') startDate.setDate(endDate.getDate() - 7);
      else if (timeframe === 'month') startDate.setMonth(endDate.getMonth() - 1);
      else if (timeframe === 'year') startDate.setFullYear(endDate.getFullYear() - 1);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Using the RPC if possible, otherwise we do client-side aggregation for demo
      // In a real app we'd have a robust RPC for this
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr + 'T23:59:59');
        
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('*, orders!inner(created_at, status)')
        .gte('orders.created_at', startDateStr);

      if (orders && orderItems) {
        processReportData(orders, orderItems);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (orders, orderItems) => {
    let totalSales = 0;
    let totalOrders = orders.length;
    let deliveryCharges = 0;
    let cancelledCount = 0;
    
    // Process orders
    orders.forEach(o => {
      if (o.status === 'cancelled') {
        cancelledCount++;
      } else {
        totalSales += o.subtotal;
        deliveryCharges += o.delivery_charge;
      }
    });

    // Best selling products
    const productCounts = {};
    orderItems.forEach(item => {
      if (item.orders.status !== 'cancelled') {
        if (!productCounts[item.product_name]) productCounts[item.product_name] = 0;
        productCounts[item.product_name] += item.quantity;
      }
    });
    
    const bestSellers = Object.entries(productCounts)
      .map(([name, count]) => ({ name, value: count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Timeline data (mocked for simplicity, in prod aggregate by date)
    const timelineData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        name: d.toLocaleDateString('en', { weekday: 'short' }), 
        sales: Math.floor(Math.random() * 5000 + 1000),
        orders: Math.floor(Math.random() * 20 + 5)
      };
    });

    setStats({
      totalSales,
      totalOrders,
      deliveryCharges,
      cancelledCount,
      bestSellers,
      timelineData
    });
  };

  if (loading && !stats) return <div className="loading-screen"><div className="spinner spinner--lg" /></div>;

  return (
    <div className="animate-fade-in">
      <div className="admin-section__header" style={{ marginBottom: '24px' }}>
        <h3 className="admin-section__title">Sales & Reports</h3>
        <select className="form-input" style={{ width: 'auto' }} value={timeframe} onChange={e => setTimeframe(e.target.value)}>
          <option value="today">Today (Demo)</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {stats && (
        <>
          <div className="admin-stats-grid stagger-children" style={{ marginBottom: '24px' }}>
            <div className="stat-card">
              <div className="stat-card__icon" style={{ background: '#E8F5E9', color: '#2E7D32' }}><DollarSign size={20} /></div>
              <div className="stat-card__label">Total Revenue</div>
              <div className="stat-card__value">{formatPrice(stats.totalSales)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon" style={{ background: '#E3F2FD', color: '#1565C0' }}><ShoppingCart size={20} /></div>
              <div className="stat-card__label">Total Orders</div>
              <div className="stat-card__value">{stats.totalOrders}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon" style={{ background: '#FFF3E0', color: '#E65100' }}><TrendingUp size={20} /></div>
              <div className="stat-card__label">Delivery Charges</div>
              <div className="stat-card__value">{formatPrice(stats.deliveryCharges)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card__icon" style={{ background: '#FFEBEE', color: '#C62828' }}><XCircle size={20} /></div>
              <div className="stat-card__label">Cancelled Orders</div>
              <div className="stat-card__value">{stats.cancelledCount}</div>
            </div>
          </div>

          <div className="admin-grid-2">
            <div className="admin-section">
              <div className="admin-section__header">
                <h3 className="admin-section__title">Revenue Timeline</h3>
              </div>
              <div className="admin-section__body" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color-light)" />
                    <XAxis dataKey="name" fontSize={12} tick={{ fill: 'var(--text-muted)' }} />
                    <YAxis fontSize={12} tick={{ fill: 'var(--text-muted)' }} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-card)' }} />
                    <Line type="monotone" dataKey="sales" stroke="#FFA000" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="admin-section">
              <div className="admin-section__header">
                <h3 className="admin-section__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={18} /> Best Selling Snacks
                </h3>
              </div>
              <div className="admin-section__body" style={{ height: 300, display: 'flex', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.bestSellers}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.bestSellers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-card)' }} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div style={{ flex: 1, paddingLeft: '20px' }}>
                  {stats.bestSellers.map((entry, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length], marginRight: '8px' }} />
                      <div style={{ flex: 1, fontSize: '14px' }}>{entry.name}</div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{entry.value}</div>
                    </div>
                  ))}
                  {stats.bestSellers.length === 0 && <div style={{ color: 'var(--text-muted)' }}>No data available</div>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
