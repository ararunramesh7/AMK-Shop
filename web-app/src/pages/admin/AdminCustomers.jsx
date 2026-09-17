import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { Search } from 'lucide-react';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="admin-section">
        <div className="admin-section__header">
          <h3 className="admin-section__title">Customers</h3>
          <div className="search-bar" style={{ maxWidth: '300px' }}>
            <Search size={16} className="search-bar__icon" />
            <input type="text" className="search-bar__input" placeholder="Search customers..." />
          </div>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>City</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}><div className="spinner spinner--sm" style={{ margin: '0 auto' }}/></td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>No customers found.</td></tr>
              ) : (
                customers.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.full_name || 'N/A'}</td>
                    <td>{c.phone || 'N/A'}</td>
                    <td>{c.city || 'N/A'}</td>
                    <td><span className={`badge ${c.role === 'admin' ? 'badge--primary' : ''}`}>{c.role}</span></td>
                    <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
